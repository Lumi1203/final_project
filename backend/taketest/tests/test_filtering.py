from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from taketest.models import Category, Question

User = get_user_model()

class CategoryFilterTest(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.examiner = User.objects.create_user(
            username="examiner",
            password="pass123",
            role="examiner"
        )

        self.client.force_authenticate(user=self.examiner)

        self.history = Category.objects.create(name="History")
        self.science = Category.objects.create(name="Science")

        Question.objects.create(
            examiner=self.examiner,
            text="Who was Caesar?",
            option_a="Roman",
            option_b="Greek",
            option_c="Egyptian",
            option_d="Persian",
            correct_answer="A",
            category=self.history
        )

        Question.objects.create(
            examiner=self.examiner,
            text="What is H2O?",
            option_a="Salt",
            option_b="Water",
            option_c="Fire",
            option_d="Air",
            correct_answer="B",
            category=self.science
        )

    def test_filter_by_category(self):
        res = self.client.get("/api/questions/?search=Caesar")
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]["category"]["name"], "History")
