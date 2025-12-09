from flask import Blueprint
from app.controllers.ml_controller import model_training
from flask import request, jsonify, send_file
import os

ml = Blueprint('ml', __name__)

ml.route('/api/perform', methods=['POST'])(model_training)


@ml.route('/api/download-model', methods=['POST'])
def download_model():
    try:
        data = request.json
        model_id = data.get('model_id')
        
        if not model_id:
            return jsonify({'error': 'Model ID is required'}), 400
        
        model_filename = f"{model_id}.pkl"
        model_path = os.path.join('trained_models', model_filename)
        
        if not os.path.exists(model_path):
            return jsonify({'error': 'Model file not found'}), 404
        
        return send_file(
            model_path,
            as_attachment=True,
            download_name=model_filename,
            mimetype='application/octet-stream'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500