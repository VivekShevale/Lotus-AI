from flask import request, jsonify
from app.services.ml_service import linear_regression_algo, logistic_regression_algo,  decision_tree_classifier_algo
    
def model_training():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        f = request.files['file']
        target_column = request.form.get('target_column')  # get frontend selected column

        test_size = float(request.form.get('test_size'))
        enable_data_cleaning = request.form.get('enable_data_cleaning', 'true').lower() == 'true'

        # Decision Tree specific arguments
        model=request.form.get('model')
        if model == "decision-tree":
            
            criterion = request.form.get('criterion')
            if criterion in [None, "", "null"]:
                criterion = "gini"   # default allowed value
            # "gini" or "entropy"
            max_depth = int(request.form.get('max_depth',0))
            min_samples_split = int(request.form.get('min_samples_split'))
            min_samples_leaf = int(request.form.get('min_samples_leaf'))

        # Convert numeric fields safely
        # max_depth = int(max_depth) if max_depth not in [None, "", "null"] else None
        # min_samples_split = int(min_samples_split) if min_samples_split not in [None, "", "null"] else 2
        # min_samples_leaf = int(min_samples_leaf) if min_samples_leaf not in [None, "", "null"] else 1
        
        
        # Pass target_column to process_csv
        model = request.form.get('model')
        match (model):
            case "linear-regression":
                result = linear_regression_algo(f, target_column, test_size, cleaned_data=not enable_data_cleaning)
            case "logistic-regression":
                result = logistic_regression_algo(f, target_column, test_size, cleaned_data=not enable_data_cleaning)
            case "decision-tree":
                result = decision_tree_classifier_algo(f,target_column,test_size,cleaned_data=not enable_data_cleaning,criterion=criterion,max_depth=max_depth,min_samples_split=min_samples_split,min_samples_leaf=min_samples_leaf)
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