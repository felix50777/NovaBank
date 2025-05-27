from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from .config import Config
from backend.database.models import db
from flask_bcrypt import Bcrypt
from backend.routes.auth_routes import auth_bp
from backend.routes.admin_routes import admin_bp # <--- ¡IMPORTA admin_bp!

# Inicialización de extensiones
bcrypt = Bcrypt()
jwt = JWTManager()
migrate = Migrate()

def create_app():
    app = Flask(__name__)

    # Configuración principal
    app.config.from_object(Config)

    # Configuración adicional necesaria para evitar errores 422
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'

    # Inicializar extensiones
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

    # Registrar rutas
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    print("Blueprint auth_bp registrado con el prefijo /api/auth") 

    app.register_blueprint(admin_bp, url_prefix="/api/admin") # <--- ¡REGISTRA admin_bp!
    print("Blueprint admin_bp registrado con el prefijo /api/admin") # Log para verificar

    return app

# Para desarrollo local
if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
