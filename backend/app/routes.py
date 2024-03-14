from flask import request, current_app as app

from .models import db, Task, User


@app.route('/')
def main():
    return {'message': 'Task Master API'}, 200


@app.route('/users', methods=['POST'])
def create_user():
    data = request.json
    errors = User.validate_input(
        data.get('username'),
        data.get('password'),
    )
    if errors:
        return {'error': errors}, 400
    hashed_password = User.hash_password(data['password'])
    new_user = User(
        username=data['username'],
        password_hash=hashed_password
    )
    db.session.add(new_user)
    db.session.commit()
    return new_user.serialize(), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data.get('username', '')).first()
    if not user or not user.check_password(data.get('password', '')):
        return {'error': 'Invalid username or password'}, 401
    token = User.encode_auth_token(user.id)
    return {'token': token}, 200


@app.route('/test', methods=['GET'])
def protected():
    import jwt
    token = request.headers.get('Authorization')
    if not token:
        return {'error': 'Token is missing'}, 401
    try:
        user_id = User.decode_auth_token(token)
        user = User.query.get(user_id)
        return {'message': f'Welcome {user.username}'}, 200
    except jwt.ExpiredSignatureError:
        return {'error': 'Token has expired'}, 401
    except jwt.InvalidTokenError:
        return {'error': 'Invalid token'}, 401


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
        status=data.get('status', Task.STATUS_OPTIONS[0]),
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
    task.status = data.get('status', task.status)
    db.session.commit()
    return task.serialize(), 200


@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return {'error': f'Task with id {task_id} not found!'}, 404
    db.session.delete(task)
    db.session.commit()
    return {}, 204
