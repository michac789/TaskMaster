import unittest

from app.models import db
from tests import test_app


class TaskTestCase(unittest.TestCase):
    def setUp(self):
        self.app = test_app
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()
        
    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
    
    def test_trial(self):
        resp = self.client.get('/tasks')
        resp = self.client.post('/tasks', json={'title': 'test task', 'due_date': '2023-12-1'})
        resp = self.client.get('/tasks')
        print('boo', len(resp.json), resp.json)
