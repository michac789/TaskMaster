import datetime as dt

from app.models import db, Task, User
from tests import test_app as app


'''
    This mixin provides a method to create sample data for testing.
    It also provides setUp and tearDown methods to create and destroy the database,
    applied for each test case.
'''
class SampleDataMixin:
    def create_sample_data(self):
        self.user1 = User(
            username='user1',
            password_hash=User.hash_password('password1'),
        )
        self.user2 = User(
            username='user2',
            password_hash=User.hash_password('password2'),
        )
        db.session.add(self.user1)
        db.session.add(self.user2)
        db.session.commit()
        self.task1 = Task(
            title='task1',
            description='task1 description',
            due_date=dt.datetime.strptime('2024-03-15', '%Y-%m-%d').date(),
            status='In Progress',
            user_id=self.user1.id,
        )
        self.task2 = Task(
            title='task2',
            description='task2 description',
            due_date=dt.datetime.strptime('2024-03-30', '%Y-%m-%d').date(),
            status='Completed',
            user_id=self.user1.id,
        )
        self.task3 = Task(
            title='task3',
            description='task3 description',
            due_date=dt.datetime.strptime('2024-12-01', '%Y-%m-%d').date(),
            status='To Do',
            user_id=self.user1.id,
        )
        self.task4 = Task(
            title='task4',
            description='task4 description',
            due_date=dt.datetime.strptime('2024-03-17', '%Y-%m-%d').date(),
            status='In Progress',
            user_id=self.user1.id,
        )
        self.task5 = Task(
            title='task5',
            description='task5 description',
            due_date=dt.datetime.strptime('2024-04-20', '%Y-%m-%d').date(),
            status='To Do',
            user_id=self.user2.id,
        )
        db.session.add(self.task1)
        db.session.add(self.task2)
        db.session.add(self.task3)
        db.session.add(self.task4)
        db.session.add(self.task5)
        db.session.commit()
        
    def setUp(self):
        self.app = app
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()
            self.create_sample_data()
        
    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
