import pandas as pd
import io
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from math import sqrt
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.svm import SVC
import os
import joblib
from datetime import datetime
from .clean_data import clean_data
from sklearn.metrics import confusion_matrix, classification_report

def linear_regression_algo(file, target_column=None, test_size=0.3, random_state=101, cleaned_data=True):
    try:
        # Read CSV or Excel
        if file.name.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(file)
        else:
            file.seek(0)
            df = pd.read_csv(io.BytesIO(file.read()))

        if df.empty:
            return {"error": "Uploaded file is empty."}
        
        # FIX: Apply data cleaning if NOT cleaned_data (parameter name is confusing)
        if not cleaned_data:
            df, _ = clean_data(df=df)

        # Use provided target_column or fallback to last column
        if not target_column:
            target_column = df.columns[-1]

        if target_column not in df.columns:
            return {"error": f"Target column '{target_column}' not found."}

        X = df.drop(columns=[target_column])
        y = df[target_column]

        # encoding categorical columns
        X = pd.get_dummies(X, drop_first=True)

        # Keep only numeric features
        X = X.select_dtypes(include="number")

        if X.empty:
            return {"error": "No numeric features available after encoding."}

        # Train/test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state
        )

        model = LinearRegression()
        model.fit(X_train, y_train)
        preds = model.predict(X_test)

        # Save the trained model
        model_id = f"linear_regression_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        model_filename = f"{model_id}.pkl"
        model_path = os.path.join('trained_models', model_filename)
        
        os.makedirs('trained_models', exist_ok=True)
        
        model_data = {
            'model': model,
            'feature_names': X.columns.tolist(),
            'target_column': target_column,
            'model_id': model_id
        }

        joblib.dump(model_data, model_path)
        y_test = y_test.reset_index(drop=True)

        # Ensure all metrics are standard Python types
        return {
            'r2': round(float(r2_score(y_test, preds)), 4),
            'mae': round(float(mean_absolute_error(y_test, preds)), 4),
            'rmse': round(float(sqrt(mean_squared_error(y_test, preds))), 4),
            'n_samples': len(df),
            'n_features': X.shape[1],
            'top_features': dict(
                sorted(
                    zip(X.columns.tolist(), [float(coef) for coef in model.coef_]), 
                    key=lambda x: abs(x[1]), 
                    reverse=True
                )[:5]
            ),
            'predictions': [float(pred) for pred in preds],
            'actual': [float(actual) for actual in y_test],
            'model_id': model_id,
            'testSize': float(test_size),
        }

    except Exception as e:
        return {'error': str(e)}

def logistic_regression_algo(file, target_column=None, test_size=0.3, random_state=43, cleaned_data=True):
    try:
        # Read CSV or Excel
        if file.name.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(file)
        else:
            df = pd.read_csv(io.BytesIO(file.read()))

        if df.empty:
            return {"error": "Uploaded file is empty."}

        # FIX: Apply data cleaning if NOT cleaned_data
        if not cleaned_data:
            df, _ = clean_data(df=df)
            
        # Use provided target_column or fallback to last column
        if not target_column:
            target_column = df.columns[-1]

        if target_column not in df.columns:
            return {"error": f"Target column '{target_column}' not found."}

        X = df.drop(columns=[target_column])
        y = df[target_column]

        # Keep only numeric features
        X = X.select_dtypes(include="number")

        if X.empty:
            return {"error": "No numeric features available after encoding."}

        # Train/test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state
        )

        model = LogisticRegression()
        model.fit(X_train, y_train)
        preds = model.predict(X_test)

        # Save the trained model
        model_id = f"logistic_regression_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        model_filename = f"{model_id}.pkl"
        model_path = os.path.join('trained_models', model_filename)
        
        os.makedirs('trained_models', exist_ok=True)
        
        model_data = {
            'model': model,
            'feature_names': X.columns.tolist(),
            'target_column': target_column,
            'model_id': model_id
        }
        joblib.dump(model_data, model_path)

        # Ensure all metrics are standard Python types
        return {
            'accuracy': round(float(accuracy_score(y_test, preds)), 4),
            'precision': round(float(precision_score(y_test, preds, average='weighted')), 4),
            'recall': round(float(recall_score(y_test, preds, average='weighted')), 4),
            'f1_score': round(float(f1_score(y_test, preds, average='weighted')), 4),
            'n_samples': len(df),
            'n_features': X.shape[1],
            'top_features': dict(
                sorted(
                    zip(X.columns.tolist(), [float(coef) for coef in model.coef_[0]]), 
                    key=lambda x: abs(x[1]), 
                    reverse=True
                )[:5]
            ),
            'predictions': [int(pred) for pred in preds],
            'actual': [int(actual) for actual in y_test],
            'model_id': model_id,
            'testSize': float(test_size),
        }

    except Exception as e:
        return {'error': str(e)}
    
def decision_tree_classifier_algo(
    file, 
    target_column=None, 
    test_size=0.3, 
    random_state=101, 
    cleaned_data=True,
    criterion="gini",          
    max_depth=None,            
    min_samples_split=2,       
    min_samples_leaf=1         
):
    try:
        # Read CSV or Excel
        if file.name.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(file)
        else:
            file.seek(0)
            df = pd.read_csv(io.BytesIO(file.read()))

        if df.empty:
            return {"error": "Uploaded file is empty."}

        # Data cleaning
        if not cleaned_data:
            df, _ = clean_data(df=df)

        if max_depth == 0:
            max_depth = None

        # Target column
        if not target_column:
            target_column = df.columns[-1]

        if target_column not in df.columns:
            return {"error": f"Target column '{target_column}' not found."}

        X = df.drop(columns=[target_column])
        y = df[target_column]

        # Encoding features
        X = pd.get_dummies(X, drop_first=True)
        X = X.select_dtypes(include="number")

        if X.empty:
            return {"error": "No numeric features available after preprocessing."}

        # Encode target if categorical
        if y.dtype == "object" or y.dtype.name == "category":
            label_encoder = LabelEncoder()
            y = label_encoder.fit_transform(y)
        else:
            label_encoder = None

        # Train / test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state
        )

        # Build Decision Tree
        model = DecisionTreeClassifier(
            criterion=criterion,
            max_depth=max_depth,
            min_samples_split=min_samples_split,
            min_samples_leaf=min_samples_leaf,
            random_state=random_state
        )

        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        
        # Get prediction probabilities
        pred_proba = model.predict_proba(X_test) if hasattr(model, "predict_proba") else None

        # Save model
        model_id = f"decision_tree_classifier_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        model_filename = f"{model_id}.pkl"
        model_path = os.path.join("trained_models", model_filename)

        os.makedirs("trained_models", exist_ok=True)

        model_data = {
            'model': model,
            'feature_names': X.columns.tolist(),
            'target_column': target_column,
            'label_encoder': label_encoder,
            'model_id': model_id,
            'config': {
                "criterion": criterion,
                "max_depth": max_depth,
                "min_samples_split": min_samples_split,
                "min_samples_leaf": min_samples_leaf
            }
        }

        joblib.dump(model_data, model_path)

        # Metrics
        accuracy = accuracy_score(y_test, preds)
        precision = precision_score(y_test, preds, average="weighted", zero_division=0)
        recall = recall_score(y_test, preds, average="weighted", zero_division=0)
        f1 = f1_score(y_test, preds, average="weighted", zero_division=0)

        # Feature importances
        importances = model.feature_importances_
        # Get all features sorted by importance
        feature_importance_dict = dict(
            sorted(
                zip(X.columns.tolist(), [float(i) for i in importances]),
                key=lambda x: x[1],
                reverse=True
            )
        )
        
        # Top features (for summary)
        top_features = dict(list(feature_importance_dict.items())[:5])

        # Classes
        if label_encoder:
            classes = [str(c) for c in label_encoder.classes_]
        else:
            classes = [str(c) for c in sorted(pd.Series(y).unique())]

        # Additional stats
        tree_depth = model.get_depth()
        n_leaves = model.get_n_leaves()
        n_nodes = model.tree_.node_count

        cm = confusion_matrix(y_test, preds).tolist()
        class_report = classification_report(y_test, preds, output_dict=True)
        class_dist = dict(pd.Series(y).value_counts())
        
        # Get test indices for reference
        test_indices = list(X_test.index)

        # Prepare prediction data with probabilities
        prediction_data = []
        if pred_proba is not None:
            for i, (pred, actual, proba) in enumerate(zip(preds, y_test, pred_proba)):
                max_prob = float(max(proba))
                prediction_data.append({
                    'index': i + 1,
                    'prediction': int(pred),
                    'actual': int(actual),
                    'confidence': max_prob,
                    'is_correct': bool(pred == actual),
                    'probabilities': [float(p) for p in proba]
                })
        else:
            for i, (pred, actual) in enumerate(zip(preds, y_test)):
                prediction_data.append({
                    'index': i + 1,
                    'prediction': int(pred),
                    'actual': int(actual),
                    'confidence': None,
                    'is_correct': bool(pred == actual),
                    'probabilities': None
                })

        return {
            "accuracy": float(accuracy),
            "precision": float(precision),
            "recall": float(recall),
            "f1_score": float(f1),

            "tree_depth": int(tree_depth),
            "n_leaves": int(n_leaves),
            "n_nodes": int(n_nodes),

            "confusion_matrix": [[int(x) for x in row] for row in cm],

            "class_distribution": {str(k): int(v) for k, v in class_dist.items()},

            "class_report": {
                str(label): {
                    "precision": float(metrics.get('precision', 0)),
                    "recall": float(metrics.get('recall', 0)),
                    "f1-score": float(metrics.get('f1-score', 0)),
                    "support": int(metrics.get('support', 0))
                }
                for label, metrics in class_report.items()
                if isinstance(metrics, dict)  # only class rows
            },

            "classes": classes,

            "prediction_data": prediction_data,  # Add detailed prediction data
            
            "prediction_proba": (
                [[float(p) for p in row] for row in pred_proba]
                if pred_proba is not None else None
            ),

            "n_samples": int(len(df)),
            "n_features": int(X.shape[1]),

            "feature_importance": feature_importance_dict,  # All features with importance
            "top_features": {str(k): float(v) for k, v in top_features.items()},

            "predictions": [int(p) for p in preds],
            "actual": [int(a) for a in y_test],

            "model_id": str(model_id),
            "testSize": float(test_size),
            
            # Additional metadata
            "criterion": criterion,
            "max_depth": max_depth,
            "min_samples_split": min_samples_split,
            "min_samples_leaf": min_samples_leaf,
            
            # Training info
            "train_samples": int(len(X_train)),
            "test_samples": int(len(X_test)),
            
            # Feature names
            "feature_names": X.columns.tolist()
        }

    except Exception as e:
        return {"error": str(e)}
    
    
def knn_classifier_algo(
    file,
    target_column=None,
    test_size=0.3,
    random_state=101,
    cleaned_data=True,
    n_neighbors=5,
    weights="uniform",        # "uniform" or "distance"
    algorithm="auto",         # auto, ball_tree, kd_tree, brute
    metric="minkowski"        # minkowski, euclidean, manhattan, etc.
):
    try:
        # ----------- Load file (CSV or Excel) -----------
        if file.name.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(file)
        else:
            file.seek(0)
            df = pd.read_csv(io.BytesIO(file.read()))

        if df.empty:
            return {"error": "Uploaded file is empty."}

        # ----------- Optional Data Cleaning -----------
        if not cleaned_data:
            df, _ = clean_data(df=df)

        # ----------- Determine target column -----------
        if not target_column:
            target_column = df.columns[-1]

        if target_column not in df.columns:
            return {"error": f"Target column '{target_column}' not found."}

        # ----------- Split X, y -----------
        X = df.drop(columns=[target_column])
        y = df[target_column]

        # ----------- One-hot encode features -----------
        X = pd.get_dummies(X, drop_first=True)
        X = X.select_dtypes(include="number")

        if X.empty:
            return {"error": "No numeric features available after encoding."}

        # ----------- Encode target if needed -----------
        label_encoder = None
        if y.dtype == "object" or y.dtype.name == "category":
            label_encoder = LabelEncoder()
            y = label_encoder.fit_transform(y)

        # ----------- Train-test split -----------
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state
        )

        # ----------- Build KNN Model -----------
        model = KNeighborsClassifier(
            n_neighbors=n_neighbors,
            weights=weights,
            algorithm=algorithm,
            metric=metric
        )

        model.fit(X_train, y_train)

        # ----------- Predictions -----------
        preds = model.predict(X_test)
        probs = model.predict_proba(X_test).tolist()

        # ----------- Save the model -----------
        model_id = f"knn_classifier_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        model_filename = f"{model_id}.pkl"
        model_path = os.path.join("trained_models", model_filename)

        os.makedirs("trained_models", exist_ok=True)

        model_data = {
            "model": model,
            "feature_names": X.columns.tolist(),
            "target_column": target_column,
            "label_encoder": label_encoder,
            "model_id": model_id,
            "config": {
                "n_neighbors": n_neighbors,
                "weights": weights,
                "algorithm": algorithm,
                "metric": metric
            }
        }

        joblib.dump(model_data, model_path)

        # ----------- Metrics -----------
        accuracy = float(accuracy_score(y_test, preds))
        precision = float(precision_score(y_test, preds, average="weighted", zero_division=0))
        recall = float(recall_score(y_test, preds, average="weighted", zero_division=0))
        f1 = float(f1_score(y_test, preds, average="weighted", zero_division=0))

        cm = confusion_matrix(y_test, preds).tolist()
        # Classification report → dict
        report = classification_report(y_test, preds, output_dict=True)
        clean_report = {k: {m: float(v) for m, v in metrics.items()} if isinstance(metrics, dict) else float(metrics)
                        for k, metrics in report.items()}

        # Class distribution
        class_distribution = pd.Series(y).value_counts().to_dict()
        class_distribution = {str(k): int(v) for k, v in class_distribution.items()}

        return {
            "accuracy": round(accuracy, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
            "n_samples": int(len(df)),
            "n_features": int(X.shape[1]),
            "confusion_matrix": [[int(x) for x in row] for row in cm],
            "classification_report": clean_report,
            "class_distribution": class_distribution,
            "predictions": [int(p) for p in preds],
            "prediction_proba": probs,
            "actual": [int(a) for a in y_test],
            "k_value": int(n_neighbors),           
            "classes": (
                label_encoder.classes_.tolist() 
                if label_encoder is not None 
                else sorted(list(set(y_test.tolist())))
            ),
            "algorithm": str(algorithm),
            "weights": str(weights),
            "metric": str(metric),
            "random_state": int(random_state),

            "model_id": model_id,
            "testSize": float(test_size),
        }

    except Exception as e:
        return {"error": str(e)}

def random_forest_classifier_algo(
    file,
    target_column=None, 
    test_size=0.3, 
    random_state=101, 
    cleaned_data=True,
    n_estimators=200,
    criterion="gini",
    max_depth=None,
    min_samples_split=2,
    min_samples_leaf=1,
    class_weight=None
):
    try:
        # Read CSV or Excel
        if file.name.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(file)
        else:
            file.seek(0)
            df = pd.read_csv(io.BytesIO(file.read()))

        if df.empty:
            return {"error": "Uploaded file is empty."}

        # Optional cleaning
        if not cleaned_data:
            df, _ = clean_data(df=df)

        if max_depth == 0:
            max_depth = None

        # Target column
        if not target_column:
            target_column = df.columns[-1]

        if target_column not in df.columns:
            return {"error": f"Target column '{target_column}' not found."}

        X = df.drop(columns=[target_column])
        y = df[target_column]

        # Encode input features
        X = pd.get_dummies(X, drop_first=True)
        X = X.select_dtypes(include="number")

        if X.empty:
            return {"error": "No numeric features available after preprocessing."}

        # Encode target if categorical
        if y.dtype == "object" or y.dtype.name == "category":
            label_encoder = LabelEncoder()
            y = label_encoder.fit_transform(y)
        else:
            label_encoder = None

        # Train-test split (stratified is better for classification)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y,
            test_size=test_size,
            random_state=random_state,
            stratify=y
        )

        # Build Random Forest model
        model = RandomForestClassifier(
            n_estimators=n_estimators,
            criterion=criterion,
            max_depth=max_depth,
            min_samples_split=min_samples_split,
            min_samples_leaf=min_samples_leaf,
            class_weight=class_weight,
            random_state=random_state
        )

        # Train
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        pred_proba = model.predict_proba(X_test)

        # Save model
        model_id = f"random_forest_classifier_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        model_filename = f"{model_id}.pkl"
        model_path = os.path.join("trained_models", model_filename)

        os.makedirs("trained_models", exist_ok=True)

        model_data = {
            "model": model,
            "feature_names": X.columns.tolist(),
            "target_column": target_column,
            "label_encoder": label_encoder,
            "model_id": model_id,
            "config": {
                "n_estimators": n_estimators,
                "criterion": criterion,
                "max_depth": max_depth,
                "min_samples_split": min_samples_split,
                "min_samples_leaf": min_samples_leaf,
                "class_weight": class_weight
            }
        }

        joblib.dump(model_data, model_path)

        # Metrics
        accuracy = accuracy_score(y_test, preds)
        precision = precision_score(y_test, preds, average="weighted", zero_division=0)
        recall = recall_score(y_test, preds, average="weighted", zero_division=0)
        f1 = f1_score(y_test, preds, average="weighted", zero_division=0)

        # Feature importances
        importances = model.feature_importances_
        feature_importance_dict = dict(
            sorted(
                zip(X.columns.tolist(), [float(i) for i in importances]),
                key=lambda x: x[1],
                reverse=True
            )
        )
        top_features = dict(list(feature_importance_dict.items())[:5])

        # Class labels
        if label_encoder:
            classes = [str(c) for c in label_encoder.classes_]
        else:
            classes = [str(c) for c in sorted(pd.Series(y).unique())]

        # Confusion matrix, class report
        cm = confusion_matrix(y_test, preds).tolist()
        class_report = classification_report(y_test, preds, output_dict=True)
        class_dist = dict(pd.Series(y).value_counts())

        # Prediction-level details
        prediction_data = []
        for i, (pred, actual, proba) in enumerate(zip(preds, y_test, pred_proba)):
            prediction_data.append({
                "index": i + 1,
                "prediction": int(pred),
                "actual": int(actual),
                "confidence": float(max(proba)),
                "is_correct": bool(pred == actual),
                "probabilities": [float(p) for p in proba]
            })

        return {
            "accuracy": float(accuracy),
            "precision": float(precision),
            "recall": float(recall),
            "f1_score": float(f1),

            # Random Forest internal metrics
            "n_estimators": n_estimators,
            "max_depth": max_depth,
            "min_samples_split": min_samples_split,
            "min_samples_leaf": min_samples_leaf,

            "confusion_matrix": cm,
            "class_distribution": {str(k): int(v) for k, v in class_dist.items()},

            "class_report": {
                str(label): {
                    "precision": float(metrics.get("precision", 0)),
                    "recall": float(metrics.get("recall", 0)),
                    "f1-score": float(metrics.get("f1-score", 0)),
                    "support": int(metrics.get("support", 0))
                }
                for label, metrics in class_report.items()
                if isinstance(metrics, dict)
            },

            "classes": classes,
            "prediction_data": prediction_data,

            "prediction_proba": [
                [float(p) for p in row] for row in pred_proba
            ],

            "n_samples": int(len(df)),
            "n_features": int(X.shape[1]),

            "feature_importance": feature_importance_dict,
            "top_features": {str(k): float(v) for k, v in top_features.items()},

            "predictions": [int(p) for p in preds],
            "actual": [int(a) for a in y_test],

            "model_id": str(model_id),
            "testSize": float(test_size),

            "train_samples": int(len(X_train)),
            "test_samples": int(len(X_test)),
            "feature_names": X.columns.tolist()
        }

    except Exception as e:
        return {"error": str(e)}


from math import sqrt
from sklearn.linear_model import Ridge
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

def ridge_regression_algo(file, target_column=None, test_size=0.3, random_state=101, alpha=1.0, cleaned_data=True):
    try:
        # Read CSV or Excel
        if file.name.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(file)
        else:
            file.seek(0)
            df = pd.read_csv(io.BytesIO(file.read()))

        if df.empty:
            return {"error": "Uploaded file is empty."}
        
        # Apply data cleaning if NOT already cleaned
        if not cleaned_data:
            df, _ = clean_data(df=df)

        # Use provided target_column or fallback to last column
        if not target_column:
            target_column = df.columns[-1]

        if target_column not in df.columns:
            return {"error": f"Target column '{target_column}' not found."}

        X = df.drop(columns=[target_column])
        y = df[target_column]

        # Encoding categorical columns
        X = pd.get_dummies(X, drop_first=True)

        # Keep only numeric features
        X = X.select_dtypes(include="number")

        if X.empty:
            return {"error": "No numeric features available after encoding."}

        # Train/test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state
        )

        model = Ridge(alpha=alpha, random_state=random_state)
        model.fit(X_train, y_train)
        preds = model.predict(X_test)

        # Save the trained model
        model_id = f"ridge_regression_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        model_filename = f"{model_id}.pkl"
        model_path = os.path.join('trained_models', model_filename)
        
        os.makedirs('trained_models', exist_ok=True)
        
        model_data = {
            'model': model,
            'feature_names': X.columns.tolist(),
            'target_column': target_column,
            'model_id': model_id,
            'alpha': alpha
        }

        joblib.dump(model_data, model_path)
        y_test = y_test.reset_index(drop=True)

        # Return metrics and other info
        return {
            'r2': round(float(r2_score(y_test, preds)), 4),
            'mae': round(float(mean_absolute_error(y_test, preds)), 4),
            'rmse': round(float(sqrt(mean_squared_error(y_test, preds))), 4),
            'n_samples': len(df),
            'n_features': X.shape[1],
            'top_features': dict(
                sorted(
                    zip(X.columns.tolist(), [float(coef) for coef in model.coef_]), 
                    key=lambda x: abs(x[1]), 
                    reverse=True
                )[:5]
            ),
            'predictions': [float(pred) for pred in preds],
            'actual': [float(actual) for actual in y_test],
            'model_id': model_id,
            'testSize': float(test_size),
            'alpha': float(alpha)
        }

    except Exception as e:
        return {'error': str(e)}
    
def svm_classifier_algo(
    file, 
    target_column=None, 
    test_size=0.3, 
    random_state=43, 
    cleaned_data=True,

    # SVM-specific arguments
    kernel="rbf",
    C=1.0,
    gamma="scale",
    degree=3,
    shrinking=True,
    probability=True,
    class_weight=None
):
    try:
        # Read CSV or Excel
        if file.name.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(file)
        else:
            df = pd.read_csv(io.BytesIO(file.read()))

        if df.empty:
            return {"error": "Uploaded file is empty."}

        # FIX: Apply data cleaning if NOT cleaned_data
        if not cleaned_data:
            df, _ = clean_data(df=df)

        # Use provided target_column or fallback to last column
        if not target_column:
            target_column = df.columns[-1]

        if target_column not in df.columns:
            return {"error": f"Target column '{target_column}' not found."}

        X = df.drop(columns=[target_column])
        y = df[target_column]

        # Keep only numeric features
        X = X.select_dtypes(include="number")

        if X.empty:
            return {"error": "No numeric features available after filtering."}

        # Train/test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state
        )

        # Build SVM model with arguments
        model = SVC(
            kernel=kernel,
            C=C,
            gamma=gamma,
            degree=degree,
            shrinking=shrinking,
            probability=probability,
            class_weight=class_weight,
            random_state=random_state
        )

        model.fit(X_train, y_train)
        preds = model.predict(X_test)

        # Save trained model
        model_id = f"svm_classifier_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        model_filename = f"{model_id}.pkl"
        model_path = os.path.join('trained_models', model_filename)

        os.makedirs('trained_models', exist_ok=True)

        model_data = {
            'model': model,
            'feature_names': X.columns.tolist(),
            'target_column': target_column,
            'model_id': model_id,

            # Store SVM args
            'kernel': kernel,
            'C': C,
            'gamma': gamma,
            'degree': degree,
            'shrinking': shrinking,
            'probability': probability,
            'class_weight': class_weight
        }

        joblib.dump(model_data, model_path)

        # Feature importance (only for linear kernel)
        if kernel == "linear":
            coefs = model.coef_[0]
            feature_importance = dict(
                sorted(
                    zip(X.columns.tolist(), [float(c) for c in coefs]),
                    key=lambda x: abs(x[1]),
                    reverse=True
                )[:5]
            )
        else:
            feature_importance = "Not available for non-linear kernels"

        return {
            # Standard metrics
            'accuracy': round(float(accuracy_score(y_test, preds)), 4),
            'precision': round(float(precision_score(y_test, preds, average='weighted')), 4),
            'recall': round(float(recall_score(y_test, preds, average='weighted')), 4),
            'f1_score': round(float(f1_score(y_test, preds, average='weighted')), 4),

            # Dataset info
            'n_samples': len(df),
            'n_features': X.shape[1],

            # Feature importance
            'top_features': feature_importance,

            # Predictions
            'predictions': [int(pred) for pred in preds],
            'actual': [int(actual) for actual in y_test],

            # Model info
            'model_id': model_id,

            # Returned SVM arguments
            'kernel': kernel,
            'C': float(C),
            'gamma': gamma,
            'degree': int(degree),
            'shrinking': bool(shrinking),
            'probability': bool(probability),
            'class_weight': class_weight,

            'testSize': float(test_size)
        }

    except Exception as e:
        return {'error': str(e)}
