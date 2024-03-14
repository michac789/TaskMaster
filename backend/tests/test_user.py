import unittest

from app.models import User
from tests.sample_data import SampleDataMixin


class UserCreateTestCase(SampleDataMixin, unittest.TestCase):
    def test_user_create_success(self):
        response = self.client.post(
            '/users',
            json={'username': 'user3', 'password': 'password3'},
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json, {'id': 3, 'username': 'user3'})
        with self.app.app_context():
            self.assertEqual(User.query.filter_by(username='user3').count(), 1)

    def test_user_create_failure_1(self):
        # no json
        response = self.client.post(
            '/users',
            json={'username': 'user1', 'password': 'password1'},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json, {'error': ['`username` must be unique']})
        with self.app.app_context():
            self.assertEqual(User.query.filter_by(username='user1').count(), 1)

    def test_user_create_failure_1(self):
        # username not given
        response = self.client.post(
            '/users',
            json={'password': 'password1'},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json, {'error': ['`username` is required']})
        
    def test_user_create_failure_2(self):
        # password not given
        response = self.client.post(
            '/users',
            json={'username': 'newuser'},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json, {'error': ['`password` is required']})
        
    def test_user_create_failure_3(self):
        # password is too short (less than 8 characters long)
        response = self.client.post(
            '/users',
            json={'username': 'user3', 'password': 'shortpw'},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json, {'error': ['`password` must be at least 8 characters long']})

    def test_user_create_failure_4(self):
        # username is too long (more than 50 characters long)
        response = self.client.post(
            '/users',
            json={'username': 'a'*51, 'password': 'password3'},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json, {'error': ['`username` must be at most 50 characters']})

    def test_user_create_failure_5(self):
        # duplicate username
        response = self.client.post(
            '/users',
            json={'username': 'user1', 'password': 'password3'},
        )
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.json, {'error': ['username \'user1\' has been taken']})
        with self.app.app_context():
            self.assertEqual(User.query.filter_by(username='user1').count(), 1)


class UserLoginTestCase(SampleDataMixin, unittest.TestCase):
    def test_user_login_success(self):
        response = self.client.post(
            '/login',
            json={'username': 'user1', 'password': 'password1'},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('token', response.json)
        
    def test_user_login_failure_1(self):
        # username not given
        response = self.client.post(
            '/login',
            json={'password': 'password1'},
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json, {'error': 'Invalid username or password'})
        
    def test_user_login_failure_2(self):
        # wrong password
        response = self.client.post(
            '/login',
            json={'username': 'user1', 'password': 'wrongpassword'},
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json, {'error': 'Invalid username or password'})
        
    def test_user_login_failure_3(self):
        # user not found
        response = self.client.post(
            '/login',
            json={'username': 'nonexistent', 'password': 'password1'},
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json, {'error': 'Invalid username or password'})


class UserGetTestCase(SampleDataMixin, unittest.TestCase):
    def setUp(self):
        super().setUp()
        response = self.client.post(
            '/login',
            json={'username': 'user1', 'password': 'password1'},
        )
        self.token = response.json['token']
        
    def test_user_get_success(self):
        response = self.client.get(
            '/me',
            headers={'Authorization': self.token},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {'id': 1, 'username': 'user1'})
        
    def test_user_get_failure_1(self):
        # no token
        response = self.client.get('/me')
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json, {'error': 'Token is missing'})
        
    def test_user_get_failure_2(self):
        # invalid token
        response = self.client.get(
            '/me',
            headers={'Authorization': 'invalid token'},
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json, {'error': 'Invalid token'})


class UserChangePasswordTestCase(SampleDataMixin, unittest.TestCase):
    def setUp(self):
        super().setUp()
        response = self.client.post(
            '/login',
            json={'username': 'user1', 'password': 'password1'},
        )
        self.token = response.json['token']
        
    def test_user_change_password_success(self):
        response = self.client.put(
            '/me',
            headers={'Authorization': self.token},
            json={'current_password': 'password1', 'new_password': 'newpassword'},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {'message': 'Password updated successfully'})
        
    def test_user_change_password_failure_1(self):
        # invalid token
        response = self.client.put(
            '/me',
            headers={'Authorization': 'invalid token'},
            json={'current_password': 'password1', 'new_password': 'newpassword'},
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json, {'error': 'Invalid token'})
        
    def test_user_change_password_failure_2(self):
        # wrong current password
        response = self.client.put(
            '/me',
            headers={'Authorization': self.token},
            json={'current_password': 'wrongpassword', 'new_password': 'newpassword'},
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json, {'error': 'Wrong current password'})
        
    def test_user_change_password_failure_3(self):
        # new password is too short
        response = self.client.put(
            '/me',
            headers={'Authorization': self.token},
            json={'current_password': 'password1', 'new_password': 'shortpw'},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json, {'error': ['`password` must be at least 8 characters long']})
