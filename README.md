# TaskMaster

## Table of Contents

- [Project Requirements](#project-requirements)
- [Project Overview](#project-overview)
- [Setup Development Environment](#development-environment)
- [Production Environment](#project-structure)

## Project Requirements

You're tasked with building a task management web application called 'TaskMaster'. The application should allow users to create, view, update, and delete tasks. Each task should have a title, description, due date, and status (e.g., "to do", "in progress", "completed").

The frontend should be built using HTML, CSS, and JavaScript. The backend should be built using Python with Flask. For data storage, you may use SQLite database.

### Frontend

Create a user-friendly interface where users can:
- [ ] View a list of tasks
- [ ] Add a new task with title, description, due date, and status
- [ ] Update existing tasks
- [ ] Delete tasks
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

- [ ] Implement validation on the backend side to ensure that required fields are provided when adding or updating tasks
- [ ] Validate input formats (e.g., date format)
- [ ] Handle error gracefully and provide appropriate error messages to the user

### Authentication (Optional)

- [ ] Implement user authentication using Flask-Login or another authentication library of your choice
- [ ] Allow users to sign up, log in, and log out
- [ ] Ensure that only authenticated users can access the task management features

### Testing

- [ ] Write unit tests to ensure that each endpoint and function behaves as expected
- [ ] Test both positive and negative test cases (success and error cases)

### Deployment (Optional)

- [ ] Deploy the application to a hosting platform
- [ ] Make sure the application is accessible online and functions correctly in a production environment

## Project Overview

TODO

## Development Environment

TODO

## Production Environment

TODO
