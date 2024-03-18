# TaskMaster

## Table of Contents

- [Project Requirements](#project-requirements)
- [Project Overview](#project-overview)
- [Development Environment](#development-environment)
- [Production Environment](#project-structure)
- [Future Improvements](#future-improvements)

## Project Requirements

You're tasked with building a task management web application called 'TaskMaster'. The application should allow users to create, view, update, and delete tasks. Each task should have a title, description, due date, and status (e.g., "to do", "in progress", "completed").

The frontend should be built using HTML, CSS, and JavaScript. The backend should be built using Python with Flask. For data storage, you may use SQLite database.

### Frontend

Create a user-friendly interface where users can:
- [x] View a list of tasks
- [x] Add a new task with title, description, due date, and status
- [x] Update existing tasks
- [x] Delete tasks

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
- [x] Handle error gracefully and provide appropriate error messages to the user

### Authentication (Optional)

- [x] Implement user authentication using Flask-Login or another authentication library of your choice
- [x] Allow users to sign up, log in, and log out
- [x] Ensure that only authenticated users can access the task management features

### Testing

- [x] Write unit tests to ensure that each endpoint and function behaves as expected
- [x] Test both positive and negative test cases (success and error cases)

### Deployment (Optional)

- [x] Deploy the application to a hosting platform
- [x] Make sure the application is accessible online and functions correctly in a production environment

## Project Overview

### Backend

The backend is built using `Flask`, which is a light weight web framework for Python. `Flask-SQLAlchemy` is used as the ORM to interact with the database, and `Flask-Migrate` is used to handle database migrations. Additionally, `Flask-Cors` is used to handle CORS, and `PyJwt` is used to handle JWT authentication. There are 48 unit tests written using `pytest` and a mock test db to ensure that the backend behaves as expected, with complete validation and error handling.

### Frontend

As per the requirements, the frontend is built using HTML, Vanilla CSS, and Vanila JavaScript, without the use of any frontend frameworks or libraries. The frontend is essentially a single page application. Users should be able to perform authentication related operations such as login, register, logout, and change password. Authenticated users should be able to perform CRUD operations on tasks. The frontend is designed to be user-friendly, responsive, and has complete validation and error handling.

### DevOps

This project is deployed for production. You can access the frontend [here](https://taskmaster.michac789.com/) and the backend [here](https://backend.taskmaster.michac789.com/). More information about the deployment can be found in the [Production Environment](#production-environment) section.

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

### Production Setup

A separate `Dockerfile.prod` file is used to build the production Docker image. Here are a few things that are different in production environment compared to development environment:
- Usage of Gunicorn, a proper WSGI server, with 2 workers
- Environment variables for configuration and to store sensitive information, such as secret key used for JWT authentication, Database URI, setting debug to False, etc.
- Usage of PostgreSQL database instead of SQLite, which is hosted in a DigitalOcean droplet

### How to Deploy

Both the backend and frontend applicatino are deployed from Digital Ocean Droplet. Generally, the steps are as follows:

1. Buy a domain name from a domain registrar, point the 'A' record (ipv4) to the droplet's IP address

2. Create Digital Ocean droplet, SSH into the droplet, install Docker

3. Build the production Docker image and push it to Docker Hub

4. SSH into the droplet, pull the production Docker image from Docker Hub, and run the container

5. Install and configure Caddy, a web server, to handle reverse proxy mapping from domain name to the specific ports, it also provides SSL certificates

6. As the frontend are static files, simply copy the files to the droplet (e.g., using scp) and serve them using Caddy

### CI/CD Pipeline

In order to automate the deployment process, a CI/CD pipeline is set up using GitHub Actions. Refer to `test.yml` and `deploy.yml` in `.github/workflows` for the complete details. There are 4 workflows summarized as follows:

1. Run all backend unit test cases

2. Build the backend production Docker image and push it to Docker Hub

3. SSH into the droplet, pull the production Docker image from Docker Hub, and run the container

4. Use scp to copy the frontend static files to the droplet

*Note: Caddy has to be installed and configured manually beforehand, to listen to the domain name and handle reverse proxy mapping

## Future Improvements

Though the requirements are fulfilled, there are certainly many areas of improvements. Here are some ideas: (wish I had more free time to implement these!)

1. Authentication

- Usage of refresh and access tokens are more secure, rather than using only an access token

- Possibly create a new field `email` in the `User` model, in case the user forgot their password, they can reset it using their email (might need to configure email service queue)

- Check for password strength, which currently only relies on minimum length of 8, which is not secure

- Check for username uniqueness every few moments after the user stop typing (debouncing), rather than having to click the submit button to check for username uniqueness

- Password input eye icon to show/hide password

- Other UI improvements, such as showing loading state (e.g., spinner or shimmering rectangle) when waiting for the server to respond, make each input red when there is an error, fade in animation for modal, exit modal when backdrop is clicked, etc.

2. Task Management

- Features like searching, sorting, filtering, and pagination, are not yet implemented; the implementation can be as basic as using the `LIKE` operator in SQL for searching, or more advanced like using a search engine like Elasticsearch, or using database indexing / caching to speed up some queries

- Implementation of pagination or infinite scrolling in the frontend, to handle users with many tasks

- Dismissable success alerts when saving or deleting is successful, rather than just showing the tasks

- Some client side validation (whenever possible) to reduce the number of requests to the server, so the server won't be overloaded; currently most validation relies on the backend, which return an error messsage and shown to the user

- Extra features such as setting priority or tags, notification (might need queue service and cron job), exporting tasks to a file, etc.

- Accessibility improvements such as keyboard navigation, screen reader support, etc. (some are implemented in login/register page, but not in the task management page yet)

3. DevOps

- Use Docker Swarm or Kubernetes to handle the deployment, can ensure zero downtime and better scaling; currently, there is a downtime when the server is being updated as the container is stopped and removed before the new container is started

- Usage of Docker secrets to store sensitive information, the current way is actually not so secure as people can inspect the image on Docker Hub and see the environment variables

- Backend using tools like Sentry to monitor errors, and Prometheus to monitor performance, Swagger for API documentation, etc.
