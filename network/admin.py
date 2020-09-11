from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User, Post, Comment
# Register your models here.

class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'password']
    
class PostAdmin(admin.ModelAdmin):
    list_display = ['user', 'content', 'time']
    filter_horizontal = ['likes']

class CommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'comment', 'time']
    readonly_fields = ['postID']




admin.site.register(User, UserAdmin)
admin.site.register(Post, PostAdmin)
admin.site.register(Comment, CommentAdmin)