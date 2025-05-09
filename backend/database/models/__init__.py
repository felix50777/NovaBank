from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Importa los modelos para que SQLAlchemy los registre
from .client import Client
from .account import Account
from .card import Card
