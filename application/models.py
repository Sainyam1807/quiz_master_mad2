from .database import db
from flask_security import UserMixin,RoleMixin


class User(db.Model,UserMixin): # UserMixin: apply some methods on user and hep in authenticating users based on their role
    #since explicit table names are npot provided , SQLAlchemy will convert class names to lowercase.
    id=db.Column(db.Integer, primary_key=True)
    email=db.Column(db.String(100), unique=True, nullable=False)
    password=db.Column(db.String(255), nullable=False)
    username=db.Column(db.String(100), unique=True, nullable=False)
    # dob = db.Column(db.Date) 
    # qualification = db.Column(db.String(100))
    fs_uniquifier=db.Column(db.String, unique=True, nullable=True)  # used to create tokens || alternative for Role=0,1
    active=db.Column(db.Boolean, nullable=False)  # whether user is active or not || admin can change this attribute for any user
    roles=db.relationship('Role', backref='bearer', secondary='user_roles') # secondary refers to where the association is stored || user_roles is the tablename when the UserRole class is converted to table 


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






