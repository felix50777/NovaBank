from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, get_jwt 
from datetime import timedelta
import traceback
import json
import random 
import time   

from backend.database.models import db
from backend.database.models.client import Client
from backend.database.models.account import Account
from backend.database.models.card import Card

# Imprime la ruta del archivo para depuración, asegurando que se está ejecutando el correcto
print(f"Archivo auth_routes.py: {__file__}")

auth_bp = Blueprint("auth", __name__)

# Función auxiliar para generar un número de cuenta único de 10 dígitos
def generate_unique_account_number():
    while True:
        account_num = str(int(time.time() * 1000) % 10000000000).zfill(10)
        
        if len(account_num) > 10:
            account_num = account_num[:10]
        elif len(account_num) < 10:
            account_num = account_num.zfill(10)

        if not Account.query.filter_by(account_number=account_num).first():
            return account_num

@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Ruta para registrar un nuevo cliente y asignarle automáticamente una cuenta de ahorro
    con un número de cuenta único.
    """
    try:
        data = request.get_json()
        print(f">>> Datos recibidos en /register: {json.dumps(data, indent=2)}")

        full_name = data.get("full_name", "").strip()
        email = data.get("email", "").strip()
        phone_number = data.get("phone_number", "").strip()
        cip = data.get("cip", "").strip()
        password = data.get("password", "").strip()
        
        # <<< INICIO DE REVERSIÓN >>>
        # Se elimina la lógica temporal de is_admin_request
        # is_admin_request = data.get("is_admin", False) 
        # <<< FIN DE REVERSIÓN >>>

        # Validaciones de entrada de datos
        if not all([full_name, email, phone_number, cip, password]):
            print(">>> Error de validación: Campos obligatorios faltantes.")
            return jsonify({"message": "Todos los campos son obligatorios"}), 400

        if len(password) < 6:
            print(">>> Error de validación: Contraseña demasiado corta.")
            return jsonify({"message": "La contraseña debe tener al menos 6 caracteres"}), 400

        if Client.query.filter_by(email=email).first():
            print(f">>> Error de validación: Correo ya registrado: {email}")
            return jsonify({"message": "El correo ya está registrado"}), 409

        if Client.query.filter_by(cip=cip).first():
            print(f">>> Error de validación: CIP ya registrada: {cip}")
            return jsonify({"message": "La CIP ya está registrada"}), 409

        # Crear y guardar el nuevo cliente en la base de datos
        client = Client(
            full_name=full_name,
            email=email,
            phone_number=phone_number,
            cip=cip,
            is_admin=False # <--- ¡IMPORTANTE! Vuelve a asignar is_admin como False por defecto
        )
        client.set_password(password) 
        
        db.session.add(client)
        print(">>> Cliente añadido a la sesión de la base de datos.")
        db.session.commit() 
        print(f">>> Cliente guardado en la base de datos con ID: {client.id}")

        # Crear automáticamente una cuenta de ahorro para el nuevo cliente
        if client.id: 
            new_account_number = generate_unique_account_number() 
            account = Account(
                client_id=client.id,
                account_type="ahorro",
                balance=0.0,
                account_number=new_account_number 
            )
            db.session.add(account)
            print(">>> Cuenta añadida a la sesión de la base de datos.")
            db.session.commit() 
            print(f">>> Cuenta guardada en la base de datos con ID: {account.id} para el cliente ID: {client.id} y número de cuenta: {account.account_number}")
        else:
            print(">>> ERROR: client.id no disponible después del commit del cliente. No se pudo crear la cuenta.")
            db.session.rollback() 
            return jsonify({"message": "Error al crear la cuenta del cliente."}), 500

        return jsonify({"message": "Cliente registrado exitosamente"}), 201

    except Exception as e:
        error_message = f"Error en el servidor durante el registro: {str(e)}"
        print(f">>> {error_message}")
        print(traceback.format_exc()) 
        db.session.rollback() 
        return jsonify({"message": error_message}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Ruta para iniciar sesión de un cliente y devolver un token JWT,
    junto con la información del cliente, sus cuentas y tarjetas.
    """
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

        # Traer todas las cuentas asociadas a este cliente
        accounts = Account.query.filter_by(client_id=client.id).all()
        accounts_data = [
            {
                "id": account.id,
                "account_type": account.account_type,
                "balance": account.balance,
                "account_number": account.account_number 
            }
            for account in accounts
        ]
        print(f">>> Datos de las cuentas en /login: {json.dumps(accounts_data, indent=2)}")

        # Traer todas las tarjetas asociadas a este cliente
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

        # Crear un token JWT válido por 1 hora, con el ID del cliente como identidad
        # y el claim 'is_admin' para el control de acceso de administrador
        access_token = create_access_token(
            identity=str(client.id), # Asegúrate de que client.id sea str
            expires_delta=timedelta(hours=1),
            additional_claims={"is_admin": client.is_admin} 
        )

        # Construir la respuesta JSON con el token, información del cliente, cuentas y tarjetas
        response_data = jsonify(
            {
                "token": access_token,
                "client": {
                    "id": client.id,
                    "full_name": client.full_name,
                    "email": client.email,
                    "phone_number": client.phone_number,
                    "cip": client.cip,
                    "is_admin": client.is_admin 
                },
                "accounts": accounts_data,
                "cards": cards_data,
            }
        )
        print(f">>> Respuesta de /login: {json.dumps(response_data.json, indent=2)}")
        return response_data, 200

    except Exception as e:
        error_message = f"Error en el servidor durante el login: {str(e)}"
        print(f">>> {error_message}")
        print(traceback.format_exc())
        return jsonify({"message": error_message}), 500


@auth_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():
    """
    Ruta protegida para obtener la información del dashboard de un cliente autenticado,
    incluyendo sus datos personales, cuentas y tarjetas.
    """
    try:
        client_id = get_jwt_identity()
        print(">>> ID del cliente autenticado:", client_id)

        # Buscar cliente
        client = Client.query.get(client_id)
        if not client:
            print(f">>> Cliente no encontrado con ID: {client_id}")
            return jsonify({"message": "Cliente no encontrado"}), 404

        print(">>> Datos del cliente:", client.__dict__)

        # Traer todas las cuentas asociadas a este cliente
        accounts = Account.query.filter_by(client_id=client.id).all()
        accounts_data = [
            {
                "id": account.id,
                "account_type": account.account_type,
                "balance": account.balance,
                "account_number": account.account_number 
            }
            for account in accounts
        ]
        print(">>> Datos de las cuentas en /dashboard:", json.dumps(accounts_data, indent=2))
        print(">>> Cuentas (objetos SQLA):", accounts) 

        # Traer todas las tarjetas asociadas a este cliente
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
        print(">>> Tarjetas (objetos SQLA):", cards) 

        # Retornar los datos del cliente, cuentas y tarjetas en formato JSON
        response_data = jsonify(
            {
                "client": {
                    "id": client.id,
                    "full_name": client.full_name,
                    "email": client.email,
                    "phone_number": client.phone_number,
                    "cip": client.cip,
                    "is_admin": client.is_admin 
                },
                "accounts": accounts_data,
                "cards": cards_data,
            }
        )
        print(">>> Respuesta JSON de /dashboard:", json.dumps(response_data.json, indent=2))
        return response_data, 200

    except Exception as e:
        error_message = f"Error en el servidor durante el dashboard: {str(e)}"
        print(f">>> {error_message}")
        print(traceback.format_exc())
        return jsonify({"message": error_message}), 500

