from flask import current_app as app, jsonify, request, render_template, send_from_directory
from flask_security import hash_password, auth_required, roles_required,roles_accepted, current_user, login_user # roles_accepted(for multiple roles) || login_user: loads user info into session after successful verification of email and password
from application.database import db
from application.models import User, Quiz, Subject, Chapter, Score
from werkzeug.security import check_password_hash, generate_password_hash  # generate_password_hash: hashes the password to store in database || check_password_hash : compares that hashed password with plain password
from datetime import datetime
from .utils import roles_list
from celery.result import AsyncResult
from .tasks import csv_report
import os
from application.cache_init import cache


# acts like an entry point in Vue CDN
@app.route('/',methods=['GET'])
def home():
    return render_template('index.html')


@app.route('/api/admin') # to differentiate between frontend routes (Vue Router) and backend routes : /api is added
@auth_required('token')  # kind of authentication is token || provided in the header of the request  || AUTHENTICATION
@roles_required('admin') # admin role is required for this route || AUTHORIZATION, RBAC
def admin_home():
    return {
        "message" : "admin logged in successfully"   # kinda acts like a dictionary not actual JSON
    }

# it will access only a specific user dashboard based on credentials || used for displaying name on user dashboard
@app.route('/api/home')
@auth_required('token')
@roles_accepted('user', 'admin')
def user_home():
    user=current_user # everytime succssful login there is entire user info stored in sessions and that info is stored as current_user
    return jsonify({  # converts to actual JSON
        "username":user.username,
        "email":user.email,
        "dob": str(user.dob),
        "qualification": user.qualification,
        "roles": roles_list(user.roles)
    })


# we are going to replicate /login?include_auth_token  || if correct it returns auth-token like in resources.py
@app.route('/api/login', methods=['POST'])
def user_login():
    body = request.get_json()
    email = body["email"]
    password = body["password"]

    if not email: # just like a normal try-catch block
        return jsonify({
            "message": "Email is required!"
        }), 400

    user = app.security.datastore.find_user(email=email)

    if user: # if user is present in the database
        if check_password_hash(user.password, password): # first parameter is the actual password stored in the database, second one is the password recieved from the form
            # if current_user:
            #     return jsonify({
            #     "message": "User already logged in!"
            # }), 400
            
            login_user(user)  # stores session info into cookies

            user_roles = roles_list(user.roles)  # list of objects cannot be converted to JSON therefore converting to list of strings

            return jsonify({
                "id": user.id,
                "username": user.username,
                "auth-token": user.get_auth_token(), # this function returns the auth-token
                "roles": user_roles 
            })
        
        else:
            return jsonify({
                "message": "Incorrect Password"
            }), 400
    else:
        return jsonify({
            "message": "User Not Found!"
        }), 404


@app.route('/api/register', methods=['POST'])  # we will get a JSON body so only POST request is handled at the backend
def create_user():
    credentials= request.get_json()  # credentials is a dictionary 
  
    # we are getting a "dob" value from the frontend as a string ("2004-03-24"), but SQLAlchemy (and SQLite) expect it as a Python date object.
    dob_string = credentials.get("dob")  # eg, '2004-03-24'
    dob = None
    if dob_string:
        dob = datetime.strptime(dob_string, "%Y-%m-%d").date()

    if not app.security.datastore.find_user(email=credentials["email"]):
        app.security.datastore.create_user(email=credentials["email"], username=credentials["username"], password=generate_password_hash(credentials["password"]), dob=dob, qualification=credentials.get("qualification"), roles=['user'])
        db.session.commit()
        return jsonify({
            "message": "User created successfully"
            }),201
    
    return jsonify({
        "message": "User already exists "
    }),400

# for managing users by ADMIN ONLY
@cache.cached(timeout=300, key_prefix='all_users') # cache the response for 5 minutes
@app.route('/api/users/get', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def get_users():
    users = User.query.all()
    user_list = []
    for user in users:
        user_list.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "qualification": user.qualification,
            "dob": str(user.dob),
            "roles": [role.name for role in user.roles]
        })
    return jsonify(user_list)

# for deleting users by ADMIN ONLY
@app.route('/api/users/delete/<int:user_id>', methods=['DELETE'])
@auth_required('token')
@roles_required('admin')
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully"}), 200

# search functionality for both admin and user
@app.route('/api/search')
@auth_required('token')
def search():
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify([])

    users = User.query.filter(User.username.ilike(f'%{query}%')).all()
    subjects = Subject.query.filter(Subject.name.ilike(f'%{query}%')).all()
    quizzes = Quiz.query.filter(Quiz.name.ilike(f'%{query}%')).all()

    user_results = []
    for u in users:
        user_results.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "dob": str(u.dob),
            "qualification": u.qualification,
            "roles": [r.name for r in u.roles]
        })

    subject_results = []
    for s in subjects:
        subject_results.append({
            "id": s.id,
            "name": s.name,
            "description": s.description,
            "category": s.category,
            "total_chapters": s.chapters.count()
        })

    quiz_results = []
    for q in quizzes:
        chapter = Chapter.query.get(q.chapter_id)
        quiz_results.append({
            "id": q.id,
            "name": q.name,
            "chapter_id": q.chapter_id,
            "chapter_name": chapter.name if chapter else "N/A",
            "date_of_quiz": str(q.date_of_quiz),
            "time_duration": q.time_duration,
            "remarks": q.remarks,
            "no_of_questions": q.no_of_questions
        })

    results = {
        "users": user_results,
        "subjects": subject_results,
        "quizzes": quiz_results
    }

    return jsonify(results)

# for getting the summary of scores of all quizzes by admin
@cache.cached(timeout=300, key_prefix='score_summary_admin')
@app.route('/api/scores/summary')
@auth_required('token')
@roles_required('admin')
def score_summary():
    quizzes = Quiz.query.all()
    summary = []

    for quiz in quizzes:
        scores = [score.total_scored for score in quiz.scores]
        avg_score = sum(scores) / len(scores) if scores else 0
        summary.append({
            "quiz_name": quiz.name,
            "average_score": round(avg_score, 2)
        })

    return jsonify(summary)

# for summary charts of users
@app.route('/api/user/quiz_summary', methods=['GET'])
@auth_required('token')
@roles_required('user')
def user_quiz_summary():
    scores = Score.query.filter_by(user_id=current_user.id).all()

    summary = []
    for score in scores:
        quiz = Quiz.query.get(score.quiz_id)
        if quiz:
            all_scores = [s.total_scored for s in quiz.scores]
            average_score = sum(all_scores) / len(all_scores) if all_scores else 0

            summary.append({
                "quiz_name": quiz.name,
                "user_score": score.total_scored,
                "average_score": round(average_score, 2),
                "max_score": quiz.no_of_questions
            })

    return jsonify({"summary": summary})


# --- BACKEND ROUTES-----

# trigger route for backend jobs || this manually triggers the job as it is user triggered
@auth_required('token')
@app.route('/api/export')
def export_csv():

    user_id = request.args.get("user_id", type=int)

    if not user_id:
        return {"error": "Missing user_id in request"}, 400
    
    result = csv_report.delay(user_id) # .delay() to make sure it is asynchronous job and is catched by worker || it returns an asynch object which has an id, success, etc.
    return jsonify({
        "id": result.id, # it returns an id which can be used to track the status of the job
        "result": result.result
    })

# created to test the status of result  
@auth_required('token')
@app.route('/api/csv_result/<id>') # it is the same id as above 
def csv_result(id):
    res = AsyncResult(id)
    if res.successful():
        filename = res.result
        file_path = os.path.join('static', filename)
        if os.path.exists(file_path):
            return send_from_directory('static', filename, as_attachment=True)  # downloads csv file from static to browser || Force download(as_attachment)
        else:
            return jsonify({"error": "CSV file not found."}), 404
    else:
        return jsonify({"error": "CSV generation failed or is still in progress."}), 400
