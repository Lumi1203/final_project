from rest_framework.permissions import BasePermission
from rest_framework import permissions

class IsExaminer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "examiner"

class IsTestTaker(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "testtaker"

class IsCreatorOrReadOnly(permissions.BasePermission):
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for any examiner
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions only for the creator
        return obj.examiner == request.user