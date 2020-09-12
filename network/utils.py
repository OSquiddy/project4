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

def getRandomProfiles():
    randomProfiles = list(User.objects.all())
    randomProfiles = random.sample(randomProfiles, k=4)
    return randomProfiles