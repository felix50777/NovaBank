# backend/database/models/account.py
from backend.database.models import db

class Account(db.Model):
    __tablename__ = "accounts"

    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    account_type = db.Column(db.String(20), nullable=False)  # Ejemplo: "ahorro", "corriente"
    balance = db.Column(db.Float, default=0.0)
  # ¡FINAL! Ahora es NOT NULL y sin default si no lo quieres para nuevas entradas
    account_number = db.Column(db.String(10), unique=True, nullable=False)
    
sent_transactions = db.relationship('Transaction', foreign_keys='Transaction.sender_account_id', backref='sender', lazy=True)
received_transactions = db.relationship('Transaction', foreign_keys='Transaction.receiver_account_id', backref='receiver', lazy=True)

