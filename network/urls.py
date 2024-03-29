
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("<str:username>/following", views.followingPage, name="following"),
    path("upload", views.uploadPage, name="uploadImage"),
    
    
    #API Routes
    path("follow/<str:username>", views.follow, name="follow"),
    path("edit", views.editPost, name="edit"),
    path("like/<int:id>", views.likePost, name="toggleLike"),
    path("comment/<int:id>", views.createComment, name="comment"),
    path("delete/<int:id>", views.deletePost, name="delete"),
    path("delpic", views.deleteProfilePic, name="delPic"),
    path("description", views.description, name="description"),
    path("api", views.api),
    path("g/likers/<int:id>/i=<str:item>", views.getLikers),
    
    # Check last
    path("<str:name>", views.profile, name="profile"),
]

