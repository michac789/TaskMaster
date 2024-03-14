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
        
    def __repr__(self):
        return f'<Task {self.id}: {self.title}>'
