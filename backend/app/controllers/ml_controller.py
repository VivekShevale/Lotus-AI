from flask import request, jsonify
from app.services.ml_service import linear_regression_algo, logistic_regression_algo,  decision_tree_classifier_algo, knn_classifier_algo, random_forest_classifier_algo
from app.services.neural_services import neural_network_regression_algo    

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
        
        elif model == "KNN":
            # n_neighbors (int)
            n_neighbors = request.form.get("n_neighbors")
            if n_neighbors in [None, "", "null"]:
                n_neighbors = 5
            else:
                n_neighbors = int(n_neighbors)

            # weights (string)
            weights = request.form.get("weights")
            if weights in [None, "", "null"]:
                weights = "uniform"  # default
            # allowed: "uniform", "distance"

            # algorithm (string)
            algorithm = request.form.get("algorithm")
            if algorithm in [None, "", "null"]:
                algorithm = "auto"
            # allowed: auto, ball_tree, kd_tree, brute

            # metric (string)
            metric = request.form.get("metric")
            if metric in [None, "", "null"]:
                metric = "minkowski"
                # allowed: minkowski, euclidean, manhattan, etc.        
                
        elif model == "random-forest":
        # n_estimators (int)
            n_estimators = request.form.get("n_estimators")
            if n_estimators in [None, "", "null"]:
                n_estimators = 200       # default
            else:
                n_estimators = int(n_estimators)

            # criterion (string)
            criterion = request.form.get("criterion")
            if criterion in [None, "", "null"]:
                criterion = "gini"
            # allowed: gini, entropy, log_loss

            # max_depth (int or None)
            max_depth = request.form.get("max_depth")
            if max_depth in [None, "", "null", "0"]:
                max_depth = None
            else:
                max_depth = int(max_depth)

            # min_samples_split (int)
            min_samples_split = request.form.get("min_samples_split")
            if min_samples_split in [None, "", "null"]:
                min_samples_split = 2
            else:
                min_samples_split = int(min_samples_split)

            # min_samples_leaf (int)
            min_samples_leaf = request.form.get("min_samples_leaf")
            if min_samples_leaf in [None, "", "null"]:
                min_samples_leaf = 1
            else:
                min_samples_leaf = int(min_samples_leaf)

            # class_weight (string or None)
            class_weight = request.form.get("class_weight")
            if class_weight in [None, "", "null", "None"]:
                class_weight = None
            # allowed: None, "balanced", "balanced_subsample"

        
        # Pass target_column to process_csv
        model = request.form.get('model')
        match (model):
            case "linear-regression":
                result = linear_regression_algo(f, target_column, test_size, cleaned_data=not enable_data_cleaning)
            case "logistic-regression":
                result = logistic_regression_algo(f, target_column, test_size, cleaned_data=not enable_data_cleaning)
            case "decision-tree":
                result = decision_tree_classifier_algo(f,target_column,test_size,cleaned_data=not enable_data_cleaning,criterion=criterion,max_depth=max_depth,min_samples_split=min_samples_split,min_samples_leaf=min_samples_leaf)
            case "KNN":
                result = knn_classifier_algo(f,target_column,test_size,cleaned_data=not enable_data_cleaning,n_neighbors=n_neighbors,weights=weights,algorithm=algorithm,metric=metric)
            case "random-forest":
                result = random_forest_classifier_algo(f,target_column,test_size,cleaned_data =not enable_data_cleaning,n_estimators=n_estimators,criterion=criterion,max_depth=max_depth,min_samples_split=min_samples_split,min_samples_leaf=min_samples_leaf,class_weight=class_weight)
            case "neural-network":
                result = neural_network_regression_algo(f, target_column=None, test_size=0.3, random_state=101, cleaned_data=True,
                                   hidden_layer_sizes=(100,), activation='relu', solver='adam', max_iter=500)
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