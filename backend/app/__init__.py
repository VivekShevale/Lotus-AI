from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)

    # import blueprints
    from app.routes.main_routes import main
    from app.routes.ml_routes import ml
    from app.routes.data_routes import data

    # register blueprints
    app.register_blueprint(main)
    app.register_blueprint(ml)
    app.register_blueprint(data)

    return app