import datetime as dt
import unittest

from app.models import db, Task
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
        self.assertEqual(response.json[3], {
            'id': 1,
            'order': 1,
            'title': 'task1',
            'description': 'task1 description',
            'status': 'In Progress',
            'creator': 'user1',
            'due_date': '2024-03-15',
        })
        self.assertEqual(response.json[2]['id'], 2)
        self.assertEqual(response.json[1]['id'], 3)
        self.assertEqual(response.json[0]['id'], 4)
        response2 = self.client.get(
            '/tasks',
            headers={'Authorization': self.token2},
        )
        self.assertEqual(response2.status_code, 200)
        self.assertEqual(len(response2.json), 1)
        
    def test_task_get_all_success_per_status_1(self):
        response = self.client.get(
            '/tasks?format=per_status',
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json), 3)
        self.assertEqual(len(response.json['To Do']), 1)
        self.assertEqual(len(response.json['In Progress']), 2)
        self.assertEqual(len(response.json['Completed']), 1)
        self.assertEqual(response.json['To Do'][0]['id'], 3)
        self.assertEqual(response.json['In Progress'][0]['id'], 4)
        self.assertEqual(response.json['In Progress'][1]['id'], 1)
        self.assertEqual(response.json['Completed'][0]['id'], 2)
        
    def test_task_get_all_success_per_status_2(self):
        response = self.client.get(
            '/tasks?format=per_status',
            headers={'Authorization': self.token2},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json['To Do']), 1)
        self.assertEqual(response.json['In Progress'], [])
        self.assertEqual(response.json['Completed'], [])
        self.assertEqual(response.json['To Do'][0]['id'], 5)
        
    def test_task_get_all_success_per_status_3(self):
        with self.app.app_context():
            instance = db.session.get(Task, 1)
            instance.order = 3
            db.session.commit()
            instance = db.session.get(Task, 4)
            instance.order = 2
            db.session.commit()
        response = self.client.get(
            '/tasks?format=per_status',
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json), 3)
        self.assertEqual(len(response.json['To Do']), 1)
        self.assertEqual(len(response.json['In Progress']), 2)
        self.assertEqual(len(response.json['Completed']), 1)
        self.assertEqual(response.json['In Progress'][0]['id'], 4)
        self.assertEqual(response.json['In Progress'][1]['id'], 1)
        
    def test_task_get_all_success_filter_1(self):
        response = self.client.get(
            '/tasks?filter=To_Do,In_Progress',
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json), 3)
        self.assertEqual(response.json[2]['id'], 1)
        self.assertEqual(response.json[1]['id'], 3)
        self.assertEqual(response.json[0]['id'], 4)
        
    def test_task_get_all_success_filter_2(self):
        response = self.client.get(
            '/tasks?filter=Completed',
            headers={'Authorization': self.token2},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json), 0)
        
    def test_task_get_all_success_sort_1(self):
        response = self.client.get(
            '/tasks?sort=title',
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json), 4)
        self.assertEqual(response.json[0]['id'], 1)
        self.assertEqual(response.json[1]['id'], 2)
        self.assertEqual(response.json[2]['id'], 3)
        self.assertEqual(response.json[3]['id'], 4)
        
    def test_task_get_all_success_sort_2(self):
        response = self.client.get(
            '/tasks?sort=due_date',
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json), 4)
        self.assertEqual(response.json[0]['id'], 1)
        self.assertEqual(response.json[1]['id'], 4)
        self.assertEqual(response.json[2]['id'], 2)
        self.assertEqual(response.json[3]['id'], 3)
        
    def test_task_get_all_success_sort_3(self):
        response = self.client.get(
            '/tasks?sort=-due_date',
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json), 4)
        self.assertEqual(response.json[0]['id'], 3)
        self.assertEqual(response.json[1]['id'], 2)
        self.assertEqual(response.json[2]['id'], 4)
        self.assertEqual(response.json[3]['id'], 1)
        
    def test_task_get_all_success_filter_sort_1(self):
        response = self.client.get(
            '/tasks?filter=To_Do,In_Progress&sort=-title',
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json), 3)
        self.assertEqual(response.json[0]['id'], 4)
        self.assertEqual(response.json[1]['id'], 3)
        self.assertEqual(response.json[2]['id'], 1)
        
    def test_task_get_all_success_filter_sort_2(self):
        response = self.client.get(
            '/tasks?filter=To_Do,Completed&sort=due_date',
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json), 2)
        self.assertEqual(response.json[0]['id'], 2)
        self.assertEqual(response.json[1]['id'], 3)
        
    def test_task_get_all_success_filter_sort_3(self):
        response = self.client.get(
            '/tasks?filter=In_Progress&sort=-due_date',
            headers={'Authorization': self.token2},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json), 0)
        
    def test_task_get_all_failure_1(self):
        # invalid token
        response = self.client.get(
            '/tasks',
            headers={'Authorization': 'invalid token'},
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json, {'error': 'Invalid token'})
        
    def test_task_get_all_failure_2(self):
        # invalid method (method does not exist)
        response = self.client.delete(
            '/tasks',
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 405)


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
                'status': 'To Do',
                'due_date': '2024-03-15',
                'extra': 'extra field', # extra field should be ignored
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
        self.assertEqual(response.json['due_date'], '2024-03-15')
        self.assertEqual(response.json['status'], 'To Do')
        self.assertEqual(response.json['title'], 'new task')
        with self.app.app_context():
            task = db.session.get(Task, response.json['id'])
            self.assertIsNotNone(task)
            self.assertEqual(task.title, 'new task')
            self.assertEqual(task.user_id, 1)
        
    def test_task_create_failure_1(self):
        # missing json data
        response = self.client.post(
            '/tasks',
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 415)
    
    def test_task_create_failure_2(self):
        # unauthenticated
        response = self.client.post(
            '/tasks',
            json={
                'title': 'new task',
                'description': 'new task description',
                'status': 'To Do',
                'due_date': '2024-03-15',
            },
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json, {'error': 'Token is missing'})
    
    def test_task_create_failure_3(self):
        # invalid token
        response = self.client.post(
            '/tasks',
            json={
                'title': 'new task',
                'description': 'new task description',
                'status': 'To Do',
                'due_date': '2024-03-15',
            },
            headers={'Authorization': 'invalid token'},
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json, {'error': 'Invalid token'})
    
    def test_task_create_failure_4(self):
        # missing title and status
        response = self.client.post(
            '/tasks',
            json={
                'description': 'new task description',
                'due_date': '2024-03-15',
            },
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json, {'error': ['`title` is required', '`status` is required']})
        
    def test_task_create_failure_5(self):
        # missing due date
        response = self.client.post(
            '/tasks',
            json={
                'title': 'new task',
                'description': 'new task description',
                'status': 'To Do',
            },
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json, {'error': ['`due_date` is required']})
    
    def test_task_create_failure_6(self):
        # missing description and invalid status
        response = self.client.post(
            '/tasks',
            json={
                'title': 'new task',
                'status': 'INVALID',
                'due_date': '2024-03-15',
            },
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json, {'error': ['`description` is required', '`status` is invalid (valid values: To Do, In Progress, Completed)']})
        
    def test_task_create_failure_7(self):
        # invalid due date format
        response = self.client.post(
            '/tasks',
            json={
                'title': 'new task',
                'description': 'new task description',
                'status': 'To Do',
                'due_date': '03-15-2024',
            },
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json, {'error': ['`due_date` is invalid (format required: YYYY-MM-DD)']})

    def test_task_create_failure_8(self):
        # title and description too long
        response = self.client.post(
            '/tasks',
            json={
                'title': 'a'*51,
                'description': 'a'*301,
                'status': 'To Do',
                'due_date': '2024-03-15',
            },
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json, {'error': ['`title` must be at most 50 characters', '`description` must be at most 300 characters']})
        
    def test_task_create_failure_9(self):
        # some null values
        response = self.client.post(
            '/tasks',
            json={
                'title': 'some title',
                'description': None,
                'status': None,
                'due_date': None,
            },
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json, {'error': ['`description` is required', '`due_date` is required', '`status` is required',]})
    
    def test_task_create_failure_10(self):
        # invalid due date format, empty title and description
        response = self.client.post(
            '/tasks',
            json={
                'title': '',
                'description': '',
                'status': 'Completed',
                'due_date': '03-15-2024',
            },
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json, {'error': ['`title` is required', '`description` is required', '`due_date` is invalid (format required: YYYY-MM-DD)']})


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
        
    def test_task_update_success_1(self):
        # update single field
        response = self.client.put(
            '/tasks/1',
            json={'status': 'Completed'},
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('creator', response.json)
        self.assertIn('description', response.json)
        self.assertIn('due_date', response.json)
        self.assertIn('id', response.json)
        self.assertIn('status', response.json)
        self.assertIn('title', response.json)
        self.assertIn('order', response.json)
        self.assertEqual(response.json['title'], 'task1')
        self.assertEqual(response.json['status'], 'Completed')
        with self.app.app_context():
            task = db.session.get(Task, 1)
            self.assertEqual(task.status, 'Completed')
            
    def test_task_update_success_2(self):
        # update multiple fields
        response = self.client.put(
            '/tasks/1',
            json={
                'title': 'new title',
                'description': 'new description',
                'due_date': '2024-03-20',
                'status': 'To Do',
            },
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('creator', response.json)
        self.assertEqual(response.json['title'], 'new title')
        self.assertEqual(response.json['description'], 'new description')
        self.assertEqual(response.json['due_date'], '2024-03-20')
        self.assertEqual(response.json['status'], 'To Do')
        with self.app.app_context():
            task = db.session.get(Task, 1)
            self.assertEqual(task.title, 'new title')
            self.assertEqual(task.description, 'new description')
            self.assertEqual(task.due_date, dt.datetime.strptime('2024-03-20', '%Y-%m-%d').date())
            self.assertEqual(task.status, 'To Do')
        
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
        response = self.client.put(
            '/tasks/1',
            json={'status': 'INVALID'},
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json, {'error': ['`status` is invalid (valid values: To Do, In Progress, Completed)']})

    def test_task_update_failure_5(self):
        # invalid due date format
        response = self.client.put(
            '/tasks/1',
            json={'due_date': 'invalidformat'},
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json, {'error': ['`due_date` is invalid (format required: YYYY-MM-DD)']})
        
    def test_task_update_failure_6(self):
        # title too long, description ok, invalid status, due date ok
        response = self.client.put(
            '/tasks/1',
            json={
                'title': 'a'*51,
                'description': 'new description',
                'status': 'INVALID',
                'due_date': '2024-03-20',
            },
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json, {'error': ['`title` must be at most 50 characters', '`status` is invalid (valid values: To Do, In Progress, Completed)']})


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
            task = db.session.get(Task, 1)
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


class TaskUpdateKanbanOrderTestCase(SampleDataMixin, unittest.TestCase):
    def setUp(self):
        super().setUp()
        response1 = self.client.post(
            '/login',
            json={'username': 'user1', 'password': 'password1'},
        )
        self.token1 = response1.json['token']
        
    def test_task_create_order_success_1(self):
        response = self.client.put(
            '/tasks/kanban',
            json={
                'To Do': [4, 2, 3],
                'In Progress': [],
                'Completed': [1],    
            },
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 200)
        with self.app.app_context():
            task = db.session.get(Task, 1)
            self.assertEqual(task.order, 1)
            self.assertEqual(task.status, 'Completed')
            task = db.session.get(Task, 2)
            self.assertEqual(task.order, 2)
            self.assertEqual(task.status, 'To Do')
            task = db.session.get(Task, 3)
            self.assertEqual(task.order, 3)
            self.assertEqual(task.status, 'To Do')
            task = db.session.get(Task, 4)
            self.assertEqual(task.order, 1)
            self.assertEqual(task.status, 'To Do')
            
    def test_task_create_order_success_2(self):
        response = self.client.put(
            '/tasks/kanban',
            json={
                'To Do': [],
                'In Progress': [1, 4, 2, 3],
                'Completed': [],    
            },
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 200)
        with self.app.app_context():
            task = db.session.get(Task, 1)
            self.assertEqual(task.order, 1)
            self.assertEqual(task.status, 'In Progress')
            task = db.session.get(Task, 4)
            self.assertEqual(task.order, 2)
            self.assertEqual(task.status, 'In Progress')
            task = db.session.get(Task, 2)
            self.assertEqual(task.order, 3)
            self.assertEqual(task.status, 'In Progress')
            task = db.session.get(Task, 3)
            self.assertEqual(task.order, 4)
            self.assertEqual(task.status, 'In Progress')
        
    def test_task_create_order_failure_1(self):
        response = self.client.put(
            '/tasks/kanban',
            json={
                'To Do': [],
                'In Progress': [1, 5, 4, 2, 3],
                'Completed': [],    
            },
            headers={'Authorization': 'invalid token'},
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json, {'error': 'Invalid token'})
        
    def test_task_create_order_failure_2(self):
        # task id 5 does not belong to this user
        response = self.client.put(
            '/tasks/kanban',
            json={
                'To Do': [],
                'In Progress': [1, 5, 4, 2, 3],
                'Completed': [],    
            },
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json, {'error': 'Forbidden'})
        
    def test_task_create_order_failure_3(self):
        # task id 9999 does not exist
        response = self.client.put(
            '/tasks/kanban',
            json={
                'To Do': [9999],
                'In Progress': [],
                'Completed': [],    
            },
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json, {'error': 'Task with id 9999 not found!'})
        
    def test_task_create_order_failure_4(self):
        # duplicated task id
        response = self.client.put(
            '/tasks/kanban',
            json={
                'To Do': [1, 3, 4],
                'In Progress': [2],
                'Completed': [3],    
            },
            headers={'Authorization': self.token1},
        )
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.json, {'error': 'Task with id 3 is duplicated!'})
