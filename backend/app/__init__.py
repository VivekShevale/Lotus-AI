from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from .config import Config
from .database.sql_db import init_sql_db

def create_app():
    load_dotenv()

    app = Flask(__name__)
    CORS(app)
    
    # Neon Database
    app.config.from_object(Config)

    # Initialize SQLAlchemy (Neon)
    init_sql_db(app)

    # import blueprints
    from app.routes.main_routes import main
    from app.routes.ml_routes import ml
    from app.routes.data_routes import data
    from app.routes.workflow import workflow_bp 
    from app.controllers.clean_controller import clean_bp
    from app.routes.auth_routes import auth_bp
    from app.routes.analyze_routes import analyze_bp
    from app.routes.model_routes import model_bp

    # register blueprints
    app.register_blueprint(main)
    app.register_blueprint(model_bp)
    app.register_blueprint(ml)
    app.register_blueprint(data)
    app.register_blueprint(workflow_bp)
    app.register_blueprint(clean_bp)
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(analyze_bp)

    return app