from flask import Flask
from application.database import db
from application.models import User, Role
from application.resources import api
from application.config import LocalDevelopmentConfig
from flask_security import Security, SQLAlchemyUserDatastore #these are kind of APIs
from flask_security import hash_password
from werkzeug.security import generate_password_hash 
from datetime import date



def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig) # this will apply all the configurations from config.py
    db.init_app(app) #app connected to db
    api.init_app(app) #app connected to api
    # configuring security to the app

    # datastore used to pre fill the attributes like fs_uniquifier and active
    datastore=SQLAlchemyUserDatastore(db,User,Role) # this datastore has various methods that apply on db,user,role
    app.security=Security(app,datastore)  # initializes Flask-Security on the app using the above datastore.
    app.app_context().push()
    return app

app=create_app()

# to insert pre existing records so that ot comfirms the implementation of flask security for RBAC
with app.app_context(): # creating context of the app whenever doing database operations
    db.create_all() # changes are allowed within the app context || will not overwrite whenever change is made

    app.security.datastore.find_or_create_role(name='admin', description='superuser') # this function creates the role
    app.security.datastore.find_or_create_role(name='user', description='generaluser') # it will first find the role and if it doenot exist it will create
    db.session.commit()

    # till here 2 roles have been created now we can create users by this 

    if not app.security.datastore.find_user(email='user0@admin.com'): # only one attribute is required to check the user
        app.security.datastore.create_user(email='user0@admin.com', username='admin1', dob=date(2004, 7, 18), qualification='Phd', password=generate_password_hash('12345'), roles=['admin']) # this 'admin'corresponds to role Admin
    
    # for creating a User or customer
    # no need now as we have a register user endpoint in routes.py
    if not app.security.datastore.find_user(email='user1@user.com'):
        app.security.datastore.create_user(email='user1@user.com', username='user1', dob=date(2004, 7, 18), qualification='bachelors', password=generate_password_hash('12345'), roles=['user'])

    db.session.commit()    

from application.routes import *    

if __name__=="__main__":
    app.run()