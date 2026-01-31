from rest_framework import serializers
from .models import Question, TestResult, Category
from django.contrib.auth import get_user_model

User = get_user_model()

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class QuestionExaminerSerializer(serializers.ModelSerializer):
    examiner_name = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True,
        required=False,
    )

    class Meta:
        model = Question
        fields = "__all__"
        read_only_fields = ["examiner", "created_at"]

    def get_examiner_name(self, obj):
        return f"{obj.examiner.first_name} {obj.examiner.last_name}"


class QuestionTakerSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Question
        fields = ["id", "text", "option_a", "option_b", "option_c", "option_d", "category"]

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
