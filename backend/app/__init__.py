from flask import Flask
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
import os


CURR_DIR = os.path.abspath(os.path.dirname(__file__))
SQLITE3_DB_PATH = os.path.join(CURR_DIR, 'db.sqlite3')

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{SQLITE3_DB_PATH}'
db = SQLAlchemy(app)
migrate = Migrate(app, db)

with app.app_context():
    db.create_all()

from app import models, routes
