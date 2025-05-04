from flask import Blueprint, request, jsonify
from backend.database.models import db
from backend.database.models.user import User
from flask_jwt_extended import create_access_token
from datetime import timedelta

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()

        name = data.get("name", "").strip()
        email = data.get("email", "").strip()
        password = data.get("password", "").strip()

        # Validaciones estrictas
        if not name or not email or not password:
            return jsonify({"message": "Todos los campos son obligatorios"}), 400

        if len(password) < 6:
            return jsonify({"message": "La contraseña debe tener al menos 6 caracteres"}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({"message": "El correo ya está registrado"}), 409

        # Crear nuevo usuario
        user = User(name=name, email=email)
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        return jsonify({"message": "Usuario registrado exitosamente"}), 201

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

        user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            return jsonify({"message": "Correo o contraseña incorrectos"}), 401

        # Crear token válido por 1 hora
        access_token = create_access_token(identity=user.id, expires_delta=timedelta(hours=1))

        return jsonify({
            "token": access_token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            }
        }), 200

    except Exception as e:
        return jsonify({"message": f"Error en el servidor: {str(e)}"}), 500
