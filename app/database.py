
import sqlite3
from pathlib import Path

RUTA_BD = Path(__file__).resolve().parent / "estudiantes.db"


def conectar():
    conexion = sqlite3.connect(RUTA_BD)
    conexion.row_factory = sqlite3.Row
    return conexion


def init_db():
    conexion = conectar()

    conexion.execute("""
        CREATE TABLE IF NOT EXISTS estudiantes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            apellido TEXT NOT NULL,
            rut TEXT NOT NULL UNIQUE,
            correo TEXT NOT NULL UNIQUE,
            curso TEXT NOT NULL,
            contrasena TEXT NOT NULL
        )
    """)

    conexion.commit()
    conexion.close()
