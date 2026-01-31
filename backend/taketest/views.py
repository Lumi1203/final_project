import random
from django.conf import settings
from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated


from openai import OpenAI

from .models import Question, TestResult, Category
from .serializers import (
    QuestionExaminerSerializer,
    QuestionTakerSerializer,
    TestResultSerializer,
    SubmitQuizSerializer,
    ExplainIncorrectSerializer,
    CategorySerializer,
     
)
from .permissions import IsExaminer, IsTestTaker, IsCreatorOrReadOnly

User = get_user_model()


class QuestionViewSet(viewsets.ModelViewSet):
    """
    Examiner CRUD for the Question Bank.
    Shows all questions to all examiners, but allows edit/delete only to the creator.
    Supports search by text or category.
    """
    queryset = Question.objects.all().order_by("-created_at")
    serializer_class = QuestionExaminerSerializer
    permission_classes = [IsExaminer]
    filter_backends = [filters.SearchFilter]
    search_fields = ["text", "category__name", "examiner__first_name", "examiner__last_name"]
    ordering_fields = ["created_at", "examiner__first_name"]

    def get_queryset(self):
        return Question.objects.select_related("examiner", "category").all().order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(examiner=self.request.user)

    def update(self, request, *args, **kwargs):
        question = self.get_object()
        if question.examiner != request.user:
            return Response({"detail": "You can only edit your own questions."}, status=403)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        question = self.get_object()
        if question.examiner != request.user:
            return Response({"detail": "You can only delete your own questions."}, status=403)
        return super().destroy(request, *args, **kwargs)


@api_view(["GET"])
@permission_classes([IsTestTaker])
def start_quiz(request):
    """
    Get N random questions from the bank, shuffled.
    Does NOT return correct_answer.
    """
    try:
        n = int(request.query_params.get("n", 10))
    except ValueError:
        n = 10

    all_questions = list(Question.objects.all())
    if not all_questions:
        return Response({"detail": "No questions available."}, status=404)

    selected = random.sample(all_questions, k=min(n, len(all_questions)))
    random.shuffle(selected)
    return Response({"questions": QuestionTakerSerializer(selected, many=True).data})


@api_view(["POST"])
@permission_classes([IsTestTaker])
def submit_quiz(request):
    serializer = SubmitQuizSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    answers = serializer.validated_data["answers"]
    q_ids = [item["question_id"] for item in answers]
    questions = {q.id: q for q in Question.objects.filter(id__in=q_ids)}

    score = 0
    total = 0
    incorrect = []

    for item in answers:
        qid = item["question_id"]
        ans = item["answer"]
        q = questions.get(qid)
        if not q:
            continue
        total += 1
        if q.correct_answer == ans:
            score += 1
        else:
            incorrect.append(qid)

    result = TestResult.objects.create(
        user=request.user,
        score=score,
        total_questions=total,
    )

    return Response(
        {
            "result_id": result.id,
            "score": score,
            "total_questions": total,
            "incorrect_question_ids": incorrect,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def my_results(request):
    qs = TestResult.objects.filter(user=request.user).order_by("-date_taken")
    return Response(TestResultSerializer(qs, many=True).data)


@api_view(["POST"])
@permission_classes([IsTestTaker])
def explain_incorrect(request):
    if not settings.OPENAI_API_KEY:
        return Response({"detail": "OpenAI API key not configured on server."}, status=500)

    ser = ExplainIncorrectSerializer(data=request.data)
    ser.is_valid(raise_exception=True)

    qid = ser.validated_data["question_id"]
    my_answer = ser.validated_data["my_answer"]

    try:
        q = Question.objects.get(id=qid)
    except Question.DoesNotExist:
        return Response({"detail": "Question not found."}, status=404)

    prompt = f"""
You are a helpful tutor. Explain why the correct option is correct and why the student's chosen option is incorrect.
Keep it short (6-10 sentences), clear, and beginner-friendly. No markdown.

Question: {q.text}

A) {q.option_a}
B) {q.option_b}
C) {q.option_c}
D) {q.option_d}

Student chose: {my_answer}
Correct answer: {q.correct_answer}
"""

    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    resp = client.responses.create(
        model=getattr(settings, "OPENAI_MODEL", "gpt-4o-mini"),
        input=prompt,
    )

    return Response({"explanation": resp.output_text})


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
    permission_classes = [IsExaminer]


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    """
    Return info about the currently logged-in user
    """
    return Response({
        "id": request.user.id,
        "first_name": request.user.first_name,
        "last_name": request.user.last_name,
        "username": request.user.username,
        "role": getattr(request.user, "role", None),
    })