from django.urls import path
from .views import RegisterView, MeView, MyProfileView, UpdateMyDetailsView, UploadMyPhotoView, ChangePasswordView, PasswordResetRequestAPIView

urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("me/", MeView.as_view()),
    path("profile/", MyProfileView.as_view()),
    path("me/update/", UpdateMyDetailsView.as_view(), name="me_update"),
    path("profile/photo/", UploadMyPhotoView.as_view(), name="profile_photo"),
    path("password/change/", ChangePasswordView.as_view(), name="password_change"),
    path("auth/password/reset/", PasswordResetRequestAPIView.as_view(), name="password_reset_request"),
]
