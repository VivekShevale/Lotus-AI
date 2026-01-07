# app/controllers/clean_controller.py
from flask import Blueprint, request, jsonify
import pandas as pd
import io
import json
from app.services.clean_service import clean_data

clean_bp = Blueprint('clean', __name__)

@clean_bp.route('/api/clean-data', methods=['POST'])
def clean_data_endpoint():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        
        # Read file based on extension
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(file.read()))
        elif file.filename.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(io.BytesIO(file.read()))
        else:
            return jsonify({'error': 'Unsupported file format. Use CSV or Excel.'}), 400
        
        # Get cleaning parameters from request
        scaling_method = request.form.get('scaling_method', 'Standard')
        missing_values = request.form.get('missing_values', 'Impute')
        
        # Clean the data
        cleaned_df, report = clean_data(
            df=df,
            scaling_method=scaling_method,
            missing_values=missing_values
        )
        
        # Convert cleaned data to CSV string
        cleaned_csv = cleaned_df.to_csv(index=False)
        
        return jsonify({
            'success': True,
            'report': report,
            'cleaned_data': cleaned_csv,
            'rows': len(cleaned_df),
            'columns': len(cleaned_df.columns),
            'columns_list': list(cleaned_df.columns)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@clean_bp.route('/api/analyze-data', methods=['POST'])
def analyze_data():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        
        # Read file based on extension
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(file.read()))
        elif file.filename.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(io.BytesIO(file.read()))
        else:
            return jsonify({'error': 'Unsupported file format. Use CSV or Excel.'}), 400
        
        # Analyze the data
        analysis = {
            'rows': len(df),
            'columns': len(df.columns),
            'column_names': list(df.columns),
            'data_types': df.dtypes.astype(str).to_dict(),
            'missing_values': df.isnull().sum().to_dict(),
            'missing_percentage': (df.isnull().sum() / len(df) * 100).round(2).to_dict(),
            'numerical_columns': df.select_dtypes(include=['int64', 'float64']).columns.tolist(),
            'categorical_columns': df.select_dtypes(include=['object', 'category']).columns.tolist(),
            'sample_data': df.head(5).to_dict(orient='records')
        }
        
        return jsonify(analysis)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500