# Final Project: QualifylingTest

# # https://final-project-frontend-0f8o.onrender.com
  -- Frontend Render URL

# # https://final-project-zv1s.onrender.com
  -- Backend Render URL

## Overview

This is a **React + Django REST Framework application** for managing an online question bank. Examiners can **add, edit, delete, and filter questions by category**, while **test takers** can view questions while taking tests. It supports **user authentication** and **role-based access**, ensuring only the examiner who created a question can modify it.

---

## Features

- **User Authentication**
  - Login, registration, and logout
  - Role-based access control

- **Question Management**
  - Add, edit, and delete questions
  - Multiple choice options (A-D)
  - Correct answer selection

- **Category Management**
  - Questions can be categorized
  - Filter questions by category
  - Admin can add/manage categories

- **Search Functionality**
  - Search questions by text

- **Responsive UI**
  - Built with React
  - Clean and intuitive layout

- **AI Powered Explanation to Questions**
  - Using OpenAI API

---

## Tech Stack

- **Frontend**: React.js, React Router, Axios  
- **Backend**: Django, Django REST Framework  
- **Database**: SQLite / PostgreSQL (configurable)  
- **Authentication**: Token-based authentication  

---

## Usage
Login/Register as an examiner or test taker.

Examiners can:
Add new questions
Edit or delete questions they created
Filter questions by category

Test takers can take a test, get instant results and AI powered explanation to failed questions.

## Tests
Django tests are included in taketest/tests/.