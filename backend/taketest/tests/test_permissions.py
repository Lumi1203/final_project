from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from taketest.models import Category

User = get_user_model()

class QuestionPermissionTest(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.examiner = User.objects.create_user(
            username="examiner1",
            password="pass123",
            role="examiner"
        )

        self.taker = User.objects.create_user(
            username="taker1",
            password="pass123",
            role="testtaker"
        )

        self.category = Category.objects.create(name="History")

    def test_examiner_can_create_question(self):
        self.client.force_authenticate(user=self.examiner)

        res = self.client.post("/api/questions/", {
            "text": "2+2?",
            "option_a": "3",
            "option_b": "4",
            "option_c": "5",
            "option_d": "6",
            "correct_answer": "B",
            "category": self.category.id
        })

        self.assertEqual(res.status_code, 201)

    def test_testtaker_cannot_create_question(self):
        self.client.force_authenticate(user=self.taker)

        res = self.client.post("/api/questions/", {
            "text": "Hacked?",
            "option_a": "Yes",
            "option_b": "No",
            "option_c": "Maybe",
            "option_d": "Later",
            "correct_answer": "A",
            "category": self.category.id
        })

        self.assertEqual(res.status_code, 403)
