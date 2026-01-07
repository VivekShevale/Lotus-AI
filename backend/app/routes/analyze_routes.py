from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import pandas as pd
import numpy as np
import os
import uuid
import tempfile
import traceback
from app.utils.file_processor import process_file
from app.langgraph_workflow import analyze_dataset_workflow

analyze_bp = Blueprint("analyze_bp", __name__, url_prefix="/api")

# Allowed file types
ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def make_json_serializable(obj):
    """Recursively convert objects to JSON-serializable types"""
    if isinstance(obj, dict):
        return {key: make_json_serializable(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [make_json_serializable(item) for item in obj]
    elif isinstance(obj, tuple):
        return tuple(make_json_serializable(item) for item in obj)
    elif isinstance(obj, (np.integer, np.int64, np.int32, np.int16, np.int8)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64, np.float32, np.float16)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, (bool, np.bool_)):
        return bool(obj)
    elif isinstance(obj, pd.Timestamp):
        return obj.isoformat()
    elif pd.isna(obj):
        return None
    else:
        try:
            return str(obj)
        except:
            return None

@analyze_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Dataset Analyzer API is running'})

@analyze_bp.route('/analyze', methods=['POST'])
def analyze_dataset():
    """Main endpoint for dataset analysis"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed. Use CSV or Excel files.'}), 400

        # Save file temporarily
        filename = secure_filename(file.filename)
        upload_folder = current_app.config.get('UPLOAD_FOLDER', tempfile.gettempdir())
        temp_path = os.path.join(upload_folder, f"{uuid.uuid4()}_{filename}")
        file.save(temp_path)

        # Process file
        try:
            df = process_file(temp_path)
        except Exception as e:
            return jsonify({'error': f'Error reading file: {str(e)}'}), 400
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

        data = df.to_dict('records')
        columns = list(df.columns)
        task_type = request.form.get('task_type')

        # Run workflow
        result = analyze_dataset_workflow(
            data=data,
            columns=columns,
            task_type=task_type,
            filename=filename
        )
        result = make_json_serializable(result)
        return jsonify(result)

    except Exception as e:
        current_app.logger.error(f"Analysis error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@analyze_bp.route('/generate_pipeline', methods=['POST'])
def generate_pipeline():
    """Generate ML pipeline code"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        from app.routes.analyze_utils import generate_ml_pipeline

        pipeline_code = generate_ml_pipeline(
            filename=data.get('filename', 'dataset.csv'),
            task_type=data.get('task_type', 'classification'),
            target_column=data.get('target_column', 'target'),
            features=data.get('features', []),
            models=data.get('models', []),
            dataset_info=data.get('dataset_info', {})
        )
        return jsonify({'code': pipeline_code})

    except Exception as e:
        return jsonify({'error': str(e)}), 500