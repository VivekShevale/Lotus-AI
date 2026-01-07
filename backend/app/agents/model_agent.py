from typing import Dict, List, Any, Optional
import numpy as np

class ModelAgent:
    """Agent for recommending ML models"""
    
    def __init__(self):
        self.models = []
    
    def recommend(self, column_stats: Dict[str, Any], task_info: Dict[str, Any],
                  data_size: int) -> List[Dict[str, Any]]:
        """
        Recommend ML models based on dataset characteristics
        
        Args:
            column_stats: Statistics from quality agent
            task_info: Task information from task agent
            data_size: Number of rows in dataset
            
        Returns:
            List of model recommendations
        """
        self.models = []
        
        task_type = task_info.get('task_type')
        if not task_type:
            return []
        
        # Calculate dataset characteristics
        characteristics = self._analyze_dataset(column_stats, data_size)
        
        if task_type == 'classification':
            self._recommend_classification_models(characteristics, task_info)
        elif task_type == 'regression':
            self._recommend_regression_models(characteristics, task_info)
        
        # Sort by score
        return sorted(self.models, key=lambda x: x['score'], reverse=True)
    
    def _analyze_dataset(self, column_stats: Dict[str, Any], data_size: int) -> Dict[str, Any]:
        """Analyze dataset characteristics"""
        numeric_features = 0
        categorical_features = 0
        has_outliers = False
        has_high_cardinality = False
        has_missing = False
        
        for stats in column_stats.values():
            col_type = stats.get('type', '')
            
            if col_type in ['continuous', 'numeric', 'ordinal']:
                numeric_features += 1
                if stats.get('outlier_percentage', 0) > 5:
                    has_outliers = True
            elif col_type in ['categorical', 'binary']:
                categorical_features += 1
                if stats.get('unique', 0) > 50:
                    has_high_cardinality = True
            
            if stats.get('null_percentage', 0) > 0:
                has_missing = True
        
        total_features = numeric_features + categorical_features
        feature_ratio = numeric_features / total_features if total_features > 0 else 0
        
        return {
            'numeric_features': numeric_features,
            'categorical_features': categorical_features,
            'total_features': total_features,
            'feature_ratio': feature_ratio,
            'has_outliers': has_outliers,
            'has_high_cardinality': has_high_cardinality,
            'has_missing': has_missing,
            'data_size': data_size,
            'is_small': data_size < 1000,
            'is_medium': 1000 <= data_size < 10000,
            'is_large': data_size >= 10000
        }
    
    def _recommend_classification_models(self, characteristics: Dict[str, Any],
                                        task_info: Dict[str, Any]):
        """Recommend models for classification"""
        total_features = characteristics['total_features']
        data_size = characteristics['data_size']
        has_outliers = characteristics['has_outliers']
        has_high_cardinality = characteristics['has_high_cardinality']
        
        # XGBoost
        xgb_score = self._calculate_model_score(
            base_score=92,
            data_size=data_size,
            has_outliers=has_outliers,
            has_high_cardinality=has_high_cardinality,
            complexity='high'
        )
        
        self.models.append({
            'name': 'XGBoost Classifier',
            'priority': 'high',
            'score': xgb_score,
            'reason': f'Best overall for structured data with {total_features} features',
            'best_for': ['Medium to large datasets', 'Mixed feature types', 'Handles missing values'],
            'requirements': ['Feature scaling optional', 'Built-in regularization'],
            'hyperparameters': {
                'n_estimators': 200 if data_size > 1000 else 100,
                'max_depth': 8 if total_features > 20 else 6,
                'learning_rate': 0.1,
                'subsample': 0.8,
                'colsample_bytree': 0.8,
                'reg_alpha': 0.1,
                'reg_lambda': 1.0
            },
            'code': self._generate_xgboost_code('classification', characteristics, task_info),
            'pros': ['State-of-the-art performance', 'Handles missing values', 'Feature importance'],
            'cons': ['Requires hyperparameter tuning', 'Can overfit small datasets']
        })
        
        # Random Forest
        rf_score = self._calculate_model_score(
            base_score=88,
            data_size=data_size,
            has_outliers=True,  # RF handles outliers well
            has_high_cardinality=has_high_cardinality,
            complexity='medium'
        )
        
        self.models.append({
            'name': 'Random Forest Classifier',
            'priority': 'high',
            'score': rf_score,
            'reason': 'Robust and interpretable, handles mixed data types well',
            'best_for': ['Small to medium datasets', 'Non-linear patterns', 'Feature importance'],
            'requirements': ['No scaling needed', 'Handles outliers well'],
            'hyperparameters': {
                'n_estimators': 200 if data_size > 1000 else 100,
                'max_depth': 'None',
                'min_samples_split': 2,
                'min_samples_leaf': 1,
                'max_features': 'sqrt'
            },
            'code': self._generate_random_forest_code('classification'),
            'pros': ['Robust to outliers', 'No feature scaling needed', 'Parallel training'],
            'cons': ['Memory intensive', 'Slower predictions for large datasets']
        })
        
        # LightGBM (for large datasets)
        if data_size > 1000:
            lgbm_score = self._calculate_model_score(
                base_score=90,
                data_size=data_size,
                has_outliers=has_outliers,
                has_high_cardinality=True,  # LGBM handles high cardinality well
                complexity='high'
            )
            
            self.models.append({
                'name': 'LightGBM Classifier',
                'priority': 'high',
                'score': lgbm_score,
                'reason': 'Fast and memory-efficient for large datasets',
                'best_for': ['Large datasets', 'High cardinality features', 'Fast training'],
                'requirements': ['Handles categorical natively', 'Efficient memory usage'],
                'hyperparameters': {
                    'n_estimators': 200,
                    'num_leaves': 31,
                    'learning_rate': 0.05,
                    'feature_fraction': 0.8,
                    'bagging_fraction': 0.8,
                    'bagging_freq': 5
                },
                'code': self._generate_lightgbm_code('classification'),
                'pros': ['Very fast training', 'Memory efficient', 'Handles categorical'],
                'cons': ['Sensitive to overfitting', 'Requires careful tuning']
            })
        
        # Logistic Regression (for baseline/linear)
        if characteristics['feature_ratio'] > 0.7:  # Mostly numeric features
            lr_score = self._calculate_model_score(
                base_score=75,
                data_size=data_size,
                has_outliers=False,  # LR sensitive to outliers
                has_high_cardinality=False,
                complexity='low'
            )
            
            self.models.append({
                'name': 'Logistic Regression',
                'priority': 'medium',
                'score': lr_score,
                'reason': 'Good baseline for linearly separable data',
                'best_for': ['Quick baseline', 'Interpretable coefficients', 'Small datasets'],
                'requirements': ['Feature scaling required', 'Linearly separable classes'],
                'hyperparameters': {
                    'penalty': 'l2',
                    'C': 1.0,
                    'solver': 'lbfgs',
                    'max_iter': 1000,
                    'class_weight': 'balanced' if task_info.get('is_imbalanced') else None
                },
                'code': self._generate_logistic_regression_code(),
                'pros': ['Very fast', 'Interpretable', 'Probabilistic outputs'],
                'cons': ['Assumes linearity', 'Sensitive to outliers']
            })
        
        # For imbalanced classification
        if task_info.get('is_imbalanced'):
            self.models.append({
                'name': 'Balanced Random Forest',
                'priority': 'medium',
                'score': 85,
                'reason': 'Handles class imbalance with balanced bootstrap sampling',
                'best_for': ['Imbalanced datasets', 'Maintaining class distribution'],
                'requirements': ['imbalanced-learn package'],
                'hyperparameters': {
                    'n_estimators': 100,
                    'sampling_strategy': 'auto',
                    'replacement': True
                },
                'code': self._generate_balanced_rf_code(),
                'pros': ['Handles imbalance', 'Better minority class recall'],
                'cons': ['Slower training', 'Additional dependency']
            })
    
    def _recommend_regression_models(self, characteristics: Dict[str, Any],
                                    task_info: Dict[str, Any]):
        """Recommend models for regression"""
        total_features = characteristics['total_features']
        data_size = characteristics['data_size']
        has_outliers = characteristics['has_outliers']
        
        # XGBoost Regressor
        xgb_score = self._calculate_model_score(
            base_score=91,
            data_size=data_size,
            has_outliers=has_outliers,
            has_high_cardinality=characteristics['has_high_cardinality'],
            complexity='high'
        )
        
        self.models.append({
            'name': 'XGBoost Regressor',
            'priority': 'high',
            'score': xgb_score,
            'reason': f'Best performance for structured regression with {total_features} features',
            'best_for': ['Non-linear relationships', 'Feature interactions', 'Mixed data types'],
            'requirements': ['Minimal preprocessing', 'Handles missing values'],
            'hyperparameters': {
                'n_estimators': 200 if data_size > 1000 else 100,
                'max_depth': 8 if total_features > 20 else 6,
                'learning_rate': 0.1,
                'subsample': 0.8,
                'colsample_bytree': 0.8,
                'reg_alpha': 0.1,
                'reg_lambda': 1.0
            },
            'code': self._generate_xgboost_code('regression', characteristics, task_info),
            'pros': ['Excellent accuracy', 'Handles outliers', 'Feature importance'],
            'cons': ['Requires tuning', 'Can overfit', 'Black box']
        })
        
        # Random Forest Regressor
        rf_score = self._calculate_model_score(
            base_score=87,
            data_size=data_size,
            has_outliers=True,
            has_high_cardinality=characteristics['has_high_cardinality'],
            complexity='medium'
        )
        
        self.models.append({
            'name': 'Random Forest Regressor',
            'priority': 'high',
            'score': rf_score,
            'reason': 'Robust regressor, excellent for non-linear patterns with outliers',
            'best_for': ['Complex relationships', 'Outlier resistance', 'Feature importance'],
            'requirements': ['No scaling needed', 'Handles mixed types'],
            'hyperparameters': {
                'n_estimators': 200 if data_size > 1000 else 100,
                'max_depth': 'None',
                'min_samples_split': 2,
                'min_samples_leaf': 1,
                'max_features': 1.0 if total_features < 10 else 'auto'
            },
            'code': self._generate_random_forest_code('regression'),
            'pros': ['Robust to outliers', 'Captures non-linearity', 'No scaling needed'],
            'cons': ['Memory intensive', 'Slower inference', 'Less smooth predictions']
        })
        
        # Gradient Boosting Regressor (sklearn)
        if data_size < 10000:  # sklearn GBR can be slow on very large data
            gbr_score = self._calculate_model_score(
                base_score=85,
                data_size=data_size,
                has_outliers=has_outliers,
                has_high_cardinality=False,
                complexity='medium'
            )
            
            self.models.append({
                'name': 'Gradient Boosting Regressor',
                'priority': 'medium',
                'score': gbr_score,
                'reason': 'Good alternative to XGBoost with sklearn integration',
                'best_for': ['Medium datasets', 'Smooth predictions', 'Sklearn ecosystem'],
                'requirements': ['Feature scaling recommended'],
                'hyperparameters': {
                    'n_estimators': 100,
                    'learning_rate': 0.1,
                    'max_depth': 3,
                    'min_samples_split': 2,
                    'loss': 'squared_error'
                },
                'code': self._generate_gradient_boosting_code(),
                'pros': ['Smooth predictions', 'Good default parameters', 'Sklearn compatible'],
                'cons': ['Slower than XGBoost', 'No categorical support', 'Memory intensive']
            })
        
        # Linear models for mostly numeric datasets
        if characteristics['feature_ratio'] > 0.8:
            # Ridge Regression
            ridge_score = self._calculate_model_score(
                base_score=78,
                data_size=data_size,
                has_outliers=False,
                has_high_cardinality=False,
                complexity='low'
            )
            
            self.models.append({
                'name': 'Ridge Regression',
                'priority': 'medium',
                'score': ridge_score,
                'reason': 'L2 regularization prevents overfitting, good baseline',
                'best_for': ['Linear relationships', 'Multicollinearity', 'Quick training'],
                'requirements': ['Feature scaling required', 'Works with correlated features'],
                'hyperparameters': {
                    'alpha': 1.0,
                    'solver': 'auto',
                    'max_iter': 1000
                },
                'code': self._generate_ridge_regression_code(),
                'pros': ['Fast training', 'Handles multicollinearity', 'Interpretable'],
                'cons': ['Assumes linearity', 'Requires scaling', 'May underfit']
            })
            
            # Lasso Regression
            lasso_score = self._calculate_model_score(
                base_score=76,
                data_size=data_size,
                has_outliers=False,
                has_high_cardinality=False,
                complexity='low'
            )
            
            self.models.append({
                'name': 'Lasso Regression',
                'priority': 'medium',
                'score': lasso_score,
                'reason': 'L1 regularization for feature selection',
                'best_for': ['High-dimensional data', 'Feature selection', 'Sparse solutions'],
                'requirements': ['Feature scaling required', 'Works with many features'],
                'hyperparameters': {
                    'alpha': 0.1,
                    'max_iter': 1000,
                    'selection': 'cyclic'
                },
                'code': self._generate_lasso_regression_code(),
                'pros': ['Feature selection', 'Sparse solutions', 'Interpretable'],
                'cons': ['Selects at most n features', 'Sensitive to outliers']
            })
    
    def _calculate_model_score(self, base_score: int, data_size: int,
                              has_outliers: bool, has_high_cardinality: bool,
                              complexity: str) -> int:
        """Calculate model suitability score"""
        score = base_score
        
        # Adjust for data size
        if complexity == 'high':
            if data_size < 500:
                score -= 15
            elif data_size < 1000:
                score -= 5
            elif data_size > 10000:
                score += 5
        elif complexity == 'medium':
            if data_size < 100:
                score -= 10
            elif data_size > 50000:
                score -= 5
        
        # Adjust for outliers
        if has_outliers and complexity not in ['high', 'medium']:
            score -= 10
        
        # Adjust for high cardinality
        if has_high_cardinality and complexity != 'high':
            score -= 8
        
        return max(0, min(100, score))
    
    def _generate_xgboost_code(self, task_type: str, characteristics: Dict[str, Any],
                              task_info: Dict[str, Any]) -> str:
        """Generate XGBoost implementation code"""
        n_estimators = 200 if characteristics['data_size'] > 1000 else 100
        max_depth = 8 if characteristics['total_features'] > 20 else 6
        
        if task_type == 'classification':
            target_param = ''
            if task_info.get('num_classes', 0) > 2:
                target_param = '    objective="multi:softprob",\n    num_class={},\n'.format(
                    task_info.get('num_classes')
                )
            
            return f'''from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

xgb = XGBClassifier(
    n_estimators={n_estimators},
    max_depth={max_depth},
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    reg_alpha=0.1,
    reg_lambda=1.0,
    random_state=42,
    n_jobs=-1,
{target_param}    eval_metric="logloss"
)
xgb.fit(X_train, y_train)
y_pred = xgb.predict(X_test)
y_pred_proba = xgb.predict_proba(X_test)

print(f'Accuracy: {{accuracy_score(y_test, y_pred):.3f}}')
print('\\nClassification Report:')
print(classification_report(y_test, y_pred))'''
        
        else:  # regression
            return f'''from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import numpy as np

xgb = XGBRegressor(
    n_estimators={n_estimators},
    max_depth={max_depth},
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    reg_alpha=0.1,
    reg_lambda=1.0,
    random_state=42,
    n_jobs=-1,
    eval_metric="rmse"
)
xgb.fit(X_train, y_train)
y_pred = xgb.predict(X_test)

print(f'R² Score: {{r2_score(y_test, y_pred):.3f}}')
print(f'RMSE: {{np.sqrt(mean_squared_error(y_test, y_pred)):.3f}}')
print(f'MAE: {{mean_absolute_error(y_test, y_pred):.3f}}')'''
    
    def _generate_random_forest_code(self, task_type: str) -> str:
        """Generate Random Forest implementation code"""
        if task_type == 'classification':
            return '''from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

rf = RandomForestClassifier(
    n_estimators=100,
    max_depth=None,
    min_samples_split=2,
    min_samples_leaf=1,
    max_features='sqrt',
    bootstrap=True,
    random_state=42,
    n_jobs=-1,
    class_weight='balanced'
)
rf.fit(X_train, y_train)
y_pred = rf.predict(X_test)

print(f'Accuracy: {accuracy_score(y_test, y_pred):.3f}')
print('\\nClassification Report:')
print(classification_report(y_test, y_pred))'''
        
        else:  # regression
            return '''from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np

rf = RandomForestRegressor(
    n_estimators=100,
    max_depth=None,
    min_samples_split=2,
    min_samples_leaf=1,
    max_features=1.0,
    bootstrap=True,
    random_state=42,
    n_jobs=-1
)
rf.fit(X_train, y_train)
y_pred = rf.predict(X_test)

print(f'R² Score: {r2_score(y_test, y_pred):.3f}')
print(f'RMSE: {np.sqrt(mean_squared_error(y_test, y_pred)):.3f}')'''
    
    def _generate_lightgbm_code(self, task_type: str) -> str:
        """Generate LightGBM implementation code"""
        if task_type == 'classification':
            return '''from lightgbm import LGBMClassifier
from sklearn.metrics import accuracy_score, classification_report

lgbm = LGBMClassifier(
    n_estimators=200,
    num_leaves=31,
    learning_rate=0.05,
    feature_fraction=0.8,
    bagging_fraction=0.8,
    bagging_freq=5,
    random_state=42,
    n_jobs=-1,
    verbosity=-1
)
lgbm.fit(X_train, y_train)
y_pred = lgbm.predict(X_test)

print(f'Accuracy: {accuracy_score(y_test, y_pred):.3f}')
print('\\nClassification Report:')
print(classification_report(y_test, y_pred))'''
        
        else:  # regression
            return '''from lightgbm import LGBMRegressor
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np

lgbm = LGBMRegressor(
    n_estimators=200,
    num_leaves=31,
    learning_rate=0.05,
    feature_fraction=0.8,
    bagging_fraction=0.8,
    bagging_freq=5,
    random_state=42,
    n_jobs=-1,
    verbosity=-1
)
lgbm.fit(X_train, y_train)
y_pred = lgbm.predict(X_test)

print(f'R² Score: {r2_score(y_test, y_pred):.3f}')
print(f'RMSE: {np.sqrt(mean_squared_error(y_test, y_pred)):.3f}')'''
    
    def _generate_logistic_regression_code(self) -> str:
        """Generate Logistic Regression implementation code"""
        return '''from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report

# Scale features for logistic regression
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

lr = LogisticRegression(
    penalty='l2',
    C=1.0,
    solver='lbfgs',
    max_iter=1000,
    random_state=42,
    class_weight='balanced'
)
lr.fit(X_train_scaled, y_train)
y_pred = lr.predict(X_test_scaled)

print(f'Accuracy: {accuracy_score(y_test, y_pred):.3f}')
print('\\nClassification Report:')
print(classification_report(y_test, y_pred))
print('\\nCoefficients:')
for feature, coef in zip(X.columns, lr.coef_[0]):
    print(f'{feature}: {coef:.4f}')'''
    
    def _generate_balanced_rf_code(self) -> str:
        """Generate Balanced Random Forest implementation code"""
        return '''from imblearn.ensemble import BalancedRandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

brf = BalancedRandomForestClassifier(
    n_estimators=100,
    sampling_strategy='auto',
    replacement=True,
    random_state=42,
    n_jobs=-1
)
brf.fit(X_train, y_train)
y_pred = brf.predict(X_test)

print(f'Accuracy: {accuracy_score(y_test, y_pred):.3f}')
print('\\nClassification Report (with balanced classes):')
print(classification_report(y_test, y_pred))'''
    
    def _generate_gradient_boosting_code(self) -> str:
        """Generate Gradient Boosting Regressor implementation code"""
        return '''from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np

gbr = GradientBoostingRegressor(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=3,
    min_samples_split=2,
    min_samples_leaf=1,
    subsample=1.0,
    max_features=None,
    random_state=42
)
gbr.fit(X_train, y_train)
y_pred = gbr.predict(X_test)

print(f'R² Score: {r2_score(y_test, y_pred):.3f}')
print(f'RMSE: {np.sqrt(mean_squared_error(y_test, y_pred)):.3f}')'''
    
    def _generate_ridge_regression_code(self) -> str:
        """Generate Ridge Regression implementation code"""
        return '''from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

ridge = Ridge(
    alpha=1.0,
    random_state=42
)
ridge.fit(X_train_scaled, y_train)
y_pred = ridge.predict(X_test_scaled)

print(f'R² Score: {r2_score(y_test, y_pred):.3f}')
print(f'RMSE: {np.sqrt(mean_squared_error(y_test, y_pred)):.3f}')
print('\\nCoefficients:')
for feature, coef in zip(X.columns, ridge.coef_):
    print(f'{feature}: {coef:.4f}')'''
    
    def _generate_lasso_regression_code(self) -> str:
        """Generate Lasso Regression implementation code"""
        return '''from sklearn.linear_model import Lasso
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

lasso = Lasso(
    alpha=0.1,
    random_state=42,
    max_iter=1000
)
lasso.fit(X_train_scaled, y_train)
y_pred = lasso.predict(X_test_scaled)

print(f'R² Score: {r2_score(y_test, y_pred):.3f}')
print(f'RMSE: {np.sqrt(mean_squared_error(y_test, y_pred)):.3f}')
print('\\nNumber of features selected: {np.sum(lasso.coef_ != 0)}')
print('\\nNon-zero coefficients:')
for feature, coef in zip(X.columns, lasso.coef_):
    if abs(coef) > 0.001:
        print(f'{feature}: {coef:.4f}')'''