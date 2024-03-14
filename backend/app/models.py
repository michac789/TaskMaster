from datetime import datetime as dt
from werkzeug.security import check_password_hash, generate_password_hash

from app import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(162), nullable=False)
    
    def serialize(self):
        return {
            'id': self.id,
            'username': self.username,
        }
    
    @staticmethod
    def validate_input(username, password):
        errors = []
        if not username:
            errors.append('`username` is required')
        if len(username) > 50:
            errors.append('`username` must be at most 50 characters')
        if not password:
            errors.append('`password` is required')
        return errors
    
    @staticmethod
    def hash_password(password):
        return generate_password_hash(password)
    
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
    STATUS_OPTIONS = ['TO_DO', 'IN_PROGRESS', 'DONE']
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(300), nullable=False)
    due_date = db.Column(db.Date)
    status = db.Column(db.String(20), default=STATUS_OPTIONS[0])
    
    user_id = db.Column(db.Integer,
        db.ForeignKey('user.id', name='fk_task_user', ondelete='CASCADE'))
    user = db.relationship('User', backref=db.backref('tasks', lazy=True))
    
    def serialize(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'due_date': self.due_date,
            'status': self.status,
        }
        
    def validate(self):
        errors = []
        if not self.title:
            errors.append('`title` is required')
        if len(self.title) > 50:
            errors.append('`title` must be at most 50 characters')
        if not self.description:
            errors.append('`description` is required')
        if len(self.description) > 300:
            errors.append('`description` must be at most 300 characters')
        try:
            due_date = dt.strptime(self.due_date, '%Y-%m-%d').date()
            self.due_date = due_date
        except:
            errors.append('`due_date` is invalid (format required: YYYY-MM-DD)')
        if self.status not in self.STATUS_OPTIONS:
            errors.append('`status` is invalid (valid values: TO_DO, IN_PROGRESS, DONE)')
        return errors
        
    def __repr__(self):
        return f'<Task {self.id}: {self.title}>'
