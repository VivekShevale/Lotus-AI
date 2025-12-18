from flask import request, jsonify
from app.services.ml_service import linear_regression_algo, logistic_regression_algo,  decision_tree_classifier_algo, knn_classifier_algo, random_forest_classifier_algo, ridge_regression_algo, svm_classifier_algo, lasso_regression_algo, elastic_net_regression_algo, adaboost_classifier_algo, gradient_boosting_classifier_algo, principal_component_analysis_algo
from app.services.neural_services import neural_network_regression_algo    
from app.services.image_classifier import train_image_classifier

def model_training():
    try:
        if ('file' not in request.files) and ('dataset' not in request.files):
            return jsonify({'error': 'No file uploaded'}), 400
        
        if 'file' in request.files:
            f = request.files['file']
            target_column = request.form.get('target_column')  # get frontend selected column
            random_state = int(request.form.get('random_state'))
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
        
        elif model=="neural-network":
            raw= request.form.get("hidden_layer_sizes")
            hidden_layer_sizes = tuple(int(x) for x in raw.split(","))
            activation = request.form.get('activation')
            solver = request.form.get('solver')
            max_iter = int(request.form.get("max_iter"))

        elif model=="ridge-regression":
            alpha = float(request.form.get('alpha'))

        elif model=="image-classifier":
            import tempfile, zipfile, os
            zip_file = request.files["dataset"]
            temp_dir = tempfile.mkdtemp()

            zip_path = os.path.join(temp_dir, "dataset.zip")
            zip_file.save(zip_path)

            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)

            dataset_path = temp_dir

            # Read parameters
            img_size_raw = request.form.get("img_size", "224,224")
            img_size = tuple(map(int, img_size_raw.replace("x", ",").split(",")))

            batch_size = int(request.form.get("batch_size", 32))
            epochs = int(request.form.get("epochs", 10))
            learning_rate = float(request.form.get("learning_rate", 0.0001))

            model_architecture = request.form.get("model_architecture", "EfficientNet")
            data_augmentation = request.form.get("data_augmentation", "true") == "true"
            
        elif model == "support-vector-machine":
            kernel = request.form.get("kernel")
            # kernel (string)
            if kernel in [None, "", "null"]:
                kernel = "rbf"   # default
            # allowed: linear, rbf, poly, sigmoid

            C = request.form.get("C")
            # C (float)
            if C in [None, "", "null"]:
                C = 1.0
            else:
                C = float(C)

            gamma = request.form.get("gamma")
            # gamma (string or float)
            if gamma in [None, "", "null"]:
                gamma = "scale"   # default
            else:
                # if numeric convert to float
                try:
                    gamma = float(gamma)
                except:
                    gamma = gamma   # keep "scale" or "auto"

            # degree (int) only used for poly kernel but we keep it consistent
            degree = request.form.get("degree")
            if degree in [None, "", "null"]:
                degree = 3
            else:
                degree = int(degree)

            # shrinking (bool)
            shrinking = request.form.get("shrinking")
            if shrinking in [None, "", "null"]:
                shrinking = True
            else:
                shrinking = (shrinking.lower() == "true")

            # probability (bool)
            probability = request.form.get("probability")
            if probability in [None, "", "null"]:
                probability = True
            else:
                probability = (probability.lower() == "true")
        
            # class_weight (string or None)
            class_weight = request.form.get("class_weight")
            if class_weight in [None, "", "null", "None"]:
                class_weight = None
            # allowed: None, "balanced"
            
            
        elif model == "lasso-regression":
            # alpha (float)
            alpha = request.form.get("alpha")
            if alpha in [None, "", "null"]:
                alpha = 1.0           # default value
            else:
                alpha = float(alpha)

            # max_iter (int)
            max_iter = request.form.get("max_iter")
            if max_iter in [None, "", "null"]:
                max_iter = 1000       # default value
            else:
                max_iter = int(max_iter)
                
        elif model == "elastic-net":
        # alpha (float)
            alpha = request.form.get("alpha")
            if alpha in [None, "", "null"]:
                alpha = 1.0          # default value
            else:
                alpha = float(alpha)

            # l1_ratio (float)
            l1_ratio = request.form.get("l1_ratio")
            if l1_ratio in [None, "", "null"]:
                l1_ratio = 0.5       # default: equal L1 & L2
            else:
                l1_ratio = float(l1_ratio)

            # max_iter (int)
            max_iter = request.form.get("max_iter")
            if max_iter in [None, "", "null"]:
                max_iter = 1000      # default value
            else:
                max_iter = int(max_iter)
                
        elif model == "adaboost":    
            # n_estimators (int)
            n_estimators = request.form.get("n_estimators")
            if n_estimators in [None, "", "null"]:
                n_estimators = 50          # default value
            else:
                n_estimators = int(n_estimators)

            # learning_rate (float)
            learning_rate = request.form.get("learning_rate")
            if learning_rate in [None, "", "null"]:
                learning_rate = 1.0        # default value
            else:
                learning_rate = float(learning_rate)

            # algorithm (string)
            algorithm = request.form.get("algorithm")
            if algorithm in [None, "", "null"]:
                algorithm = "SAMME"      # default
                    # allowed: "SAMME"
                    
                    
        elif model == "gradient-boosting":
            # n_estimators (int)
            n_estimators = request.form.get("n_estimators")
            if n_estimators in [None, "", "null"]:
                n_estimators = 100        # default value
            else:
                n_estimators = int(n_estimators)

            # learning_rate (float)
            learning_rate = request.form.get("learning_rate")
            if learning_rate in [None, "", "null"]:
                learning_rate = 0.1       # default value
            else:
                learning_rate = float(learning_rate)

            # max_depth (int)
            max_depth = request.form.get("max_depth")
            if max_depth in [None, "", "null"]:
                max_depth = 3             # default value
            else:
                max_depth = int(max_depth)

            # subsample (float)
            subsample = request.form.get("subsample")
            if subsample in [None, "", "null"]:
                subsample = 1.0           # default value
            else:
                subsample = float(subsample)
            
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

            # max_features (string / float / None)
            max_features = request.form.get("max_features")
            if max_features in [None, "", "null"]:
                max_features = None
            elif max_features in ["sqrt", "log2"]:
                pass  # keep as string
            else:
                # numeric value (float or int)
                if "." in str(max_features):
                    max_features = float(max_features)
                else:
                    max_features = int(max_features)
                    
        elif model == "principal-component-analysis":
            # n_components (int or float)
            n_components = request.form.get("n_components")
            if n_components in [None, "", "null"]:
                n_components = None     # default: all components
            else:
                # allow both int (e.g. 2) or float (e.g. 0.95)
                if "." in n_components:
                    n_components = float(n_components)
                else:
                    n_components = int(n_components)

            # scale_data (boolean)
            scale_data = request.form.get("scale_data")
            if scale_data in [None, "", "null"]:
                scale_data = True       # default
            else:
                scale_data = scale_data.lower() == "true"

            # random_state (int)
            random_state = request.form.get("random_state")
            if random_state in [None, "", "null"]:
                random_state = 101      # default
            else:
                random_state = int(random_state)

            # target_column (optional – for visualization)
            target_column = request.form.get("target_column")
            if target_column in [None, "", "null"]:
                target_column = None


        # Pass target_column to process_csv
        model = request.form.get('model')
        match (model):
            case "linear-regression":
                result = linear_regression_algo(f, target_column, test_size, random_state, cleaned_data=not enable_data_cleaning)
            case "logistic-regression":
                result = logistic_regression_algo(f, target_column, test_size, random_state, cleaned_data=not enable_data_cleaning)
            case "KNN":
                result = knn_classifier_algo(f, target_column, test_size, random_state, cleaned_data=not enable_data_cleaning, n_neighbors=n_neighbors, weights=weights, algorithm=algorithm, metric=metric)
            case "decision-tree":
                result = decision_tree_classifier_algo(f, target_column, test_size, random_state, cleaned_data=not enable_data_cleaning, criterion=criterion, max_depth=max_depth, min_samples_split=min_samples_split, min_samples_leaf=min_samples_leaf)
            case "random-forest":
                result = random_forest_classifier_algo(f, target_column, test_size, random_state, cleaned_data =not enable_data_cleaning, n_estimators=n_estimators, criterion=criterion, max_depth=max_depth, min_samples_split=min_samples_split, min_samples_leaf=min_samples_leaf, class_weight=class_weight)
            case "neural-network":
                result = neural_network_regression_algo(f, target_column, test_size, random_state, cleaned_data=not enable_data_cleaning,hidden_layer_sizes=hidden_layer_sizes, activation=activation, solver=solver, max_iter=max_iter)
            case "ridge-regression":
                result = ridge_regression_algo(f, target_column, test_size, random_state, cleaned_data=not enable_data_cleaning, alpha=alpha)
            case "image-classifier":
                result = train_image_classifier(
                    dataset_path,
                    # img_size=(24, 24),
                    batch_size=batch_size,
                    epochs=epochs,
                    learning_rate=learning_rate,
                )
            case "support-vector-machine":
                result = svm_classifier_algo(f,target_column,test_size,random_state,cleaned_data=not enable_data_cleaning,kernel=kernel,C=C,gamma=gamma,degree=degree,shrinking=shrinking,probability=probability,class_weight=class_weight)
            case "lasso-regression":
                result = lasso_regression_algo(f,target_column,test_size,random_state,cleaned_data = not enable_data_cleaning,alpha = alpha,max_iter = max_iter)
            case "elastic-net":
                result = elastic_net_regression_algo(f,target_column,test_size,random_state,cleaned_data=not enable_data_cleaning,alpha=alpha,l1_ratio=l1_ratio,max_iter=max_iter)
            case "adaboost":
                result = adaboost_classifier_algo(f,target_column,test_size,random_state,cleaned_data=not enable_data_cleaning,n_estimators=n_estimators,learning_rate=learning_rate,algorithm=algorithm)
            case "gradient-boosting":
                result = gradient_boosting_classifier_algo(f,target_column,test_size,random_state,cleaned_data=not enable_data_cleaning,n_estimators=n_estimators,learning_rate=learning_rate,max_depth=max_depth,subsample=subsample,min_samples_split=min_samples_split,min_samples_leaf=min_samples_leaf,max_features=max_features)
            case "principal-component-analysis":
                result = principal_component_analysis_algo(f,target_column,n_components=n_components,cleaned_data=not enable_data_cleaning,scale_data=scale_data,random_state=random_state)
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