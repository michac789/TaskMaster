from flask import request, current_app as app

from app.models import db, User
from app.utils import auth_required


'''
    Root endpoint, simply to ping the server.
'''
@app.route('/', methods=['GET'])
def main():
    return {
        'message': 'Task Master API',
        'note': 'In a real production environment, the `ALLOWED_HOSTS` env var should be set to the appropriate IP address. I am exposing it here for the sake of this being a sample project, and to allow easy testing and demonstration.',
    }, 200


'''
    Create a new user, taking in a username and password.
    Store the hashed password in the database.
    Return 400 along with the validation errors if the input is invalid.
    Return 409 if the username is not unique.
    Return 201 and the created user if the user is created successfully.
'''
@app.route('/users', methods=['POST'])
def create_user():
    data = request.json
    errors = User.validate_input(
        data.get('username'),
        data.get('password'),
    )
    if errors:
        return {'error': errors}, 400
    username = data.get('username')
    is_unique_username = User.validate_unique_username(username)
    if not is_unique_username:
        return {'error': [f'username \'{username}\' has been taken']}, 409
    hashed_password = User.hash_password(data['password'])
    new_user = User(
        username=data['username'],
        password_hash=hashed_password,
    )
    db.session.add(new_user)
    db.session.commit()
    return new_user.serialize(), 201


'''
    Authenticate a user by username and password.
    Return 401 if the username or password is invalid.
    Return 200 and the jwt if the user is authenticated successfully.
'''
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data.get('username', '')).first()
    if not user or not user.check_password(data.get('password', '')):
        return {'error': 'Invalid username or password'}, 401
    token = User.encode_auth_token(user.id)
    return {'token': token}, 200


'''
    Simply get the current user id and username.
    Return 401 if the user is not authenticated.
    Return 200 and the current user's id and username.
'''
@app.route('/me', methods=['GET'])
@auth_required
def get_user(user):
    return user.serialize(), 200


'''
    Change the current user's password.
    Return 401 if the user is not authenticated or the current password is wrong.
    Return 400 if the new password is invalid.
    Return 200 if the password is updated successfully.
'''
@app.route('/me', methods=['PUT'])
@auth_required
def change_password(user):
    data = request.json
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')
    if not user.check_password(current_password):
        return {'error': 'Wrong current password'}, 401
    errors = User.validate_input(
        user.username,
        new_password,
    )
    if errors:
        return {'error': errors}, 400
    user.password_hash = User.hash_password(new_password)
    db.session.commit()
    return {'message': 'Password updated successfully'}, 200
