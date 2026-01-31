from django.contrib import admin
from .models import Question, TestResult, Category

# Register your models here
admin.site.register(Question)
admin.site.register(TestResult)
admin.site.register(Category)
