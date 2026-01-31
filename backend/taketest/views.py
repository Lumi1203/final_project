import random
from django.conf import settings
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from openai import OpenAI  # OpenAI SDK (server-side)

from .models import Question, TestResult
from .serializers import (
    QuestionExaminerSerializer,
    QuestionTakerSerializer,
    TestResultSerializer,
    SubmitQuizSerializer,
    ExplainIncorrectSerializer,
)
from .permissions import IsExaminer, IsTestTaker


class QuestionViewSet(viewsets.ModelViewSet):
    """
    Examiner CRUD for their own question bank.
    """
    serializer_class = QuestionExaminerSerializer
    permission_classes = [IsExaminer]

    def get_queryset(self):
        return Question.objects.filter(examiner=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(examiner=self.request.user)


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
    random.shuffle(selected)  # extra shuffle
    return Response({"questions": QuestionTakerSerializer(selected, many=True).data})


@api_view(["POST"])
@permission_classes([IsTestTaker])
def submit_quiz(request):
    """
    Grades answers server-side, stores TestResult.
    """
    serializer = SubmitQuizSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    answers = serializer.validated_data["answers"]
    q_ids = [item["question_id"] for item in answers]
    questions = {q.id: q for q in Question.objects.filter(id__in=q_ids)}

    score = 0
    total = 0
    incorrect = []  # return incorrect question IDs (for UI)

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

    # Build a compact context for the model
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

    # OpenAI Responses API (recommended for new projects) :contentReference[oaicite:8]{index=8}
    resp = client.responses.create(
        model=getattr(settings, "OPENAI_MODEL", "gpt-4o-mini"),
        input=prompt,
    )

    return Response({"explanation": resp.output_text})
