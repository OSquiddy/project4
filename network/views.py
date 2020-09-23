from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator
from django.db.models import Q
from collections import defaultdict
import json

from .models import User, Post, Comment
from .forms import ImageUploadForm
from . import utils


def index(request):
    user = request.user
    print(user)
    print("GET Request has been called")
    if not user.is_authenticated:
        return HttpResponseRedirect(reverse("login"))
    postsList = Post.objects.order_by("-time").all()
    paginator = Paginator(postsList, 10)
    page_number =  request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    # Randomly selected profiles
    pYouMayKnow = utils.getRandomProfiles(user)
    pAlsoViewed = utils.getRandomProfiles(user)
    
    if request.method == 'POST':
        print("POST request has been called")
        data = json.loads(request.body)
        content = data.get("content","")
        post = utils.createPost(user, content)
        return JsonResponse({"message" : "Comment created",
                             "post" : post.serialize(),
                             }, status=200, safe=False)
    return render(request, "network/index.html", {
        "postsList" : postsList,
        "page_obj" : page_obj,
        "pYouMayKnow" : pYouMayKnow,
        "pAlsoViewed" : pAlsoViewed
    })

    
def profile(request, name):
    user = request.user
    if not user.is_authenticated:
        return HttpResponseRedirect(reverse("login"))
    profile = User.objects.get(username=name)
    userFollowingList = user.following.all()
    profileFollowingList = profile.following.all()
    profileFollowersList = profile.followers.all()
    followedStatus = False
    # Alternate method, in case I forget
    # Use get() method on the QuerySet returned by user.following.all() to directly get the profile
    # If it returns a profile, make followedStatus = True, else do nothing.
    try:
        followedProfile = userFollowingList.get(id=profile.id)
        print("You follow this person")
        followedStatus = True
    except User.DoesNotExist:
        pass
    # All posts by the profile
    postsList = Post.objects.filter(user=profile.id).order_by("-time")
    paginator = Paginator(postsList, 10)
    page_number =  request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    likers = [post.serialize() for post in postsList]
    # print("Likers are = ", likers)
    x = defaultdict(list)
    for post in postsList:
        d = post.serialize()
        x[d["id"]].append(d["likers"])
    # print(x)
    # Randomly selected profiles
    pYouMayKnow = utils.getRandomProfiles(user)
    pAlsoViewed = utils.getRandomProfiles(user)
    
    # Form to upload image
    form = ImageUploadForm()
    if request.method == "POST":
        form = ImageUploadForm(request.POST, request.FILES, instance=user)
        if form.is_valid():
            form.save()
        print(request.FILES, request.POST)
    
    return render(request, "network/profile.html", {
        "profile" : profile,
        "followedStatus" : followedStatus,
        "postsList" : postsList,
        "page_obj" : page_obj,
        "pFollowingList" : profileFollowingList,
        "pFollowersList" : profileFollowersList,
        "likers" : likers,
        "pYouMayKnow" : pYouMayKnow,
        "pAlsoViewed" : pAlsoViewed,
        "form" : form
    })

@login_required
def followingPage(request, username):
    user = request.user
    if not user.is_authenticated:
        return HttpResponseRedirect(reverse("login"))
    profileFollowingList = user.following.all()
    postsList = []
    for profile in profileFollowingList:
        posts = Post.objects.all().filter(user=profile)
        for post in posts:
            postsList.append(post)
    postsList = utils.sortByTime(postsList)
    paginator = Paginator(postsList, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    x = defaultdict()
    if len(postsList) == 0:
        return HttpResponseRedirect(reverse('index'))
    for post in postsList:
        d = post.serialize()
        # x[d["id"]].append(d["likers"])
    # Randomly selected profiles
    pYouMayKnow = utils.getRandomProfiles(user)
    pAlsoViewed = utils.getRandomProfiles(user)
    
    return render(request, "network/following.html", {
        "postsList" : postsList,
        "page_obj" : page_obj,
        "pYouMayKnow" : pYouMayKnow,
        "pAlsoViewed" : pAlsoViewed
    })
    
def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        first_name = request.POST["first_name"]
        last_name = request.POST["last_name"]
        
        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create(first_name=first_name, last_name=last_name, username=username, email=email, password=password )
            password = user.set_password(raw_password=password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
    

@login_required
def follow(request, username):
    print("Username is : ",username)
    user = request.user
    data = json.loads(request.body)
    buttonValue = data.get("buttonValue", "")
    print(user)
    try:
        followTarget = User.objects.get(username=username)
    except User.DoesNotExist:
        followTarget = User.objects.get(username=username[0].lower()+username[1:])
    if (buttonValue == 'Follow'):
        if followTarget == user:
            return JsonResponse({"error" : "You cannot follow yourself"}, status=400)
        
        followTarget.followers.add(user)
        user.following.add(followTarget)
        return JsonResponse({ "message": "Followed successfully", "user" : user.serialize() }, status=200)
    elif buttonValue == 'Unfollow':
        followTarget.followers.remove(user)
        user.following.remove(followTarget)
        return JsonResponse({"message" : "Unfollowed successfully", "user" : user.serialize() }, status=200)

def editPost(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        content = data.get("content", "")
        item = data.get("item", "")
        id = data.get("id", "")
        
        if item == 'post':
            try:
                post = Post.objects.get(id=id)
                post.content = content
                post.save()
            except Post.DoesNotExist :
                print("Post does not exist")
                return JsonResponse({"error" : "Couldn't find post"}, status=404)
            return JsonResponse({"message" : f"Post No. {id} edited successfully"}, status=200)
        elif item == 'comment':
            try:
                comment = Comment.objects.get(id=id)
                comment.comment = content
                comment.save()
            except Comment.DoesNotExist:
                return JsonResponse({"error" : "Couldn't find comment"}, status=404)
            return JsonResponse({"message" : f"Comment No. {id} edited successfully"}, status=200)
    
def likePost(request, id):
    user = request.user
    data = json.loads(request.body)
    item = data.get("item", "")
    status = data.get("status", "")
    
    if item == 'post':
        post = Post.objects.get(id=id)        
        print("Content is ", status)
        if status == 'Like':
            post.likes.add(user)
            post.save()
            return JsonResponse({"message": f"{user} has liked Post No. {id}"}, status=200)
        else:
            post.likes.remove(user) 
            post.save()
            return JsonResponse({"message": f"{user} has unliked Post No. {id}"}, status=200)
        
    elif item == 'comment':
        comment = Comment.objects.get(id=id)
        if status == 'Like':
            comment.likes.add(user)
            comment.save()
            return JsonResponse({"message" : f"{user} has liked Comment No. {id}"}, status=200)
        else:
            comment.likes.remove(user)
            comment.save()
            return JsonResponse({"message" : f"{user} has unliked Comment No. {id}"}, status=200)
        
    else :
        return JsonResponse({"error" : "The item is neither post nor comment"}, status=500)
    
def deletePost(request, id):
    user = request.user
    data = json.loads(request.body)
    itemType = data.get("item", "")
    if itemType == 'post':
        item = Post.objects.get(id=id)
    elif itemType == 'comment':
        item = Comment.objects.get(id=id)
    confirmation = data.get("confirmation", "")
    if confirmation == 'YES':
        item.delete()
        return JsonResponse({"message" : f"{itemType.capitalize()} No. {id} has been deleted successfully"
                             }, status=200)
    else:
        return JsonResponse({"message" : f"You have decided not to delete {itemType.capitalize()} No. {id}"}, status=200)

def createComment(request, id):
    user = request.user
    post = Post.objects.get(id=id)
    data = json.loads(request.body)
    content = data.get("content")
    comment = Comment.objects.create(user=user, comment=content, postID=id, post=post)
    comment.save()
    return JsonResponse({
        "message" : f"{user} has commented on Post No. {id}",
        "comment" : comment.serialize()
        }, status=201)

@login_required
def deleteProfilePic(request):
    user = request.user
    user.profilePic.delete(save=True)
    user.save()
    return JsonResponse({"message" : "Default profile picture set"}, status=200)

@login_required
def description(request):
    user = request.user
    if request.method == "POST":
        data = json.loads(request.body)
        description = data.get("description", "")
        user.description = description
        user.save()
        return JsonResponse({
            "message" : "Description added successfully",
            "description" : description
                            }, status=200)
    else:
        return JsonResponse({"error" : "Page cannot be accessed through get request"}, status=405)
        
@login_required
def uploadPage(request):
    user = request.user
    # Form to upload image
    form = ImageUploadForm()
    if request.method == "POST":
        form = ImageUploadForm(request.POST, request.FILES, instance=user)
        if form.is_valid():
            form.save()
        print(request.FILES, request.POST)
        return render(request, "network/upload.html", {
            "form" : form
        })
    return render(request, "network/upload.html", {
            "form" : form,
            "discard" : True
        })

def api(request):
    user = request.user
    postsList = Post.objects.all().filter(user=3)
    return JsonResponse({"posts" : [post.serialize() for post in postsList]}, status=200)   

def getLikers(request, id, item):
    user = request.user
    print(request.GET)
    print("item = ", item)
    item = item
    if item == 'post':
        post = Post.objects.get(id=id)
        postInfo = post.serialize()
        likers = postInfo["likers"]
    if item == 'comment':
        comment = Comment.objects.get(id=id)
        commentInfo = comment.serialize()
        likers = commentInfo["likers"]
    return JsonResponse({"likers": likers}, status=200) 