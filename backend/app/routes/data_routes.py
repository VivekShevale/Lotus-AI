from flask import Blueprint
from app.controllers.data_controller import clean_file

data = Blueprint('data', __name__)

data.route("/api/clean", methods=['POST'])(clean_file)