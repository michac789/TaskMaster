# TaskMaster

## Table of Contents

- [Project Requirements](#project-requirements)
- [Project Overview](#project-overview)
- [Development Environment](#development-environment)
- [Production Environment](#project-structure)

## Project Requirements

You're tasked with building a task management web application called 'TaskMaster'. The application should allow users to create, view, update, and delete tasks. Each task should have a title, description, due date, and status (e.g., "to do", "in progress", "completed").

The frontend should be built using HTML, CSS, and JavaScript. The backend should be built using Python with Flask. For data storage, you may use SQLite database.

### Frontend

Create a user-friendly interface where users can:
- [x] View a list of tasks
- [x] Add a new task with title, description, due date, and status
- [x] Update existing tasks
- [x] Delete tasks
- [ ] Responsive design

### Backend

Use Flask to handle HTTP requests and responses.
- [x] Implement CRUD (Create, Read, Update, Delete) operations for tasks
- [x] Create appropriate routes for each operation
- [x] Use SQLAlchemy to interact with the SQLite database for storing data

### Database

Design a SQLite database schema to store tasks.
- [x] Include fields for task ID, title, description, due date, and status
- [x] Setup the necessary tables and relationships

### Validation

- [x] Implement validation on the backend side to ensure that required fields are provided when adding or updating tasks
- [x] Validate input formats (e.g., date format)
- [ ] Handle error gracefully and provide appropriate error messages to the user

### Authentication (Optional)

- [x] Implement user authentication using Flask-Login or another authentication library of your choice
- [x] Allow users to sign up, log in, and log out
- [x] Ensure that only authenticated users can access the task management features

### Testing

- [x] Write unit tests to ensure that each endpoint and function behaves as expected
- [x] Test both positive and negative test cases (success and error cases)

### Deployment (Optional)

- [x] Deploy the application to a hosting platform
- [ ] Make sure the application is accessible online and functions correctly in a production environment

## Project Overview

TODO

## Development Environment

### Setup Development Environment

Generally, you can choose to setup your development environment using Docker or without Docker. The following is how to setup development environment using Docker, to simplify the setup process and ensure that the development environment is consistent across different machines. It is assumed that you have cloned the repository and is in the root directory of the project.

1. Install Docker based on your operating system. You can find the installation instructions [here](https://docs.docker.com/get-docker/).

2. Run the following command to build the Docker images and start the containers:

```bash
docker compose up
```

Note: if you have made changes to the Dockerfile, please rebuild the images by adding the `--build` flag

3. The backend server should be running on localhost:8000

TODO - frontend server? or just static files?

### Backend Useful Commands

Assuming your Docker containers are running, you can run `docker exec -ti taskmaster-backend-1 <command>` to run commands inside the backend container. Provided here are some useful commands:

1. Unit Tests

To run all unit tests:

```bash
docker exec -ti taskmaster-backend-1 python -m unittest tests
```

You can choose to run specific test files or test cases by specifying the test file, test class, and test name.

For example, you can run `docker exec -ti taskmaster-backend-1 python -m unittest tests.test_task.TaskCreateTestCase.test_task_create_success` to run only the `test_task_create_success` test case in the `TaskCreateTestCase` class in the `test_task` file.

2. Database Migrations

Creating a migration:

```bash
docker exec -ti taskmaster-backend-1 flask db migrate -m "migration message"
```

Applying the migration:

```bash
docker exec -ti taskmaster-backend-1 flask db upgrade
```

Refer to [Flask-Migrate](https://flask-migrate.readthedocs.io/en/latest/) for further information.

## Production Environment

### Environment Variables

TODO

### WSGI Server

TODO

### Production Database

TODO

### Deployment

TODO

### CI/CD Pipeline

TODO
