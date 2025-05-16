from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from datetime import timedelta
import traceback
import json
from backend.database.models import db
from backend.database.models.client import Client
from backend.database.models.account import Account
from backend.database.models.card import Card

print(f"Archivo auth_routes.py: {__file__}")  # Agrega esta línea

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
            cip=cip,
        )
        client.set_password(password)

        db.session.add(client)
        db.session.commit()

        # 🚀 Crear automáticamente una cuenta
        account = Account(
            client_id=client.id,
            account_type="ahorro",
            balance=0.0,
        )
        db.session.add(account)
        db.session.commit()

        return jsonify({"message": "Cliente registrado exitosamente"}), 201

    except Exception as e:
        error_message = f"Error en el servidor: {str(e)}"
        print(f"Error en /register: {error_message}")
        print(traceback.format_exc())
        return jsonify({"message": error_message}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        print(f">>> Datos recibidos en /login: {json.dumps(data, indent=2)}")

        email = data.get("email", "").strip()
        password = data.get("password", "").strip()

        if not email or not password:
            return jsonify({"message": "Correo y contraseña son obligatorios"}), 400

        client = Client.query.filter_by(email=email).first()

        if not client or not client.check_password(password):
            return jsonify({"message": "Correo o contraseña incorrectos"}), 401

        # Traer sus cuentas
        accounts = Account.query.filter_by(client_id=client.id).all()
        accounts_data = [
            {
                "id": account.id,
                "account_type": account.account_type,
                "balance": account.balance,
            }
            for account in accounts
        ]
        print(f">>> Datos de las cuentas en /login: {json.dumps(accounts_data, indent=2)}")

        # Traer sus tarjetas
        cards = Card.query.filter_by(client_id=client.id).all()
        cards_data = [
            {
                "id": card.id,
                "card_type": card.card_type,
                "card_number": card.card_number,
                "provider": card.provider,
            }
            for card in cards
        ]
        print(f">>> Datos de las tarjetas en /login: {json.dumps(cards_data, indent=2)}")

        # Crear token válido por 1 hora
        access_token = create_access_token(identity=str(client.id), expires_delta=timedelta(hours=1))  # Convertir client.id a string

        response_data = jsonify(
            {
                "token": access_token,
                "client": {
                    "id": client.id,
                    "full_name": client.full_name,
                    "email": client.email,
                    "phone_number": client.phone_number,
                    "cip": client.cip,
                },
                "accounts": accounts_data,
                "cards": cards_data,
            }
        )
        print(f">>> Respuesta de /login: {json.dumps(response_data.json, indent=2)}")
        return response_data, 200

    except Exception as e:
        error_message = f"Error en el servidor: {str(e)}"
        print(f"Error en /login: {error_message}")
        print(traceback.format_exc())
        return jsonify({"message": error_message}), 500

# 🚀 Dashboard del cliente autenticado
# 🚀 Dashboard del cliente autenticado
# 🚀 Dashboard del cliente autenticado
@auth_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():
    try:
        client_id = get_jwt_identity()
        print(">>> ID del cliente autenticado:", client_id)

        # Buscar cliente
        client = Client.query.get(client_id)
        if not client:
            print(f">>> Cliente no encontrado con ID: {client_id}")
            return jsonify({"message": "Cliente no encontrado"}), 404

        print(">>> Datos del cliente:", client.__dict__)

        # Traer sus cuentas
        accounts = Account.query.filter_by(client_id=client.id).all()
        accounts_data = [
            {
                "id": account.id,
                "account_type": account.account_type,
                "balance": account.balance,
            }
            for account in accounts
        ]
        print(">>> Datos de las cuentas en /dashboard:", json.dumps(accounts_data, indent=2))
        print(">>> Cuentas:", accounts)

        # Traer sus tarjetas
        cards = Card.query.filter_by(client_id=client.id).all()
        cards_data = [
            {
                "id": card.id,
                "card_type": card.card_type,
                "card_number": card.card_number,
                "provider": card.provider,
            }
            for card in cards
        ]
        print(">>> Datos de las tarjetas en /dashboard:", json.dumps(cards_data, indent=2))
        print(">>> Tarjetas:", cards)

        # Retornar los datos del cliente, cuentas y tarjetas en formato JSON
        response_data = jsonify(
            {
                "client": {
                    "id": client.id,
                    "full_name": client.full_name,
                    "email": client.email,
                    "phone_number": client.phone_number,
                    "cip": client.cip,
                },
                "accounts": accounts_data,
                "cards": cards_data,
            }
        )
        print(">>> Respuesta JSON de /dashboard:", json.dumps(response_data.json, indent=2))
        return response_data, 200

    except Exception as e:
        error_message = f"Error en el servidor: {str(e)}"
        print(f"Error en /dashboard: {error_message}")
        print(traceback.format_exc())
        return jsonify({"message": error_message}), 500