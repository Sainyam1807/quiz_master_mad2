from flask import request
from flask_restful import Api, Resource, reqparse
from .models import *
from flask_security import auth_required, roles_required, roles_accepted, current_user
from datetime import datetime
from .utils import roles_list


api=Api()

# subject parser
subject_parser=reqparse.RequestParser() # deals with request body in restful  || for /create endpoints  || used to safely parse and validate incoming request data
subject_parser.add_argument("name") # tells which attributes can be passed in the request body
subject_parser.add_argument("description")
subject_parser.add_argument("category")

# chapter parser
chapter_parser = reqparse.RequestParser()
chapter_parser.add_argument("name")
chapter_parser.add_argument("description") 
chapter_parser.add_argument("subject_id")

# quiz parser
quiz_parser = reqparse.RequestParser()
quiz_parser.add_argument("name", type=str)
quiz_parser.add_argument("no_of_questions", type=int)
quiz_parser.add_argument("chapter_id", type=int)
quiz_parser.add_argument("date_of_quiz", type=str)
quiz_parser.add_argument("time_duration", type=str)
quiz_parser.add_argument("remarks", type=str) 

# question parser
question_parser = reqparse.RequestParser()
question_parser.add_argument("quiz_id", type=int)
question_parser.add_argument("question_statement", type=str)
question_parser.add_argument("option1", type=str)
question_parser.add_argument("option2", type=str)
question_parser.add_argument("option3", type=str)
question_parser.add_argument("option4", type=str)
question_parser.add_argument("correct_option", type=int)



class SubjectApi(Resource):

    @auth_required('token')
    @roles_accepted('admin', 'user')  # both user and admin can see all subjects 
    def get(self):
        subjects = Subject.query.all() # this gives list of objects  [<>,<>,<>]
        subjects_json = []  # we want [{},{}]

        for subject in subjects:
            this_subject = {}
            this_subject["id"] = subject.id
            this_subject["name"] = subject.name
            this_subject["description"] = subject.description
            this_subject["category"] = subject.category
            subjects_json.append(this_subject)  

        if subjects_json:
            return subjects_json   # returns the subject list
        
        return {
            "message": "No subjects found"
        }, 404
    
    #creating the subject by admin only
    @auth_required('token')
    @roles_required('admin')
    def post(self):
        try:
            data = request.get_json()  #  Use this instead of reqparse
            
            if not data or not data.get("name") or not data.get("category"):
                return {"message": "Required fields missing"}, 400
            subject = Subject(
                name=data["name"],
                description=data.get("description", ""),
                category=data["category"]
            )
            db.session.add(subject)
            db.session.commit()
            return {"message": "Subject created successfully!"}, 201
        except Exception as e:
            return {"message": "Failed to create subject", "error": str(e)}, 400

   
    # updating the subject
    @auth_required('token')
    @roles_required('admin') 
    def put(self, subject_id):
        args = subject_parser.parse_args()  # this is a dictionary
        subject = Subject.query.get(subject_id) # this is an object
        if not subject:
            return {"message": "Subject not found"}, 404
        
        # to check whether only one of the fields are there and update them only
        if args["name"]:
            subject.name = args["name"]
        if args["description"]:
            subject.description = args["description"]
        if args["category"]:
            subject.category = args["category"]
        db.session.commit()

        return {
            "message": "Subject updated successfully!"
        }, 200
    
    # deleting a subject
    @auth_required('token')
    @roles_required('admin')  
    def delete(self, subject_id):
        subject = Subject.query.get(subject_id)
        
        if subject:
            db.session.delete(subject)
            db.session.commit()
            return {
                "message": "Subject deleted successfully!"
            }, 200
        else:
            return {
                "message": "Subject not found!"
            }, 404


class ChapterApi(Resource):
    @auth_required('token')
    @roles_accepted('admin', 'user')
    def get(self):
        # this is a query parameter used to filter resources 
        subject_id = request.args.get('subject_id')  # a user can only see the chapters for a particular subject that he has selected which is passed as a query parameter
        
        if subject_id:
            chapters = Chapter.query.filter_by(subject_id=subject_id).all()
        else:
            if "admin" in roles_list(current_user.roles):  # if admin is present then he can view all gthe chapters
                chapters = Chapter.query.all()
            else:
                return {"message": "Subject ID is required"}, 400

        chapters_json = []
        for chapter in chapters:
            chapters_json.append({
                "id": chapter.id,
                "name": chapter.name,
                "description": chapter.description,
                "subject_id": chapter.subject_id,
                "total_quizzes": chapter.quizzes.count()  # when count() is called, a live query takes place in database everytime
            })

        
        return chapters_json
        
    
    #creating the chapters
    @auth_required('token')
    @roles_required('admin') 
    def post(self):
        args = chapter_parser.parse_args()

        try:
            chapter = Chapter(
                name=args["name"],
                description=args.get("description", ""), 
                subject_id=args["subject_id"],
                total_quizzes=0  
            )

            db.session.add(chapter)  
            db.session.commit()

            return {
                "message": "Chapter created successfully!"
            }, 201

        except Exception as e:
            print("Error in creating quiz:", e)
            return {
                "message": "Failed to create quiz",
                "error": str(e)
            }, 400

        
    # updating chapters by admin    
    @auth_required('token')
    @roles_required('admin') 
    def put(self, chapter_id): # chapter id is a path parameter || 	identifies a specific resource and performs update, delete
        args = chapter_parser.parse_args()
        chapter = Chapter.query.get(chapter_id)

        if not chapter:
            return {"message": "Chapter not found"}, 404

        if args["name"]:
            chapter.name = args["name"]
        if args["description"]:
            chapter.description = args["description"]
        if args["subject_id"]:
            chapter.subject_id = args["subject_id"]

        db.session.commit()

        return {"message": "Chapter updated successfully!"}, 200
    
    # deleting a chapter
    @auth_required('token')
    @roles_required('admin')  
    def delete(self, chapter_id):
        chapter = Chapter.query.get(chapter_id)
        
        if chapter:
            db.session.delete(chapter)
            db.session.commit()
            return {
                "message": "Chapter deleted successfully!"
            }, 200
        else:
            return {
                "message": "Chapter not found!"
            }, 404


    
class QuizApi(Resource):
    @auth_required('token')
    @roles_accepted('admin', 'user')
    def get(self):
        chapter_id = request.args.get('chapter_id')
        quizzes = []
        if "admin" in roles_list(current_user.roles):
            quizzes = Quiz.query.all()

        elif chapter_id:
            quizzes = Quiz.query.filter_by(chapter_id=chapter_id).all()
        else:
            return {"message": "Chapter ID is required"}, 400

        quizzes_json = []
        for quiz in quizzes:
            quizzes_json.append({
                "id": quiz.id,
                "chapter_id": quiz.chapter_id,
                "name": quiz.name,
                "no_of_questions": quiz.no_of_questions,
                "date_of_quiz": str(quiz.date_of_quiz),  # str conversion is required as flask/JSON can't directly serialize python date or datetime objects into JSON.
                "time_duration": quiz.time_duration,
                "remarks": quiz.remarks
            })

        if quizzes_json:
            return quizzes_json
        return {"message": "No quizzes found"}, 404  

    # creating the quizzes
    @auth_required('token')
    @roles_required('admin')  
    def post(self):
        args = quiz_parser.parse_args()

        try:
            date_obj = datetime.strptime(args["date_of_quiz"], "%Y-%m-%d").date() # model needs DateTime object to store this field and we are providing it as a string "2025-03-25" so conversion is required 

            quiz = Quiz(
                name=args["name"],
                no_of_questions=args.get("no_of_questions", 0), # 0 is the default value
                chapter_id=args["chapter_id"],
                date_of_quiz=date_obj,        
                time_duration=args["time_duration"],       
                remarks=args.get("remarks", "") # default is empty string
            )

            db.session.add(quiz)
            db.session.commit()

            return {
                "message": "Quiz created successfully!"
            }, 201

        except Exception as e:
            return {
                "message": "Failed to create quiz"
            }, 400

    # updating the quiz
    @auth_required('token')
    @roles_required('admin') 
    def put(self, quiz_id):
        args = quiz_parser.parse_args()
        quiz = Quiz.query.get(quiz_id)

        if not quiz:
            return {"message": "Quiz not found"}, 404
        
        if args["name"]:
            quiz.name = args["name"]
        if args["no_of_questions"] is not None:
            quiz.no_of_questions = args["no_of_questions"]
        if args["chapter_id"]:
            quiz.chapter_id = args["chapter_id"]
        if args["date_of_quiz"]:
            quiz.date_of_quiz = datetime.strptime(args["date_of_quiz"], "%Y-%m-%d").date()  # conversion from string to object datatype 
        if args["time_duration"]:
            quiz.time_duration = args["time_duration"]
        if args["remarks"]:
            quiz.remarks = args["remarks"]

        db.session.commit()

        return {"message": "Quiz updated successfully!"}, 200
    
    # deleting a quiz
    @auth_required('token')
    @roles_required('admin') 
    def delete(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)
        
        if quiz:
            db.session.delete(quiz)
            db.session.commit()
            return {
                "message": "Quiz deleted successfully!"
            }, 200
        else:
            return {
                "message": "Quiz not found!"
            }, 404

    
class QuestionApi(Resource):
    @auth_required('token')
    @roles_accepted('admin', 'user')
    def get(self):
        quiz_id = request.args.get('quiz_id')
        questions = []

        if quiz_id:
            questions = Question.query.filter_by(quiz_id=quiz_id).all()
        elif "admin" in roles_list(current_user.roles):
            questions = Question.query.all()
        else:
            return {"message": "Quiz ID is required for users"}, 400

        questions_json = []
        for question in questions:
            questions_json.append({
                "id": question.id,
                "quiz_id": question.quiz_id,
                "question_statement": question.question_statement,
                "option1": question.option1,
                "option2": question.option2,
                "option3": question.option3,
                "option4": question.option4,
                "correct_option": question.correct_option  
            })

        if questions_json:
            return questions_json
        return {"message": "No questions found"}, 404
    
    # creating a question
    @auth_required('token')
    @roles_required('admin')  
    def post(self):
        args = question_parser.parse_args()

        if args["correct_option"] not in [1, 2, 3, 4]: # checking if the correct_option is in correct range or not
            return {
                "message": "Correct option must be between 1 and 4"
            }, 400

        try:
            question = Question(
                quiz_id=args["quiz_id"],
                question_statement=args["question_statement"],
                option1=args["option1"],
                option2=args["option2"],
                option3=args["option3"],
                option4=args["option4"],
                correct_option=args["correct_option"]
            )

            db.session.add(question)

            # to dynamicall calculate the number of questions
            quiz = Quiz.query.get(args["quiz_id"])
            if quiz:
                quiz.no_of_questions = quiz.questions.count()

            db.session.commit()

            return {"message": "Question created successfully!"}, 201

        except Exception as e:
            return {
                "message": "Failed to create question"
            }, 400
        
    # updating a question
    @auth_required('token')
    @roles_required('admin')  # Only admin can update questions
    def put(self, question_id):
        args = question_parser.parse_args()
        question = Question.query.get(question_id)

        if not question:
            return {"message": "Question not found"}, 404

        # Update only the provided fields
        if args["quiz_id"]:
            question.quiz_id = args["quiz_id"]
        if args["question_statement"]:
            question.question_statement = args["question_statement"]
        if args["option1"]:
            question.option1 = args["option1"]
        if args["option2"]:
            question.option2 = args["option2"]
        if args["option3"]:
            question.option3 = args["option3"]
        if args["option4"]:
            question.option4 = args["option4"]
        if args["correct_option"]:
            if args["correct_option"] not in [1, 2, 3, 4]:
                return {"message": "Correct option must be between 1 and 4"}, 400
            question.correct_option = args["correct_option"]

        db.session.commit()

        return {"message": "Question updated successfully!"}, 200
    
    # deleting a question
    @auth_required('token')
    @roles_required('admin') 
    def delete(self, question_id):
        
        question = Question.query.get(question_id)
        
        if question:
            quiz_id = question.quiz_id 
            db.session.delete(question)
            
            # to dynamically count the number of questions
            quiz = Quiz.query.get(quiz_id)
            if quiz:
                quiz.no_of_questions = quiz.questions.count()

            db.session.commit()
            return {
                "message": "Question deleted successfully!"
            }, 200
        else:
            return {
                "message": "Question not found!"
            }, 404


class ScoreApi(Resource):
    @auth_required('token')
    @roles_accepted('admin', 'user')
    def get(self):
        quiz_id = request.args.get('quiz_id')
        scores = []

        # Role-based filtering
        if "admin" in roles_list(current_user.roles):
            if quiz_id:
                scores = Score.query.filter_by(quiz_id=quiz_id).all()
            else:
                scores = Score.query.all()
        else:
            if quiz_id:
                scores = Score.query.filter_by(user_id=current_user.id, quiz_id=quiz_id).all()
            else:
                scores = Score.query.filter_by(user_id=current_user.id).all()

        scores_json = []
        for score in scores:
            quiz = Quiz.query.get(score.quiz_id)
            chapter = Chapter.query.get(quiz.chapter_id) if quiz else None
            subject = Subject.query.get(chapter.subject_id) if chapter else None

            scores_json.append({
                "id": score.id,
                "quiz_id": score.quiz_id,
                "quiz_name": quiz.name if quiz else "N/A",
                "chapter_name": chapter.name if chapter else "N/A",
                "subject_name": subject.name if subject else "N/A",
                "user_id": score.user_id,
                "time_stamp_of_attempt": score.time_stamp_of_attempt.isoformat(),
                "total_scored": score.total_scored
            })

        if scores_json:
            return scores_json
        return {"message": "No scores found"}, 404


    # storing the quiz attempt
    @auth_required('token')
    @roles_required('user')  # only user can submit the quiz
    def post(self):
        data = request.get_json()
        quiz_id = data.get('quiz_id')
        # a dictionary mapping question IDs to the user's selected option
        answers = data.get('answers', {})  # { question_id: selected_option }

        if not quiz_id or not answers:
            return { "message": "Quiz ID and answers are required" }, 400

        questions = Question.query.filter_by(quiz_id=quiz_id).all()
        total_score = 0

        for question in questions:
            qid = str(question.id)
            if str(qid) in answers and int(answers[qid]) == question.correct_option:
                total_score += 1

        score = Score(
            quiz_id=quiz_id,
            user_id=current_user.id,
            time_stamp_of_attempt=datetime.now(),
            total_scored=total_score
        )
        db.session.add(score)
        db.session.commit()

        return { "message": "Quiz submitted successfully" }, 200

# to get the quiz details for quiz duration and quiz name || GET quizzes by id 
class QuizMetaApi(Resource):
    @auth_required('token')
    @roles_accepted('admin', 'user')
    def get(self):
        quiz_id = request.args.get('quiz_id')
        if not quiz_id:
            return {"message": "quiz_id is required"}, 400

        quiz = Quiz.query.get(quiz_id)
        if quiz:
            return {
                "id": quiz.id,
                "chapter_id": quiz.chapter_id,
                "name": quiz.name,
                "no_of_questions": quiz.no_of_questions,
                "date_of_quiz": str(quiz.date_of_quiz),
                "time_duration": quiz.time_duration,
                "remarks": quiz.remarks
            }, 200
        return {"message": "Quiz not found"}, 404



api.add_resource(SubjectApi,'/api/subjects/get', '/api/subjects/create', '/api/subjects/update/<int:subject_id>', '/api/subjects/delete/<int:subject_id>')
api.add_resource(ChapterApi,'/api/chapters/get','/api/chapters/create', '/api/chapters/update/<int:chapter_id>', '/api/chapters/delete/<int:chapter_id>')
api.add_resource(QuizApi,'/api/quizzes/get', '/api/quizzes/create', '/api/quizzes/update/<int:quiz_id>', '/api/quizzes/delete/<int:quiz_id>')
api.add_resource(QuestionApi,'/api/questions/get', '/api/questions/create', '/api/questions/update/<int:question_id>', '/api/questions/delete/<int:question_id>')
api.add_resource(ScoreApi,'/api/scores/get', '/api/scores/submit')
api.add_resource(QuizMetaApi, '/api/quizzes/get_by_id')
