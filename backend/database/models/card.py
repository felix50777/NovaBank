# backend/database/models/card.py
from backend.database.models import db

class Card(db.Model):
    __tablename__ = "cards"

    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    card_number = db.Column(db.String(16), unique=True, nullable=False)
    card_type = db.Column(db.String(10), nullable=False)  # Ejemplo: "debito" o "credito"
    provider = db.Column(db.String(20), nullable=False)  # Ejemplo: "VISA", "MasterCard", "Clave"
