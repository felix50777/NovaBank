# backend/database/models/user.py
from flask_sqlalchemy import SQLAlchemy

from backend.database.models import db



class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    balance = db.Column(db.Float, default=0.0)
    card_number = db.Column(db.String(16), unique=True)
    card_type = db.Column(db.String(10))  # "credito" o "debito"
