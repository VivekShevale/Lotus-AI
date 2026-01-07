from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_sql_db(app):
    db.init_app(app)
    print("SQLAlchemy (Neon) initialized")