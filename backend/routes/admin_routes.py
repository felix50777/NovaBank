# backend/routes/admin_routes.py

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt 
from functools import wraps
# <<< INICIO DE CORRECCIÓN: Importar db >>>
from backend.database.models import db, Client, Account, Card # Asegúrate de importar db
# <<< FIN DE CORRECCIÓN >>>
import traceback # Para depuración

admin_bp = Blueprint('admin_bp', __name__)

# Decorador para verificar si el usuario es administrador
def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            claims = get_jwt()
            if not claims.get('is_admin'):
                return jsonify({"message": "Acceso de administrador requerido"}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

# Ruta para obtener todas las cuentas (solo para administradores)
# Incluye el nombre completo del cliente asociado a cada cuenta
@admin_bp.route('/accounts', methods=['GET']) 
@jwt_required() 
@admin_required() # Asegura que solo los administradores puedan acceder
def get_all_accounts(): 
    try:
        print(">>> Usuario administrador validado por decorador, recuperando todas las cuentas con nombres de cliente.")

        # Obtener todas las cuentas y sus clientes asociados
        # Usamos .all() para ejecutar la consulta y obtener los objetos
        all_accounts_with_clients = db.session.query(Account, Client).\
                                    join(Client, Account.client_id == Client.id).\
                                    all()
        
        accounts_data = []

        for account, client in all_accounts_with_clients:
            accounts_data.append({
                "id": account.id,
                "client_id": account.client_id, 
                "client_full_name": client.full_name, # Nombre del cliente
                "account_number": account.account_number,
                "account_type": account.account_type,
                "balance": account.balance,
            })

        print(f">>> Total de cuentas recuperadas con nombres de cliente: {len(accounts_data)}")

        return jsonify(accounts_data), 200 # Devuelve directamente el array de cuentas

    except Exception as e:
        error_message = f"Error en el servidor al obtener todas las cuentas (admin): {str(e)}"
        print(f">>> {error_message}")
        print(traceback.format_exc())
        return jsonify({"message": error_message}), 500

# Opcional: Ruta para obtener todos los clientes con sus detalles (si la necesitas)
@admin_bp.route('/clients', methods=['GET'])
@jwt_required()
@admin_required()
def get_all_clients_with_details():
    try:
        print(">>> Usuario administrador validado, recuperando todos los clientes con detalles.")
        all_clients = Client.query.all()
        clients_data = []

        for client in all_clients:
            accounts = Account.query.filter_by(client_id=client.id).all()
            accounts_data = [
                {
                    "id": account.id,
                    "account_type": account.account_type,
                    "balance": account.balance,
                    "account_number": account.account_number,
                }
                for account in accounts
            ]

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

            client_data = {
                "id": client.id,
                "full_name": client.full_name,
                "email": client.email,
                "phone_number": client.phone_number,
                "cip": client.cip,
                "is_admin": client.is_admin,
                "accounts": accounts_data,
                "cards": cards_data,
            }
            clients_data.append(client_data)

        print(f">>> Total de clientes con detalles recuperados: {len(clients_data)}")
        return jsonify({"clients": clients_data}), 200

    except Exception as e:
        error_message = f"Error en el servidor al obtener todos los clientes con detalles: {str(e)}"
        print(f">>> {error_message}")
        print(traceback.format_exc())
        return jsonify({"message": error_message}), 500
