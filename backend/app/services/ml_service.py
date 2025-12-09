import pandas as pd
import io
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from math import sqrt
from sklearn.preprocessing import LabelEncoder
import os
import joblib
from datetime import datetime
from .clean_data import clean_data

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