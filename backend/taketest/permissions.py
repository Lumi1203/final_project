from rest_framework.permissions import BasePermission

class IsExaminer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "examiner"

class IsTestTaker(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "testtaker"
