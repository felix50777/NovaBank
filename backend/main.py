from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .config import Config
from backend.database.models import db
from flask_bcrypt import Bcrypt

from backend.routes.auth_routes import auth_bp

app = Flask(__name__)
app.config.from_object(Config)
bcrypt = Bcrypt()

CORS(app)
db.init_app(app)
bcrypt.init_app(app)
JWTManager(app)

# Registrar rutas
app.register_blueprint(auth_bp, url_prefix="/api/auth")

if __name__ == "__main__":
    app.run(debug=True)
