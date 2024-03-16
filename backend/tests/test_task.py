import unittest

from app.models import Task, User
from tests.sample_data import SampleDataMixin


class TaskGetAllTestCase(SampleDataMixin, unittest.TestCase):
    def setUp(self):
        super().setUp()
        response1 = self.client.post(
            '/login',
            json={'username': 'user1', 'password': 'password1'},
        )
        self.token1 = response1.json['token']
        response2 = self.client.post(
            '/login',
            json={'username': 'user2', 'password': 'password2'},
        )
        self.token2 = response2.json['token']

    def test_task_get_all_success(self):
        response = self.client.get(
            '/tasks',
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json), 4)
        self.assertEqual(response.json[0], {
            'id': 1,
            'title': 'task1',
            'description': 'task1 description',
            'status': 'IN_PROGRESS',
            'creator': 'user1',
            'due_date': 'Fri, 15 Mar 2024 00:00:00 GMT',
        })
        response2 = self.client.get(
            '/tasks',
            headers={'Authorization': self.token2},
        )
        self.assertEqual(response2.status_code, 200)
        self.assertEqual(len(response2.json), 1)
        
    def test_task_get_all_failure(self):
        # invalid token
        response = self.client.get(
            '/tasks',
            headers={'Authorization': 'invalid token'},
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json, {'error': 'Invalid token'})


class TaskCreateTestCase(SampleDataMixin, unittest.TestCase):
    def setUp(self):
        super().setUp()
        response1 = self.client.post(
            '/login',
            json={'username': 'user1', 'password': 'password1'},
        )
        self.token1 = response1.json['token']
        response2 = self.client.post(
            '/login',
            json={'username': 'user2', 'password': 'password2'},
        )
        self.token2 = response2.json['token']
        
    def test_task_create_success(self):
        response = self.client.post(
            '/tasks',
            json={
                'title': 'new task',
                'description': 'new task description',
                'status': 'TO_DO',
                'due_date': '2024-03-15',
            },
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn('creator', response.json)
        self.assertIn('description', response.json)
        self.assertIn('due_date', response.json)
        self.assertIn('id', response.json)
        self.assertIn('status', response.json)
        self.assertIn('title', response.json)
        self.assertEqual(response.json['creator'], 'user1')
        self.assertEqual(response.json['description'], 'new task description')
        self.assertEqual(response.json['due_date'], 'Fri, 15 Mar 2024 00:00:00 GMT')
        self.assertEqual(response.json['status'], 'TO_DO')
        self.assertEqual(response.json['title'], 'new task')
        
    def test_task_create_failure_1(self):
        pass # TODO - add more test cases!

class TaskGetTestCase(SampleDataMixin, unittest.TestCase):
    def setUp(self):
        super().setUp()
        response1 = self.client.post(
            '/login',
            json={'username': 'user1', 'password': 'password1'},
        )
        self.token1 = response1.json['token']
        response2 = self.client.post(
            '/login',
            json={'username': 'user2', 'password': 'password2'},
        )
        self.token2 = response2.json['token']
        
    def test_task_get_success(self):
        response = self.client.get(
            '/tasks/1',
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('creator', response.json)
        self.assertIn('description', response.json)
        self.assertIn('due_date', response.json)
        self.assertIn('id', response.json)
        self.assertIn('status', response.json)
        self.assertIn('title', response.json)
        self.assertEqual(response.json['title'], 'task1')
        
    def test_task_get_failure_1(self):
        # unauthenticated
        response = self.client.get(
            '/tasks/1',
            headers={'Authorization': 'invalid token'},
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json, {'error': 'Invalid token'})
        
    def test_task_get_failure_2(self):
        # invalid task id
        response = self.client.get(
            '/tasks/9999',
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json, {'error': 'Task with id 9999 not found!'})
        
    def test_task_get_failure_3(self):
        # task does not belong to the user
        response = self.client.get(
            '/tasks/5',
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json, {'error': 'Forbidden'})


class TaskUpdateTestCase(SampleDataMixin, unittest.TestCase):
    def setUp(self):
        super().setUp()
        response1 = self.client.post(
            '/login',
            json={'username': 'user1', 'password': 'password1'},
        )
        self.token1 = response1.json['token']
        response2 = self.client.post(
            '/login',
            json={'username': 'user2', 'password': 'password2'},
        )
        self.token2 = response2.json['token']
        
    def test_task_update_success(self):
        response = self.client.put(
            '/tasks/1',
            json={'status': 'COMPLETED'},
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('creator', response.json)
        self.assertIn('description', response.json)
        self.assertIn('due_date', response.json)
        self.assertIn('id', response.json)
        self.assertIn('status', response.json)
        self.assertIn('title', response.json)
        self.assertEqual(response.json['title'], 'task1')
        self.assertEqual(response.json['status'], 'COMPLETED')
        with self.app.app_context():
            task = Task.query.get(1)
            self.assertEqual(task.status, 'COMPLETED')
        
    def test_task_update_failure_1(self):
        # unauthenticated
        response = self.client.put(
            '/tasks/1',
            json={'status': 'DONE'},
            headers={'Authorization': 'invalid token'},
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json, {'error': 'Invalid token'})
        
    def test_task_update_failure_2(self):
        # invalid task id
        response = self.client.put(
            '/tasks/9999',
            json={'status': 'DONE'},
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json, {'error': 'Task with id 9999 not found!'})
        
    def test_task_update_failure_3(self):
        # task does not belong to the user
        response = self.client.put(
            '/tasks/5',
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json, {'error': 'Forbidden'})
        
    def test_task_update_failure_4(self):
        # invalid status
        pass # TODO - there is a bug!
        # response = self.client.put(
        #     '/tasks/1',
        #     json={'status': 'INVALID'},
        #     headers={'Authorization': self.token1},
        # )
        # self.assertEqual(response.status_code, 400)
        # self.assertEqual(response.json, {'error': '`status` is invalid (valid values: TO_DO, IN_PROGRESS, DONE)'})

    # TODO - add more validations!

class TaskDeleteTestCase(SampleDataMixin, unittest.TestCase):
    def setUp(self):
        super().setUp()
        response1 = self.client.post(
            '/login',
            json={'username': 'user1', 'password': 'password1'},
        )
        self.token1 = response1.json['token']
        response2 = self.client.post(
            '/login',
            json={'username': 'user2', 'password': 'password2'},
        )
        self.token2 = response2.json['token']
        
    def test_task_delete_success(self):
        response = self.client.delete(
            '/tasks/1',
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 204)
        with self.app.app_context():
            task = Task.query.get(1)
            self.assertIsNone(task)
        
    def test_task_delete_failure_1(self):
        # unauthenticated
        response = self.client.delete(
            '/tasks/1',
            headers={'Authorization': 'invalid token'},
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json, {'error': 'Invalid token'})
        
    def test_task_delete_failure_2(self):
        # invalid task id
        response = self.client.delete(
            '/tasks/9999',
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json, {'error': 'Task with id 9999 not found!'})
        
    def test_task_delete_failure_3(self):
        # task does not belong to the user
        response = self.client.delete(
            '/tasks/5',
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json, {'error': 'Forbidden'})
