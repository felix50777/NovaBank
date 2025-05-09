from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.database.models import db
from backend.database.models.client import Client  # Importar el nuevo modelo
from backend.database.models.account import Account
from backend.database.models.card import Card
from flask_jwt_extended import create_access_token
from datetime import timedelta

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()

        full_name = data.get("full_name", "").strip()
        email = data.get("email", "").strip()
        phone_number = data.get("phone_number", "").strip()
        cip = data.get("cip", "").strip()
        password = data.get("password", "").strip()

        # Validaciones estrictas
        if not full_name or not email or not phone_number or not cip or not password:
            return jsonify({"message": "Todos los campos son obligatorios"}), 400

        if len(password) < 6:
            return jsonify({"message": "La contraseña debe tener al menos 6 caracteres"}), 400

        if Client.query.filter_by(email=email).first():
            return jsonify({"message": "El correo ya está registrado"}), 409

        if Client.query.filter_by(cip=cip).first():
            return jsonify({"message": "La CIP ya está registrada"}), 409

        # Crear nuevo cliente
        client = Client(
            full_name=full_name,
            email=email,
            phone_number=phone_number,
            cip=cip
        )
        client.set_password(password)
        
        

        db.session.add(client)
        db.session.commit()
        
        # 🚀 Crear automáticamente una cuenta
        account = Account(
            client_id=client.id,
            tipo_cuenta="ahorro",
            balance=0.0
        )
        db.session.add(account)
        db.session.commit()

        return jsonify({"message": "Cliente registrado exitosamente"}), 201

    except Exception as e:
        return jsonify({"message": f"Error en el servidor: {str(e)}"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()

        email = data.get("email", "").strip()
        password = data.get("password", "").strip()

        if not email or not password:
            return jsonify({"message": "Correo y contraseña son obligatorios"}), 400

        client = Client.query.filter_by(email=email).first()

        if not client or not client.check_password(password):
            return jsonify({"message": "Correo o contraseña incorrectos"}), 401

        # Crear token válido por 1 hora
        access_token = create_access_token(identity=client.id, expires_delta=timedelta(hours=1))

        return jsonify({
            "token": access_token,
            "client": {
                "id": client.id,
                "full_name": client.full_name,
                "email": client.email,
                "phone_number": client.phone_number,
                "cip": client.cip
            }
        }), 200

    except Exception as e:
        return jsonify({"message": f"Error en el servidor: {str(e)}"}), 500
    
    # 🚀 Dashboard del cliente autenticado
@auth_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():
    try:
        client_id = get_jwt_identity()

        # Buscar cliente
        client = Client.query.get(client_id)
        if not client:
            return jsonify({"message": "Cliente no encontrado"}), 404

        # Traer sus cuentas
        accounts = Account.query.filter_by(client_id=client.id).all()
        accounts_data = [
            {
                "id": account.id,
                "tipo_cuenta": account.tipo_cuenta,
                "balance": account.balance
            }
            for account in accounts
        ]

        # Traer sus tarjetas
        cards = Card.query.filter_by(client_id=client.id).all()
        cards_data = [
            {
                "id": card.id,
                "tipo_tarjeta": card.tipo_tarjeta,
                "numero_tarjeta": card.numero_tarjeta,
                "marca": card.marca
            }
            for card in cards
        ]

        return jsonify({
            "cliente": {
                "id": client.id,
                "nombre": client.nombre,
                "email": client.email,
                "telefono": client.telefono,
                "cip": client.cip
            },
            "cuentas": accounts_data,
            "tarjetas": cards_data
        }), 200

    except Exception as e:
        return jsonify({"message": f"Error en el servidor: {str(e)}"}), 500
