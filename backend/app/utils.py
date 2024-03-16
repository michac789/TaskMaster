from flask import request
from functools import wraps
import jwt

from app.models import db, User


'''
    This decorator protect routes that require authentication.
    You can access the current user instance by adding it as an argument.
'''
def auth_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return {'error': 'Token is missing'}, 401
        try:
            user_id = User.decode_auth_token(token)
            user = db.session.get(User, user_id)
            kwargs['user'] = user
            return func(*args, **kwargs)
        except jwt.ExpiredSignatureError:
            return {'error': 'Token has expired'}, 401
        except jwt.InvalidTokenError:
            return {'error': 'Invalid token'}, 401
    return wrapper
