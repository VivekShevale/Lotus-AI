from flask import request
from marshmallow import ValidationError

from app.schemas.user_schema import (
    RegisterSchema,
    LoginSchema,
    UserResponseSchema
)
from app.services.auth_service import register_user, login_user

register_schema = RegisterSchema()
login_schema = LoginSchema()
user_schema = UserResponseSchema()

# POST: api/auth/register
def register():
    try:
        data = register_schema.load(request.json)
        user = register_user(data)
        return user_schema.dump(user), 201
    except ValidationError as err:
        return {"errors": err.messages}, 400
    except ValueError as err:
        return {"error": str(err)}, 409

# POST: api/auth/login
def login():
    try:
        data = login_schema.load(request.json)
        user = login_user(data)
        return user_schema.dump(user), 200
    except ValidationError as err:
        return {"errors": err.messages}, 400
    except ValueError as err:
        return {"error": str(err)}, 401