from rest_framework import serializers
from .models import Question, TestResult

class QuestionExaminerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = "__all__"
        read_only_fields = ["examiner", "created_at"]

class QuestionTakerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ["id", "text", "option_a", "option_b", "option_c", "option_d"]

class TestResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestResult
        fields = ["id", "score", "total_questions", "date_taken"]

class SubmitAnswerItemSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    answer = serializers.ChoiceField(choices=["A", "B", "C", "D"])

class SubmitQuizSerializer(serializers.Serializer):
    answers = SubmitAnswerItemSerializer(many=True)

class ExplainIncorrectSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    my_answer = serializers.ChoiceField(choices=["A", "B", "C", "D"])
