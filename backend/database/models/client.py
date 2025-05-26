
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
    password_hash = db.Column(db.Text, nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False) # <--- ¡AÑADE ESTA LÍNEA!


    accounts = db.relationship('Account', backref='client', lazy=True)
    cards = db.relationship('Card', backref='client', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self): # <--- Asegúrate de que este método exista y incluya 'is_admin'
        return {
            'id': self.id,
            'full_name': self.full_name,
            'email': self.email,
            'phone_number': self.phone_number,
            'cip': self.cip,
            'is_admin': self.is_admin
        }
