from datetime import datetime as dt

from app import db


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(300))
    due_date = db.Column(db.Date)
    is_completed = db.Column(db.Boolean, default=False)
    
    def serialize(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'due_date': self.due_date,
            'is_completed': self.is_completed
        }
        
    def validate(self):
        errors = []
        if not self.title:
            errors.append('`title` is required')
        if len(self.title) > 50:
            errors.append('`title` must be at most 50 characters')
        if len(self.description) > 300:
            errors.append('`description` must be at most 300 characters')
        try:
            due_date = dt.strptime(self.due_date, '%Y-%m-%d').date()
            self.due_date = due_date
        except ValueError:
            errors.append('`due_date` is invalid (format required: YYYY-MM-DD)')
        if self.is_completed not in [True, False]:
            errors.append('`is_completed` must be a boolean')
        return errors
        
    def __repr__(self):
        return f'<Task {self.id}: {self.title}>'
