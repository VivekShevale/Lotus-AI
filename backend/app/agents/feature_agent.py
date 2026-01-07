from typing import Dict, List, Any, Optional
import pandas as pd

class FeatureAgent:
    """Agent for suggesting feature engineering techniques"""
    
    def __init__(self):
        self.suggestions = []
    
    def suggest(self, column_stats: Dict[str, Any], columns: List[str],
                task_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Suggest feature engineering techniques
        
        Args:
            column_stats: Statistics from quality agent
            columns: List of column names
            task_type: ML task type
            
        Returns:
            List of feature engineering suggestions
        """
        self.suggestions = []
        
        for col in columns:
            if col not in column_stats:
                continue
                
            stats = column_stats[col]
            col_type = stats.get('type', '')
            
            # Skip identifier columns
            if col_type == 'identifier':
                self._add_suggestion(
                    column=col,
                    technique='Drop Column',
                    priority='high',
                    reason='ID column with no predictive value',
                    impact='high',
                    code=f"df = df.drop('{col}', axis=1)"
                )
                continue
            
            # Handle missing values
            self._suggest_missing_value_handling(col, stats)
            
            # Type-specific suggestions
            if col_type in ['continuous', 'numeric', 'ordinal']:
                self._suggest_numeric_transformations(col, stats)
            elif col_type == 'categorical':
                self._suggest_categorical_encoding(col, stats, task_type)
            elif col_type == 'binary':
                self._suggest_binary_encoding(col, stats)
            elif col_type == 'datetime':
                self._suggest_datetime_features(col, stats)
            
            # Interaction features
            if col_type in ['continuous', 'numeric'] and stats.get('unique', 0) > 10:
                self._suggest_interaction_features(col, stats)
        
        # Sort by priority and impact
        return sorted(self.suggestions, 
                     key=lambda x: {'high': 3, 'medium': 2, 'low': 1}[x['priority']], 
                     reverse=True)
    
    def _add_suggestion(self, column: str, technique: str, priority: str,
                       reason: str, impact: str, code: str):
        """Add a feature engineering suggestion"""
        self.suggestions.append({
            'column': column,
            'technique': technique,
            'priority': priority,
            'reason': reason,
            'impact': impact,
            'code': code
        })
    
    def _suggest_missing_value_handling(self, column: str, stats: Dict[str, Any]):
        """Suggest missing value handling techniques"""
        null_pct = stats.get('null_percentage', 0)
        col_type = stats.get('type', '')
        
        if null_pct == 0:
            return
        
        if null_pct > 50:
            self._add_suggestion(
                column=column,
                technique='Consider Dropping',
                priority='high',
                reason=f'{null_pct}% missing values - may be unreliable',
                impact='high',
                code=f"# Consider: df = df.dropna(subset=['{column}']) if analysis shows column is critical"
            )
            return
        
        if col_type in ['continuous', 'numeric', 'ordinal']:
            if stats.get('outlier_percentage', 0) > 5:
                strategy = 'median'
                reason_str = f'{null_pct}% missing, median robust to outliers'
            else:
                strategy = 'mean'
                reason_str = f'{null_pct}% missing, mean suitable for normal distribution'
            
            self._add_suggestion(
                column=column,
                technique=f'Imputation ({strategy})',
                priority='high' if null_pct > 20 else 'medium',
                reason=reason_str,
                impact='high',
                code=f'''from sklearn.impute import SimpleImputer
imputer = SimpleImputer(strategy='{strategy}')
df['{column}'] = imputer.fit_transform(df[['{column}']])'''
            )
            
            # Add missing indicator
            self._add_suggestion(
                column=column,
                technique='Missing Value Indicator',
                priority='medium',
                reason='Preserve missingness pattern as feature',
                impact='medium',
                code=f'''df['{column}_missing'] = df['{column}'].isnull().astype(int)'''
            )
        
        elif col_type in ['categorical', 'binary']:
            self._add_suggestion(
                column=column,
                technique='Imputation (mode) + Indicator',
                priority='high',
                reason=f'{null_pct}% missing in categorical variable',
                impact='high',
                code=f'''df['{column}_missing'] = df['{column}'].isnull().astype(int)
df['{column}'].fillna(df['{column}'].mode()[0], inplace=True)'''
            )
    
    def _suggest_numeric_transformations(self, column: str, stats: Dict[str, Any]):
        """Suggest transformations for numeric columns"""
        col_type = stats.get('type', '')
        
        # Scaling
        if stats.get('outlier_percentage', 0) > 5:
            self._add_suggestion(
                column=column,
                technique='Robust Scaling',
                priority='high',
                reason=f"{stats.get('outlier_percentage', 0):.1f}% outliers detected",
                impact='high',
                code=f'''from sklearn.preprocessing import RobustScaler
scaler = RobustScaler()
df['{column}_scaled'] = scaler.fit_transform(df[['{column}']])'''
            )
        else:
            self._add_suggestion(
                column=column,
                technique='Standard Scaling',
                priority='medium',
                reason='Normalize for distance-based algorithms',
                impact='medium',
                code=f'''from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
df['{column}_scaled'] = scaler.fit_transform(df[['{column}']])'''
            )
        
        # Skewness correction
        skewness = stats.get('skewness')
        if skewness and abs(skewness) > 1:
            if skewness > 0:
                self._add_suggestion(
                    column=column,
                    technique='Log Transformation',
                    priority='medium',
                    reason=f'Positive skewness ({skewness:.2f})',
                    impact='medium',
                    code=f'''import numpy as np
df['{column}_log'] = np.log1p(df['{column}'].clip(lower=0))'''
                )
            else:
                self._add_suggestion(
                    column=column,
                    technique='Power Transformation',
                    priority='medium',
                    reason=f'Negative skewness ({skewness:.2f})',
                    impact='medium',
                    code=f'''from sklearn.preprocessing import PowerTransformer
pt = PowerTransformer(method='yeo-johnson')
df['{column}_transformed'] = pt.fit_transform(df[['{column}']])'''
                )
        
        # Binning for high-cardinality numeric
        if stats.get('unique', 0) > 50 and col_type == 'continuous':
            self._add_suggestion(
                column=column,
                technique='Quantile Binning',
                priority='low',
                reason=f'{stats.get("unique")} unique values - create categorical bins',
                impact='low',
                code=f'''df['{column}_binned'] = pd.qcut(df['{column}'], q=5, 
                            labels=['very_low', 'low', 'medium', 'high', 'very_high'], 
                            duplicates='drop')'''
            )
        
        # Polynomial features (for linear models)
        if col_type in ['continuous', 'numeric']:
            self._add_suggestion(
                column=column,
                technique='Polynomial Features',
                priority='low',
                reason='Capture non-linear relationships',
                impact='medium',
                code=f'''df['{column}_squared'] = df['{column}'] ** 2
df['{column}_cubed'] = df['{column}'] ** 3'''
            )
    
    def _suggest_categorical_encoding(self, column: str, stats: Dict[str, Any],
                                     task_type: Optional[str]):
        """Suggest encoding for categorical columns"""
        unique_count = stats.get('unique', 0)
        
        if unique_count <= 2:
            self._add_suggestion(
                column=column,
                technique='Label Encoding',
                priority='high',
                reason='Binary categorical - simple encoding sufficient',
                impact='high',
                code=f'''from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
df['{column}_encoded'] = le.fit_transform(df['{column}'])'''
            )
        
        elif unique_count <= 10:
            self._add_suggestion(
                column=column,
                technique='One-Hot Encoding',
                priority='high',
                reason=f'{unique_count} categories - creates sparse features',
                impact='high',
                code=f'''df = pd.get_dummies(df, columns=['{column}'], 
                         prefix='{column}', drop_first=True)'''
            )
        
        elif unique_count <= 50:
            if task_type == 'classification':
                self._add_suggestion(
                    column=column,
                    technique='Target Encoding',
                    priority='high',
                    reason=f'{unique_count} categories - reduces dimensionality',
                    impact='high',
                    code=f'''from category_encoders import TargetEncoder
encoder = TargetEncoder()
df['{column}_encoded'] = encoder.fit_transform(df[['{column}']], y)'''
                )
            else:
                self._add_suggestion(
                    column=column,
                    technique='Frequency Encoding',
                    priority='high',
                    reason=f'{unique_count} categories - preserves frequency info',
                    impact='high',
                    code=f'''freq_map = df['{column}'].value_counts(normalize=True).to_dict()
df['{column}_freq'] = df['{column}'].map(freq_map)'''
                )
        
        else:  # Very high cardinality
            self._add_suggestion(
                column=column,
                technique='Top Categories + Frequency Encoding',
                priority='high',
                reason=f'Very high cardinality ({unique_count})',
                impact='high',
                code=f'''# Keep top 20, group rest as 'Other'
top_cats = df['{column}'].value_counts().head(20).index
df['{column}_grouped'] = df['{column}'].apply(
    lambda x: x if x in top_cats else 'Other'
)
# Frequency encoding
freq_map = df['{column}_grouped'].value_counts(normalize=True).to_dict()
df['{column}_freq'] = df['{column}_grouped'].map(freq_map)'''
            )
    
    def _suggest_binary_encoding(self, column: str, stats: Dict[str, Any]):
        """Suggest encoding for binary columns"""
        self._add_suggestion(
            column=column,
            technique='Label Encoding (0/1)',
            priority='high',
            reason='Binary variable - convert to 0/1',
            impact='high',
            code=f'''df['{column}_encoded'] = df['{column}'].astype('category').cat.codes'''
        )
    
    def _suggest_datetime_features(self, column: str, stats: Dict[str, Any]):
        """Suggest feature extraction from datetime columns"""
        self._add_suggestion(
            column=column,
            technique='DateTime Feature Extraction',
            priority='high',
            reason='Extract temporal patterns',
            impact='high',
            code=f'''df['{column}'] = pd.to_datetime(df['{column}'])
df['{column}_year'] = df['{column}'].dt.year
df['{column}_month'] = df['{column}'].dt.month
df['{column}_day'] = df['{column}'].dt.day
df['{column}_dayofweek'] = df['{column}'].dt.dayofweek
df['{column}_hour'] = df['{column}'].dt.hour
df['{column}_quarter'] = df['{column}'].dt.quarter
df['{column}_is_weekend'] = df['{column}'].dt.dayofweek >= 5'''
        )
    
    def _suggest_interaction_features(self, column: str, stats: Dict[str, Any]):
        """Suggest interaction features"""
        self._add_suggestion(
            column=column,
            technique='Interaction Features',
            priority='low',
            reason='Capture feature interactions',
            impact='medium',
            code=f'''# Example: Create interaction with another important numeric feature
# df['{column}_interaction'] = df['{column}'] * df['other_feature']'''
        )