from flask import Flask
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
import os


db = SQLAlchemy()

CURR_DIR = os.path.abspath(os.path.dirname(__file__))
SQLITE3_DB_PATH = os.path.join(CURR_DIR, 'db.sqlite3')
SQLITE3_TEST_DB_PATH = os.path.join(CURR_DIR, 'test.sqlite3')

def create_app(type='dev'):
    app = Flask(__name__)
    if type == 'dev':
        app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{SQLITE3_DB_PATH}'
    elif type == 'test':
        app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{SQLITE3_TEST_DB_PATH}'
        app.config['TESTING'] = True
    elif type == 'prod':
        try:
            app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI')
        except:
            raise ValueError('DATABASE_URI environment variable is not set or has parsing issues!')
    else:
        raise ValueError('Invalid app type given! The `create_app` function only accepts `dev` or `test` or `prod` as arguments.')
    db.init_app(app)
    Migrate(app, db)
    with app.app_context():
        from . import routes
        db.create_all()
    return app
