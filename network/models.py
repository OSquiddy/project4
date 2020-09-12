from django.contrib.auth.models import AbstractUser
from django.db import models

def new_filename(instance, filename):
        basename, extension = filename.split('.')
        return f"{instance.id}_{instance.username}.{extension}"

class User(AbstractUser):
    followers = models.ManyToManyField('self', blank=True, related_name="followersList", symmetrical=False)
    following = models.ManyToManyField('self', blank=True, related_name="followingList", symmetrical=False)
    profilePic = models.ImageField(upload_to=new_filename, null=True, blank=True)
    profilePicURL = models.URLField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.username}"
    
    def serialize(self):
        return {
            "id" : self.id,
            "username" : self.username,
            "first_name" : self.first_name,
            "last_name" : self.last_name,
            "followers" : [follower.username for follower in self.followers.all()],
            "following" : [following.username for following in self.following.all()],
            "profilePicURL" : self.profilePicURL,
            "description" : self.description
        }
        
    def followerCount(self):
        return len(self.followers.all())
    
    def followingCount(self):
        return len(self.following.all())

  
class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, related_name="posts")
    content = models.TextField()
    time = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, blank=True, related_name="postLikes")
    # comments = models.ManyToManyField(Comment, blank=True, related_name="post", symmetrical=False)
    ordering = ['-time']
    
    def comments(self):
        commentList = Comment.objects.all().filter(post=self)
        return commentList
    
    def allLikes(self):
        userList = list(self.likes.all())
        for i in range(len(userList)):
            userList[i] = userList[i].username
        return userList
    
    def serialize(self):
        return {
            "id" : self.id,
            "user" : self.user.serialize(),
            "content" : self.content,
            "likes" : len(self.allLikes()),
            "time" : self.time.strftime("%b %d %Y, %I:%M %p"),
        }
        
class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments")
    comment = models.TextField()
    time = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, blank=True, related_name="commentLikes", symmetrical=False)
    postID = models.IntegerField(blank=True, null=True)
    post = models.ForeignKey(Post, blank=True, null=True, on_delete=models.CASCADE, related_name="post")
    
    def allLikes(self):
        userList = list(self.likes.all())
        for i in range(len(userList)):
            userList[i] = userList[i].username
        return userList
    
    def __str__(self):
        return f"Comment by {self.user} on post {self.postID}: {self.comment}"
    
    def serialize(self):
        return {
            "id" : self.id,
            "user" : self.user.serialize(),
            "comment" : self.comment,
            "likes" : len(self.allLikes()),
            "post" : self.post.serialize(),
            "time" : self.time.strftime("%b %d %Y, %I:%M %p"),
        }