from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User
from .card import Card  # 👈 importante para que SQLAlchemy lo reconozca
