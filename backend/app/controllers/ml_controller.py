from flask import request, jsonify
from app.services.ml_service import linear_regression_algo, logistic_regression_algo
    
def model_training():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        f = request.files['file']
        target_column = request.form.get('target_column')  # get frontend selected column

        test_size = float(request.form.get('test_size'))
        enable_data_cleaning = request.form.get('enable_data_cleaning', 'true').lower() == 'true'

        # Pass target_column to process_csv
        model = request.form.get('model')
        match (model):
            case "linear-regression":
                result = linear_regression_algo(f, target_column, test_size, cleaned_data=not enable_data_cleaning)
            case "logistic-regression":
                result = logistic_regression_algo(f, target_column, test_size, cleaned_data=not enable_data_cleaning)
            case _:  # default case
                raise ValueError(f"Unknown model: {model}")
    
        # If process_csv returns an error
        if 'error' in result:
            return jsonify(result), 400

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# def linear_regression():
#     try:
#         if 'file' not in request.files:
#             return jsonify({'error': 'No file uploaded'}), 400

#         f = request.files['file']
#         target_column = request.form.get('target_column')  # get frontend selected column

#         test_size = float(request.form.get('test_size'))
#         enable_data_cleaning = request.form.get('enable_data_cleaning', 'true').lower() == 'true'
        
#         # Pass target_column to process_csv
#         result = linear_regression_algo(f, target_column, test_size, cleaned_data=not enable_data_cleaning)

#         # If process_csv returns an error
#         if 'error' in result:
#             return jsonify(result), 400

#         return jsonify(result)

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500
    
# def logistic_regression():
#     try:
#         if 'file' not in request.files:
#             return jsonify({'error': 'No file uploaded'}), 400

#         f = request.files['file']
#         target_column = request.form.get('target_column')  # get frontend selected column

#         test_size = float(request.form.get('test_size'))
#         enable_data_cleaning = request.form.get('enable_data_cleaning', 'true').lower() == 'true'

#         # Pass target_column to process_csv
#         result = logistic_regression_algo(f, target_column, test_size, cleaned_data=not enable_data_cleaning)

#         # If process_csv returns an error
#         if 'error' in result:
#             return jsonify(result), 400

#         return jsonify(result)

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500