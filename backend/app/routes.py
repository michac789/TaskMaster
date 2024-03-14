from flask import request

from app import app, db
from .models import Task


@app.route('/')
def main():
    return {'message': 'Task Master API'}, 200


@app.route('/tasks', methods=['GET'])
def get_all_tasks():
    tasks = Task.query.all()
    return [task.serialize() for task in tasks], 200


@app.route('/tasks', methods=['POST'])
def create_task():
    data = request.json
    new_task = Task(
        title=data.get('title'),
        description=data.get('description', ''),
        due_date=data.get('due_date'),
        is_completed=data.get('is_completed', False)
    )
    errors = new_task.validate()
    if errors:
        return {'error': errors}, 400
    db.session.add(new_task)
    db.session.commit()
    return new_task.serialize(), 201


@app.route('/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return {'error': f'Task with id {task_id} not found!'}, 404
    return task.serialize(), 200


@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return {'error': f'Task with id {task_id} not found!'}, 404
    data = request.json
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.due_date = data.get('due_date', task.due_date)
    task.is_completed = data.get('is_completed', task.is_completed)
    db.session.commit()
    return task.serialize(), 200


@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return {'error': f'Task with id {task_id} not found!'}, 404
    db.session.delete(task)
    db.session.commit()
    return '', 204
