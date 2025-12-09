from flask import Blueprint, jsonify

# Blueprint name: "main"
main = Blueprint('main', __name__)

@main.route('/')
def home():
    return jsonify({"message": "Hello from main routes!"})