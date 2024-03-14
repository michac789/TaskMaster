import unittest

from app import app, db


class TaskTestCase(unittest.TestCase):
    def setUp(self):
        import os
        CURR_DIR = os.path.abspath(os.path.dirname(__file__))
        SQLITE3_DB_PATH = os.path.join(CURR_DIR, 'test.sqlite3')
        
        app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{SQLITE3_DB_PATH}'
        app.config['TESTING'] = True
        self.app = app.test_client()
        
        # TODO - use different db for testing
        
        with app.app_context():
            db.create_all()

    def tearDown(self):
        with app.app_context():
            pass
            # db.session.remove()
            # db.drop_all()
        
    def test_get_all(self):
        resp = self.app.get('/tasks')
        print(resp.json)
        
        self.assertEqual(1, 1)


if __name__ == '__main__':
    unittest.main()
