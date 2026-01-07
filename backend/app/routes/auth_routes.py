from flask import Blueprint
from app.controllers.auth_controller import (
    login,
    register
)

# Blueprint name: "main"
auth_bp = Blueprint('auth', __name__)

@auth_bp.route("/login", methods=["POST"])
def login_user():
    return login()

@auth_bp.route("/register", methods=["POST"])
def register_user():
    return register()