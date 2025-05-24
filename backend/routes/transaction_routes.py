from flask import Blueprint, request, jsonify
from backend.database.models import db
from backend.database.models.account import Account
from backend.database.models.transaction import Transaction
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging # Importar logging para registrar errores

transaction_bp = Blueprint("transaction_bp", __name__, url_prefix="/api/transactions")

# Configuración básica de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# 📤 Realizar transferencia
@transaction_bp.route("/transfer", methods=["POST"])
@jwt_required()
def transfer():
    data = request.get_json()
    sender_id = data.get("sender_account_id")
    receiver_id = data.get("receiver_account_id")
    amount = data.get("amount")
    description = data.get("description", "")

    # Validaciones iniciales
    if not all([sender_id, receiver_id, amount]):
        return jsonify({"message": "Datos incompletos. Se requieren sender_account_id, receiver_account_id y amount."}), 400

    try:
        amount = float(amount) # Asegurarse de que el monto sea un número
        if amount <= 0:
            return jsonify({"message": "El monto de la transferencia debe ser positivo."}), 400
    except ValueError:
        return jsonify({"message": "El monto de la transferencia no es un número válido."}), 400

    if sender_id == receiver_id:
        return jsonify({"message": "No puedes transferir fondos a la misma cuenta."}), 400

    # Iniciar la transacción de la base de datos
    try:
        sender = Account.query.get(sender_id)
        receiver = Account.query.get(receiver_id)

        if not sender:
            return jsonify({"message": "Cuenta de origen no encontrada."}), 404
        if not receiver:
            return jsonify({"message": "Cuenta de destino no encontrada."}), 404

        # Validación de fondos
        if sender.balance < amount:
            return jsonify({"message": "Fondos insuficientes en la cuenta de origen."}), 400

        # --- Operaciones que deben ser atómicas ---
        sender.balance -= amount
        receiver.balance += amount

        # Registrar transacción
        transaction = Transaction(
            sender_account_id=sender.id, # Usar sender.id y receiver.id para asegurar que son los IDs de los objetos encontrados
            receiver_account_id=receiver.id,
            amount=amount,
            description=description
        )
        db.session.add(transaction)

        # Confirmar todos los cambios
        db.session.commit()

        logging.info(f"Transferencia exitosa de {sender.id} a {receiver.id} por {amount}")
        return jsonify({"message": "Transferencia realizada con éxito."}), 200

    except Exception as e:
        db.session.rollback() # Si algo falla, revertir todos los cambios
        logging.error(f"Error al procesar la transferencia: {e}")
        return jsonify({"message": f"Ocurrió un error inesperado al procesar la transferencia: {str(e)}"}), 500

# 📄 Historial de transacciones
@transaction_bp.route("/history/<int:account_id>", methods=["GET"])
@jwt_required()
def get_history(account_id):
    # NOTA IMPORTANTE: Para una seguridad completa, aquí deberías verificar que
    # get_jwt_identity() (el ID del usuario autenticado) es el propietario de la cuenta
    # o tiene permisos para ver el historial de account_id.
    # Por ejemplo:
    # current_user_id = get_jwt_identity()
    # account = Account.query.get(account_id)
    # if not account or account.user_id != current_user_id:
    #     return jsonify({"message": "Acceso denegado o cuenta no encontrada."}), 403

    account = Account.query.get(account_id)
    if not account:
        return jsonify({"message": "Cuenta no encontrada."}), 404

    transactions = Transaction.query.filter(
        (Transaction.sender_account_id == account_id) |
        (Transaction.receiver_account_id == account_id)
    ).order_by(Transaction.timestamp.desc()).all()

    result = []
    for t in transactions:
        # Aquí puedes agregar lógica para mostrar si es un envío o una recepción
        # y quizás el nombre del remitente/destinatario si lo necesitas.
        
        # Para el frontend, podría ser útil indicar el tipo de transacción
        transaction_type = "sent" if t.sender_account_id == account_id else "received"
        
        # Opcional: Obtener nombres de las cuentas para una mejor visualización
        sender_name = t.sender_account.user.username if t.sender_account and t.sender_account.user else "N/A"
        receiver_name = t.receiver_account.user.username if t.receiver_account and t.receiver_account.user else "N/A"

        result.append({
            "id": t.id,
            "sender_account_id": t.sender_account_id,
            "receiver_account_id": t.receiver_account_id,
            "amount": t.amount,
            "description": t.description,
            "timestamp": t.timestamp.isoformat(),
            "type": transaction_type,
            "sender_username": sender_name,
            "receiver_username": receiver_name
        })

    return jsonify(result), 200
