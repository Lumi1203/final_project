from rest_framework import generics, permissions
from rest_framework.response import Response
from .serializers import RegisterSerializer, MeSerializer, ProfileSerializer
from .models import Profile
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import UserUpdateSerializer, PasswordChangeSerializer, PasswordResetRequestSerializer
from django.contrib.auth.tokens import default_token_generator
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from rest_framework.views import APIView
from django.conf import settings
from rest_framework import status
from .models import CustomUser
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class MeView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response(MeSerializer(request.user).data)

class MyProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return Profile.objects.get(user=self.request.user)
    
class UpdateMyDetailsView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserUpdateSerializer

    def get_object(self):
        return self.request.user

class UploadMyPhotoView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        profile = Profile.objects.get(user=request.user)
        file = request.FILES.get("photo")
        if not file:
            return Response({"detail": "No file provided. Use key 'photo'."}, status=400)

        profile.photo = file
        profile.save()
        return Response(ProfileSerializer(profile).data)

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ser = PasswordChangeSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        old_password = ser.validated_data["old_password"]
        new_password = ser.validated_data["new_password"]

        user = request.user
        if not user.check_password(old_password):
            return Response({"old_password": ["Old password is incorrect."]}, status=400)

        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password changed successfully."})

User = settings.AUTH_USER_MODEL


class PasswordResetRequestAPIView(APIView):

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Do not reveal that the email does not exist
            return Response({"detail": "If this email exists, a reset link has been sent."})

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        reset_link = f"http://localhost:5173/reset-password/{uid}/{token}/"

        # Send email via SendGrid
        subject = "Reset Your Password"
        message = f"Hi {user.username},\n\nUse this link to reset your password:\n{reset_link}\n\nIf you didn't request a password reset, ignore this email."
        send_mail(subject, message, None, [user.email])

        return Response({"detail": "If this email exists, a reset link has been sent."}, status=status.HTTP_200_OK)
    

class PasswordResetConfirmAPIView(APIView):
    """
    Confirm password reset with UID + token.
    """

    def post(self, request, uidb64, token):
        new_password = request.data.get("password")
        confirm_password = request.data.get("password2")

        if not new_password or not confirm_password:
            return Response(
                {"detail": "Both password fields are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_password != confirm_password:
            return Response(
                {"detail": "Passwords do not match."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response({"detail": "Invalid link."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        # Set new password
        user.set_password(new_password)
        user.save()

        return Response({"detail": "Password reset successfully."}, status=status.HTTP_200_OK)
    

