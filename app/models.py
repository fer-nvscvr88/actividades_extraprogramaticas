
from werkzeug.security import generate_password_hash, check_password_hash


class Estudiante:
    def __init__(self, id, nombre, apellido, rut, correo, curso):
        self.id = id
        self.nombre = nombre
        self.apellido = apellido
        self.rut = rut
        self.correo = correo
        self.curso = curso


def crear_hash(contrasena):
    return generate_password_hash(contrasena)


def verificar_contrasena(hash_guardado, contrasena):
    return check_password_hash(hash_guardado, contrasena)
