
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("<slug:username>/following", views.followingPage, name="following"),
    
    
    #API Routes
    path("follow/<str:username>", views.follow, name="follow"),
    path("edit", views.editPost, name="edit"),
    path("like/<int:id>", views.likePost, name="toggleLike"),
    path("comment/<int:id>", views.createComment, name="comment"),
    path("delete/<int:id>", views.deletePost, name="delete"),
    
    
    # Check last
    path("<slug:name>", views.profile, name="profile"),
]
