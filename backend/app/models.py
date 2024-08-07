import datetime as dt
import jwt
import os
from werkzeug.security import check_password_hash, generate_password_hash

from app import db


JWT_HMAC_SECRET_KEY = os.environ.get('SECRET_KEY', 'insecure_secret_key')

class User(db.Model):
    TOKEN_EXPIRY_HOURS = 24
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(162), nullable=False)
    
    def serialize(self):
        return {
            'id': self.id,
            'username': self.username,
        }
        
    @staticmethod
    def validate_unique_username(username):
        return User.query.filter_by(username=username).count() == 0
    
    @staticmethod
    def validate_input(username, password):
        errors = []
        if not username:
            errors.append('`username` is required')
        if username and len(username) > 50:
            errors.append('`username` must be at most 50 characters')
        if not password:
            errors.append('`password` is required')
        if password and len(password) < 8:
            errors.append('`password` must be at least 8 characters long')
        return errors
    
    @staticmethod
    def hash_password(password):
        return generate_password_hash(password)
    
    @classmethod
    def encode_auth_token(cls, user_id):
        expiry_time = dt.datetime.now() + dt.timedelta(hours=cls.TOKEN_EXPIRY_HOURS)
        token = jwt.encode(
            {'user_id': user_id, 'exp': expiry_time},
            JWT_HMAC_SECRET_KEY,
            algorithm='HS256'
        )
        return token
    
    @staticmethod
    def decode_auth_token(token):
        user = jwt.decode(token, JWT_HMAC_SECRET_KEY, algorithms=['HS256'])
        return user['user_id']

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def validate(self):
        errors = []
        if not self.username:
            errors.append('`username` is required')
        if len(self.username) > 50:
            errors.append('`username` must be at most 50 characters')
        if not self.password_hash:
            errors.append('`password` is required')
        self.password_hash = generate_password_hash(self.password_hash)
        return errors
    
    def __repr__(self):
        return f'<User {self.id}: {self.username}>'


class Task(db.Model):
    STATUS_OPTIONS = ['To Do', 'In Progress', 'Completed']
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(300), nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default=STATUS_OPTIONS[0], nullable=False)
    order = db.Column(db.Integer, nullable=True, default=1)
    
    user_id = db.Column(db.Integer,
        db.ForeignKey('user.id', name='fk_task_user', ondelete='CASCADE'))
    user = db.relationship('User', backref=db.backref('tasks', lazy=True))
    
    def serialize(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'due_date': self.due_date.strftime('%Y-%m-%d'),
            'status': self.status,
            'order': self.order,
            'creator': self.user.username if self.user else None,
        }
        
    def validate(self):
        errors = []
        if not self.title:
            errors.append('`title` is required')
        if self.title and len(self.title) > 50:
            errors.append('`title` must be at most 50 characters')
        if not self.description:
            errors.append('`description` is required')
        if self.description and len(self.description) > 300:
            errors.append('`description` must be at most 300 characters')
        if not self.due_date:
            errors.append('`due_date` is required')
        if self.due_date:
            try:
                due_date = dt.datetime.strptime(self.due_date, '%Y-%m-%d').date()
                self.due_date = due_date
            except Exception:
                errors.append('`due_date` is invalid (format required: YYYY-MM-DD)')
        if not self.status:
            errors.append('`status` is required')
        if self.status and self.status not in self.STATUS_OPTIONS:
            errors.append('`status` is invalid (valid values: To Do, In Progress, Completed)')
        return errors
        
    def __repr__(self):
        return f'<Task {self.id}: {self.title}>'
