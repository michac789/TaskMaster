from app import app
from .models import Task


@app.route('/')
def main():
    return 'hello world'


@app.route('/tasks', methods=['GET'])
def get_all_tasks():
    tasks = Task.query.all()
    return [task.serialize() for task in tasks], 200


@app.route('/tasks/<int:task_id>', methods=['GET'])
def get_single_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return {'error': f'Task with id {task_id} not found!'}, 404
    return task.serialize(), 200
