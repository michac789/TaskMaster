import unittest

from tests import test_app


class PingTestCase(unittest.TestCase):
    def setUp(self):
        self.app = test_app
        self.client = self.app.test_client()
    
    def test_ping(self):
        resp = self.client.get('/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('message', resp.json)
        self.assertEqual(resp.json['message'], 'Task Master API')
