from .database import db
from flask_security import UserMixin,RoleMixin


class User(db.Model,UserMixin): # UserMixin: apply some methods on user and hep in authenticating users based on their role
    #since explicit table names are npot provided , SQLAlchemy will convert class names to lowercase.
    id=db.Column(db.Integer, primary_key=True)
    email=db.Column(db.String(100), unique=True, nullable=False)
    password=db.Column(db.String(255), nullable=False)
    username=db.Column(db.String(100), unique=True, nullable=False)
    dob = db.Column(db.Date)
    qualification = db.Column(db.String(100))
    fs_uniquifier=db.Column(db.String, unique=True, nullable=True)  # used to create tokens || alternative for Role=0,1
    active=db.Column(db.Boolean, nullable=False)  # whether user is active or not || admin can change this attribute for any user
    roles=db.relationship('Role', backref='bearer', secondary='user_roles') # secondary refers to where the association is stored || user_roles is the tablename when the UserRole class is converted to table 
    scores=db.relationship('Score', backref='user', lazy="dynamic") # backref='user': In score model, it creates a virtual field called 'user' which is back referenced to user 

# Role= 0(Admin)  = 1(user)
# Admin can have both roles
class Role(db.Model, RoleMixin):  # differentiates between admin and user
    id=db.Column(db.Integer, primary_key=True)
    name=db.Column(db.String(100), unique=True, nullable=False)   # admin and user role is unique || one role given to many users but only one role is there
    description=db.Column(db.String(255))


#Relation between the above two tables: many to many relationship 
class UserRoles(db.Model):
    id=db.Column(db.Integer, primary_key=True)
    user_id=db.Column(db.Integer, db.ForeignKey('user.id'))  # foreign key of User table
    role_id=db.Column(db.Integer, db.ForeignKey('role.id'))


class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100))  #Category: Science, Commerce, Arts , Comp.Sci
    # one to many 
    chapters = db.relationship('Chapter', backref='subject', cascade="all, delete-orphan" ,lazy="dynamic")  # delete-orphan : if a child is removed from the parents it is automatically deleted || lazy parameter : Instead of returning a list of objects, it returns a query object, easier to filter data  

class Chapter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=False)
    total_quizzes = db.Column(db.Integer, default=0)
    # one to many
    quizzes = db.relationship('Quiz', backref='chapter', cascade="all, delete-orphan", lazy="dynamic")

class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapter.id'), nullable=False)
    date_of_quiz = db.Column(db.Date, nullable=False)
    time_duration = db.Column(db.String(5), nullable=False)  # Format HH:MM
    remarks = db.Column(db.Text)
    # one to many 
    questions = db.relationship('Question', backref='quiz', cascade="all, delete-orphan", lazy="dynamic")
    scores = db.relationship('Score', backref='quiz', cascade="all, delete-orphan", lazy="dynamic")

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    question_statement = db.Column(db.Text, nullable=False)
    option1 = db.Column(db.String(255), nullable=False)
    option2 = db.Column(db.String(255), nullable=False)
    option3 = db.Column(db.String(255), nullable=False)
    option4 = db.Column(db.String(255), nullable=False)
    correct_option = db.Column(db.Integer, nullable=False) 

class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    time_stamp_of_attempt = db.Column(db.DateTime, default=db.func.current_timestamp())
    total_scored = db.Column(db.Integer, nullable=False)
         