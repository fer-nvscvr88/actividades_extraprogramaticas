

import sqlite3

from flask import (
    Blueprint, render_template, request,
    redirect, url_for, session, flash
)

from app.database import conectar
from app.models import crear_hash, verificar_contrasena

main = Blueprint("main", __name__)


@main.route("/")
def inicio():
    if "estudiante_id" not in session:
        return redirect(url_for("main.login"))

    return render_template("pages/index.html")


@main.route("/registro", methods=["GET", "POST"])
def registro():
    if request.method == "POST":
        nombre = request.form.get("nombre", "").strip()
        apellido = request.form.get("apellido", "").strip()
        rut = request.form.get("rut", "").strip()
        correo = request.form.get("correo", "").strip().lower()
        curso = request.form.get("curso", "").strip()
        contrasena = request.form.get("contrasena", "")

        if not all([nombre, apellido, rut, correo, curso, contrasena]):
            flash("Completa todos los campos.")
            return render_template("pages/registro.html")

        if len(contrasena) < 8:
            flash("La contraseña debe tener al menos 8 caracteres.")
            return render_template("pages/registro.html")

        conexion = conectar()

        try:
            conexion.execute(
                """
                INSERT INTO estudiantes
                (nombre, apellido, rut, correo, curso, contrasena)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    nombre, apellido, rut, correo, curso,
                    crear_hash(contrasena)
                )
            )
            conexion.commit()

            flash("¡Registro exitoso! Ahora puedes iniciar sesión.")
            return redirect(url_for("main.login"))

        except sqlite3.IntegrityError:
            flash("Ese RUT o correo ya está registrado.")
        finally:
            conexion.close()

    return render_template("pages/registro.html")


@main.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        identificador = request.form.get(
            "identificador", ""
        ).strip()

        contrasena = request.form.get("contrasena", "")

        conexion = conectar()

        try:
            estudiante = conexion.execute(
                """
                SELECT * FROM estudiantes
                WHERE rut = ? OR correo = ?
                """,
                (identificador, identificador.lower())
            ).fetchone()
        finally:
            conexion.close()

        if estudiante and verificar_contrasena(
            estudiante["contrasena"], contrasena
        ):
            session.clear()
            session["estudiante_id"] = estudiante["id"]
            session["estudiante_nombre"] = estudiante["nombre"]

            return redirect(url_for("main.inicio"))

        flash("RUT, correo o contraseña incorrectos.")

    return render_template("pages/login.html")


@main.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("main.login"))
