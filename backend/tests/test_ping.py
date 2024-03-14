import unittest
from app import app


class PingTestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.app = app.test_client()
    
    def test_ping(self):
        resp = self.app.get('/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('message', resp.json)
        self.assertEqual(resp.json['message'], 'Task Master API')
