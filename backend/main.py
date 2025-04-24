# backend/main.py

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from .config import Config
from .routes.auth_routes import auth_bp
from .database.models.user import db  # instancia de SQLAlchemy

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)  # cargamos la config desde config.py

    db.init_app(app)
    jwt = JWTManager(app)

    # Registrar rutas (blueprints)
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    @app.route("/")
    def index():
        return {"message": "Bienvenido al Mini Banco Virtual"}

    return app

if __name__ == "__main__":
    app = create_app()

    # Crear tablas automáticamente al arrancar
    with app.app_context():
        db.create_all()

    app.run(debug=True)
