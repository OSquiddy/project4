from .models import User, Comment, Post

def createPost(user, content):
    post = Post.objects.create(user=user, content=content)
    post.save()
    
def sortByTime(postsList):
    postsList.sort(key=returnTime, reverse=True)
    return postsList

def returnTime(post):
    return post.time