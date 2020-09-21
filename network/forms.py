from django.forms import ModelForm
from django import forms
from .models import User

class ImageUploadForm(ModelForm):
    class Meta:
        model = User
        fields = ['profilePic']
        
class DifferentImageUploadForm(forms.Form):
    image = forms.ImageField(label="Profile Picture: ")