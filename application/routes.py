from flask import current_app as app, jsonify, request
from flask_security import hash_password, auth_required, roles_required, current_user, login_user # roles_accepted(for multiple roles) || login_user: loads user info into session after successful verification of email and password
from application.database import db
from werkzeug.security import check_password_hash, generate_password_hash  # generate_password_hash: hashes the password to store in database || check_password_hash : compares that hashed password with plain password

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
@roles_required('user')
def user_home():
    user=current_user # everytime succssful login there is entire user info stored in sessions and that info is stored as current_user
    return jsonify({  # converts to actual JSON
        "username":user.username,
        "email":user.email,
        "password":user.password
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

            return jsonify({
                "id": user.id,
                "username": user.username,
                "auth-token": user.get_auth_token() # this function returns the auth-token
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
    if not app.security.datastore.find_user(email=credentials["email"]):
        app.security.datastore.create_user(email=credentials["email"], username=credentials["username"], password=generate_password_hash(credentials["password"]), roles=['user'])
        db.session.commit()
        return jsonify({
            "message": "User created successfully"
            }),201
    
    return jsonify({
        "message": "User already exists "
    }),400