from werkzeug.security import generate_password_hash, check_password_hash
from app.database.sql_db import db
from app.models.user import User

def register_user(data):
    existing = User.query.filter_by(email=data["email"]).first()
    if existing:
        raise ValueError("Email already registered")

    user = User(
        name=data["name"],
        email=data["email"],
        password_hash=generate_password_hash(data["password"])
    )

    db.session.add(user)
    db.session.commit()
    return user

def login_user(data):
    user = User.query.filter_by(email=data["email"]).first()

    if not user or not check_password_hash(user.password_hash, data["password"]):
        raise ValueError("Invalid email or password")

    return user