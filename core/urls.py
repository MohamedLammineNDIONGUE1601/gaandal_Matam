from django.urls import path
from . import views
urlpatterns = [
    path("", views.index, name="index"),
    path("connexion/", views.login_view, name="login"),
    path("inscription/", views.signup_view, name="signup"),
    path("deconnexion/", views.logout_view, name="logout"),
    path("api/chat/", views.chat_api, name="chat"),
]
