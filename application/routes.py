from flask import current_app as app, jsonify
from flask_security import auth_required, roles_required, current_user # roles_accepted(for multiple roles)

@app.route('/admin')
@auth_required('token')  # kind of authentication is token || provided in the header of the request  || AUTHENTICATION
@roles_required('admin') # admin role is required for this route || AUTHORIZATION, RBAC
def admin_home():
    return {
        "message" : "admin logged in successfully"   # kinda acts like a dictionary not actual JSON
    }

# it will access only a specific user dashboard based on credentials
@app.route('/user')
@auth_required('token')
@roles_required('user')
def user_home():
    user=current_user # everytime succssful login there is entire user info stored in sessions and that info is stored as current_user
    return jsonify({  # converts to actual JSON
        "username":user.username,
        "email":user.email,
        "password":user.password
    })