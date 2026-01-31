from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuestionViewSet, start_quiz, submit_quiz, my_results, explain_incorrect

router = DefaultRouter()
router.register(r"questions", QuestionViewSet, basename="questions")

urlpatterns = [
    path("", include(router.urls)),
    path("quiz/start/", start_quiz),
    path("quiz/submit/", submit_quiz),
    path("results/mine/", my_results),
    path("ai/explain/", explain_incorrect),
]
