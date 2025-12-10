import pandas as pd
import io
import os
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from sklearn.preprocessing import StandardScaler
from sklearn.inspection import permutation_importance
from app.services.clean_data import clean_data
import joblib
from math import sqrt

def neural_network_regression_algo(file, target_column=None, test_size=0.3, random_state=101, cleaned_data=True,
                                   hidden_layer_sizes=(100,), activation='relu', solver='adam', max_iter=500):
    try:
        # Read CSV or Excel
        if file.name.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(file)
        else:
            file.seek(0)
            df = pd.read_csv(io.BytesIO(file.read()))
        
        if df.empty:
            return {"error": "Uploaded file is empty."}
        
        # Apply data cleaning if needed
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
        X = X.select_dtypes(include="number")

        if X.empty:
            return {"error": "No numeric features available after encoding."}

        # Train/test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state
        )

        # Feature scaling for neural network
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        # Train neural network
        model = MLPRegressor(
            hidden_layer_sizes=hidden_layer_sizes,
            activation=activation,
            solver=solver,
            max_iter=max_iter,
            random_state=random_state
        )
        model.fit(X_train_scaled, y_train)
        preds = model.predict(X_test_scaled)

        # Save the trained model
        model_id = f"nn_regression_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        model_filename = f"{model_id}.pkl"
        model_path = os.path.join('trained_models', model_filename)
        os.makedirs('trained_models', exist_ok=True)

        model_data = {
            'model': model,
            'scaler': scaler,
            'feature_names': X.columns.tolist(),
            'target_column': target_column,
            'model_id': model_id
        }
        joblib.dump(model_data, model_path)

        y_test = y_test.reset_index(drop=True)

        # Compute top features using permutation importance
        perm_importance = permutation_importance(model, X_test_scaled, y_test, n_repeats=5, random_state=random_state)
        feature_importance = dict(zip(X.columns.tolist(), perm_importance.importances_mean))
        top_features = dict(sorted(feature_importance.items(), key=lambda x: abs(x[1]), reverse=True)[:5])

        return {
            'r2': round(float(r2_score(y_test, preds)), 4),
            'mae': round(float(mean_absolute_error(y_test, preds)), 4),
            'rmse': round(float(sqrt(mean_squared_error(y_test, preds))), 4),
            'n_samples': len(df),
            'n_features': X.shape[1],
            'top_features': top_features,
            'predictions': [float(pred) for pred in preds],
            'actual': [float(actual) for actual in y_test],
            'model_id': model_id,
            'testSize': float(test_size),
            'hidden_layer_sizes': hidden_layer_sizes,
            'activation': activation,
            'solver': solver,
            'max_iter': max_iter
        }

    except Exception as e:
        return {'error': str(e)}