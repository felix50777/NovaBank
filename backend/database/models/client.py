# backend/database/models/client.py
from backend.database.models import db
from werkzeug.security import generate_password_hash, check_password_hash

class Client(db.Model):
    __tablename__ = "clients"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    cip = db.Column(db.String(20), unique=True, nullable=False)  # Cédula de Identidad Personal (CIP)
    password_hash = db.Column(db.String(128), nullable=False)

    accounts = db.relationship('Account', backref='client', lazy=True)
    cards = db.relationship('Card', backref='client', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

