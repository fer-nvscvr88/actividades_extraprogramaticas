
from flask import Flask


def create_app():
    app = Flask(
        __name__,
        template_folder="../templates",
        static_folder="../static"
    )

    # Clave para proteger las sesiones
    app.config["SECRET_KEY"] = "cambia-esta-clave-por-una-clave-secreta"

    # Crear la base de datos si todavía no existe
    from app.database import init_db
    init_db()

    # Registrar las rutas
    from app.routes import main
    app.register_blueprint(main)

    return app
