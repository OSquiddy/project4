from .models import User, Comment, Post
import random

def createPost(user, content):
    post = Post.objects.create(user=user, content=content)
    post.save()
    
def sortByTime(postsList):
    postsList.sort(key=returnTime, reverse=True)
    return postsList

def returnTime(post):
    return post.time

def getRandomProfiles(user):
    randomProfiles = list(User.objects.all().exclude(id=user.id))
    randomProfiles = random.sample(randomProfiles, k=4)
    return randomProfiles