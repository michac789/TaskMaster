from flask import request, current_app as app
from sqlalchemy import desc

from app.models import db, Task
from app.utils import auth_required


'''
    Get all tasks for the current user, ordered by id in descending order.
    Return 401 if the user is not authenticated.
    Return 200 and list of tasks created by the current user.
'''
@app.route('/tasks', methods=['GET'])
@auth_required
def get_all_tasks(user):
    tasks = Task.query.filter(Task.user_id == user.id).order_by(desc(Task.id)).all()
    format = request.args.get('format', 'default')
    if format == 'per_status':
        tasks_per_status = {status: [] for status in Task.STATUS_OPTIONS}
        for task in tasks:
            tasks_per_status[task.status].append(task.serialize())
        for status in tasks_per_status:
            tasks_per_status[status] = sorted(tasks_per_status[status], key=lambda task: task['order'])
        return tasks_per_status, 200
    else:
        # filter_param format: ?filter=To_Do,In_Progress,Completed
        filter_param = request.args.get('filter')
        if filter_param:
            statuses = filter_param.split(',')
            statuses = [status.replace('_', ' ') for status in statuses]
            tasks = [task for task in tasks if task.status in statuses]
        
        # sort_param format: ?sort=due_date (or other Task attribute, add '-' for descending order)
        sort_param = request.args.get('sort')
        if sort_param:
            if sort_param[0] == '-':
                sort_param = sort_param[1:]
                tasks = sorted(tasks, key=lambda task: getattr(task, sort_param), reverse=True)
            else:
                tasks = sorted(tasks, key=lambda task: getattr(task, sort_param))
        
        return [task.serialize() for task in tasks], 200

'''
    Accept a list of tasks and their Task id in ascending order.
    Example:
    {
        "To Do": [1, 2, 3],
        "In Progress": [5, 6],
        "Completed": [4]
    }
    Assign 'order' to each task based on the order in the list.
'''
@app.route('/tasks/kanban', methods=['PUT'])
@auth_required
def update_tasks_order(user):
    try:
        data = request.json
        for status in Task.STATUS_OPTIONS:
            for i, task_id in enumerate(data[status]):
                task = db.session.get(Task, task_id)
                if not task:
                    return {'error': f'Task with id {task_id} not found!'}, 404
                assert task.user_id == user.id
                task.status = status
                task.order = i + 1
        db.session.commit()
        return {}, 200
    except AssertionError:
        return {'error': 'Forbidden'}, 403


'''
    Create a new task, use the current user id as the user_id.
    Return 401 if the user is not authenticated.
    Return 400 along with the validation errors if the input is invalid.
    Return 201 and the created task if the task is created successfully.
'''
@app.route('/tasks', methods=['POST'])
@auth_required
def create_task(user):
    data = request.json
    new_task = Task(
        title=data.get('title'),
        description=data.get('description'),
        due_date=data.get('due_date'),
        status=data.get('status'),
        user_id=user.id,
    )
    errors = new_task.validate()
    if errors:
        return {'error': errors}, 400
    db.session.add(new_task)
    db.session.commit()
    return new_task.serialize(), 201


'''
    Get a task by id.
    Return 401 if the user is not authenticated.
    Return 404 if the task id is invalid.
    Return 403 if the task does not belong to the current user.
    Return 200 and the task if the task is found.
'''
@app.route('/tasks/<int:task_id>', methods=['GET'])
@auth_required
def get_task(user, task_id):
    task = db.session.get(Task, task_id)
    if not task:
        return {'error': f'Task with id {task_id} not found!'}, 404
    if task.user_id != user.id:
        return {'error': 'Forbidden'}, 403
    return task.serialize(), 200


'''
    Update a task by id.
    Only title, description, due_date and status can be updated.
    Return 401 if the user is not authenticated.
    Return 404 if the task id is invalid.
    Return 403 if the task does not belong to the current user.
    Return 400 along with the validation errors if the input is invalid.
    Return 200 and the updated task if the task is updated successfully.
'''
@app.route('/tasks/<int:task_id>', methods=['PUT'])
@auth_required
def update_task(user, task_id):
    task = db.session.get(Task, task_id)
    if not task:
        return {'error': f'Task with id {task_id} not found!'}, 404
    if task.user_id != user.id:
        return {'error': 'Forbidden'}, 403
    data = request.json
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.due_date = data.get('due_date', task.due_date.strftime('%Y-%m-%d'))
    task.status = data.get('status', task.status)
    errors = task.validate()
    if errors:
        return {'error': errors}, 400
    db.session.commit()
    return task.serialize(), 200


'''
    Delete a task by id.
    Return 401 if the user is not authenticated.
    Return 404 if the task id is invalid.
    Return 403 if the task does not belong to the current user.
    Return 204 if the task is deleted successfully.
'''
@app.route('/tasks/<int:task_id>', methods=['DELETE'])
@auth_required
def delete_task(user, task_id):
    task = db.session.get(Task, task_id)
    if not task:
        return {'error': f'Task with id {task_id} not found!'}, 404
    if task.user_id != user.id:
        return {'error': 'Forbidden'}, 403
    db.session.delete(task)
    db.session.commit()
    return {}, 204
