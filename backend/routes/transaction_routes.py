from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.database.models import db
from backend.database.models.account import Account
from backend.database.models.transaction import Transaction
from backend.database.models.client import Client

transaction_bp = Blueprint("transaction_bp", __name__, url_prefix="/api/transactions")

@transaction_bp.route("/transfer", methods=["POST"])
@jwt_required()
def transfer():
    data = request.get_json()
    sender_account_id = data.get("sender_account_id")
    receiver_account_id = data.get("receiver_account_id")
    amount = data.get("amount")
    description = data.get("description", "")

    if not all([sender_account_id, receiver_account_id, amount]):
        return jsonify({"message": "Faltan campos obligatorios"}), 400

    if sender_account_id == receiver_account_id:
        return jsonify({"message": "No puedes transferirte a ti mismo"}), 400

    # Validar que el usuario logueado es el dueño de la cuenta origen
    user_id = get_jwt_identity()
    sender_account = Account.query.filter_by(id=sender_account_id, client_id=user_id).first()
    receiver_account = Account.query.get(receiver_account_id)

    if not sender_account or not receiver_account:
        return jsonify({"message": "Cuentas no válidas"}), 404

    if sender_account.balance < amount:
        return jsonify({"message": "Saldo insuficiente"}), 400

    # Ejecutar transferencia
    sender_account.balance -= amount
    receiver_account.balance += amount

    transaction = Transaction(
        sender_account_id=sender_account.id,
        receiver_account_id=receiver_account.id,
        amount=amount,
        description=description
    )

    db.session.add(transaction)
    db.session.commit()

    return jsonify({"message": "Transferencia exitosa"}), 200
