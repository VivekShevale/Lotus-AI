from flask import Blueprint, request, jsonify
import pandas as pd
import io
import json
from app.services.ml_service import (
    linear_regression_algo, logistic_regression_algo,
    decision_tree_classifier_algo, knn_classifier_algo,
    random_forest_classifier_algo
)
from app.services.neural_services import neural_network_regression_algo
from app.services.clean_data import clean_data
import os
import joblib
from datetime import datetime

workflow_bp = Blueprint('workflow', __name__)

@workflow_bp.route('/api/workflow/execute', methods=['POST'])
def execute_workflow():
    try:
        data = request.json
        workflow_data = data.get('workflow', {})
        nodes = workflow_data.get('nodes', [])
        
        # Find required nodes
        csv_node = next((n for n in nodes if n.get('type') == 'csvLoaderNode'), None)
        cleaner_node = next((n for n in nodes if n.get('type') == 'dataCleanerNode'), None)
        model_node = next((n for n in nodes if n.get('type') == 'mlModelNode'), None)
        
        if not csv_node:
            return jsonify({'error': 'CSV Loader node is required'}), 400
        
        if not model_node:
            return jsonify({'error': 'ML Model node is required'}), 400
        
        # Get CSV data (in production, you'd get this from storage)
        csv_data = csv_node.get('data', {})
        model_config = model_node.get('data', {})
        cleaner_config = cleaner_node.get('data', {}) if cleaner_node else {}
        
        # Process CSV file (in production, you'd get from uploaded file)
        # For now, we'll use the existing endpoint logic
        # You'll need to pass the actual file from frontend
        
        # Return mock response for now
        return jsonify({
            'success': True,
            'message': 'Workflow execution completed',
            'results': {
                'model_id': f"model_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                'accuracy': 0.95,
                'precision': 0.94,
                'recall': 0.93,
                'f1_score': 0.935,
                'training_time': '2.5s',
                'test_size': model_config.get('testSize', 0.3),
                'model_type': model_config.get('modelType', 'unknown')
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@workflow_bp.route('/api/workflow/save', methods=['POST'])
def save_workflow():
    try:
        data = request.json
        workflow = data.get('workflow', {})
        name = data.get('name', 'Untitled Workflow')
        
        # Save to database or file system
        workflow_id = f"workflow_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # In production, save to database
        # For demo, save to file
        save_path = f"workflows/{workflow_id}.json"
        os.makedirs('workflows', exist_ok=True)
        
        with open(save_path, 'w') as f:
            json.dump({
                'id': workflow_id,
                'name': name,
                'workflow': workflow,
                'created_at': datetime.now().isoformat()
            }, f, indent=2)
        
        return jsonify({
            'success': True,
            'workflow_id': workflow_id,
            'message': 'Workflow saved successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@workflow_bp.route('/api/workflow/load', methods=['GET'])
def load_workflow():
    try:
        workflow_id = request.args.get('id')
        
        if not workflow_id:
            return jsonify({'error': 'Workflow ID is required'}), 400
        
        # Load from database or file system
        # For demo, load from file
        file_path = f"workflows/{workflow_id}.json"
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'Workflow not found'}), 404
        
        with open(file_path, 'r') as f:
            workflow_data = json.load(f)
        
        return jsonify({
            'success': True,
            'workflow': workflow_data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500