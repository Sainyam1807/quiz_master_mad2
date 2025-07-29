from celery import shared_task # to get access to same celery object in app.py
import time 
import datetime
import csv
from application.models import User, Score, Quiz, Chapter, Subject
from flask import current_app
from .utils import format_report 
from .mail import send_email  # function to send email
import requests # python library to GET or POST data to a URL || similar to fetch API in Vue

 
 
@shared_task(ignore_results=False, name="download_csv_report")  # does not ignore the results from the workers and store them 
def csv_report(user_id):
    user = User.query.get(user_id)
    if not user:
        return f"User with ID {user_id} not found."

    # Generate filename
    timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    csv_file_name = f"quizzes_{timestamp}.csv"  # file name 

    # if there is no file with this name it will create one 
    with open(f'static/{csv_file_name}', 'w', newline='') as csvfile:
        writer = csv.writer(csvfile) # writes rows in the file 
        writer.writerow(['Quiz ID', 'Quiz Name', 'Chapter ID', 'Chapter Name',  # creates heading of the file 
                         'Subject ID', 'Subject Name', 'Date of Quiz', 'Score', 'Percentage'])

        for score in user.scores:
            quiz = score.quiz # fetches the quiz object from score 
            chapter = quiz.chapter if quiz else None
            subject = chapter.subject if chapter else None

            total_questions = quiz.no_of_questions if quiz else 0
            total_score = score.total_scored
            percentage = round((total_score / total_questions) * 100, 2) if total_questions > 0 else 0
            score_str = f"{total_score}/{total_questions}" if total_questions > 0 else "0/0"

            writer.writerow([
                quiz.id if quiz else '',
                quiz.name if quiz else '',
                chapter.id if chapter else '',
                chapter.name if chapter else '',
                subject.id if subject else '',
                subject.name if subject else '',
                quiz.date_of_quiz.strftime('%Y-%m-%d') if quiz else '',
                score_str,
                f"{percentage}%"
            ])

    return csv_file_name

@shared_task(ignore_results=False, name="monthly_report")
def monthly_report():
    users = User.query.all()

    for user in users[1:]: # Skipping the first user (admin) for report generation
        user_data = {
            'username': user.username,
            'email': user.email,
            'quizzes': []
        }

        total_score = 0
        total_quizzes = 0

        for score in user.scores:
            quiz = score.quiz
            if not quiz:
                continue

            chapter = quiz.chapter
            subject = chapter.subject if chapter else None

            quiz_data = {
                'quiz_name': quiz.name,
                'chapter_name': chapter.name if chapter else "N/A",
                'subject_name': subject.name if subject else "N/A",
                'date_of_quiz': score.time_stamp_of_attempt.strftime("%Y-%m-%d"),
                'total_questions': quiz.no_of_questions,
                'score': score.total_scored
            }

            user_data['quizzes'].append(quiz_data) # creating a dictionary data

            total_score += score.total_scored
            total_quizzes += 1

        user_data['total_quizzes'] = total_quizzes
        user_data['average_score'] = '{:.2f}'.format(total_score / total_quizzes if total_quizzes > 0 else 0)    

        message = format_report('templates/mail_details.html', user_data) 

        send_email( # linked to mail.py function
            user.email,
            subject="Monthly Quiz Activity Report - QuizMaster",
            message=message,
            content="html"
        )

    return "Monthly reports sent"

 
@shared_task(ignore_results=False, name="new_quiz_report")
def new_quiz_report():
    webhook_url = "https://chat.googleapis.com/v1/spaces/AAQAXdZyERo/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=zk2_YAZXdNF7LMSQVw9qEI_lQ9TCwqGI8oogz3v-4w8"

    users = User.query.all()
    for user in users[1:]:  # Skip admin
        attempted_quiz_ids = {score.quiz_id for score in user.scores}
        all_quiz_ids = {quiz.id for quiz in Quiz.query.all()}
        
        # Only send reminder if some quizzes are left
        pending_quiz_ids = all_quiz_ids - attempted_quiz_ids # this will give the quizzes that are not attempted by the user
        if not pending_quiz_ids:
            continue

        pending_quizzes = Quiz.query.filter(Quiz.id.in_(pending_quiz_ids)).all() # fetches all the quizzes that are not attempted by the user
        quiz_names = [quiz.name for quiz in pending_quizzes]
        quiz_list = "\n".join(f"- {name}" for name in quiz_names) # creates a list of quizzes in string format

        text = f""" Hi {user.username},

You have new quizzes waiting! 

Quizzes you haven't attempted yet:
{quiz_list}

Don't forget to attempt them today in QuizMaster! """

        try:
            requests.post( # order is important
                webhook_url,
                headers={"Content-Type": "application/json"},
                json={"text": text}
            )
        except Exception as e:
            print(f"Failed to send message to {user.username}: {e}")

    return "Reminders sent to users with pending quizzes."