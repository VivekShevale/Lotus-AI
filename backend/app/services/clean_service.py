# app/services/clean_service.py
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
from sklearn.impute import SimpleImputer

def clean_data(df, scaling_method='Standard', missing_values='Impute'):
    """
    Clean and preprocess the dataframe.
    
    Parameters:
    -----------
    df : pandas.DataFrame
        Input dataframe
    scaling_method : str
        Scaling method ('Standard', 'MinMax', 'Robust', or 'None')
    missing_values : str
        Missing value handling ('Impute', 'Drop', or 'Ignore')
    
    Returns:
    --------
    cleaned_df : pandas.DataFrame
        Cleaned dataframe
    report : dict
        Cleaning report
    """
    
    original_shape = df.shape
    report = {
        'original_shape': original_shape,
        'scaling_method': scaling_method,
        'missing_values_handling': missing_values,
        'actions_taken': []
    }
    
    # Create a copy to avoid modifying the original
    cleaned_df = df.copy()
    
    # Handle missing values
    if missing_values == 'Impute':
        # Impute numerical columns with mean
        numerical_cols = cleaned_df.select_dtypes(include=[np.number]).columns
        if len(numerical_cols) > 0:
            imputer = SimpleImputer(strategy='mean')
            cleaned_df[numerical_cols] = imputer.fit_transform(cleaned_df[numerical_cols])
            report['actions_taken'].append(f'Imputed missing values in {len(numerical_cols)} numerical columns with mean')
        
        # Impute categorical columns with mode
        categorical_cols = cleaned_df.select_dtypes(include=['object', 'category']).columns
        if len(categorical_cols) > 0:
            for col in categorical_cols:
                mode_value = cleaned_df[col].mode()
                if not mode_value.empty:
                    cleaned_df[col].fillna(mode_value[0], inplace=True)
            report['actions_taken'].append(f'Imputed missing values in {len(categorical_cols)} categorical columns with mode')
            
    elif missing_values == 'Drop':
        # Drop rows with any missing values
        rows_before = len(cleaned_df)
        cleaned_df.dropna(inplace=True)
        rows_dropped = rows_before - len(cleaned_df)
        report['actions_taken'].append(f'Dropped {rows_dropped} rows with missing values')
    
    # Apply scaling to numerical columns
    if scaling_method != 'None':
        numerical_cols = cleaned_df.select_dtypes(include=[np.number]).columns
        if len(numerical_cols) > 0:
            if scaling_method == 'Standard':
                scaler = StandardScaler()
                report['scaling_details'] = 'Standard scaling (zero mean, unit variance)'
            elif scaling_method == 'MinMax':
                scaler = MinMaxScaler()
                report['scaling_details'] = 'Min-Max scaling (range 0-1)'
            elif scaling_method == 'Robust':
                scaler = RobustScaler()
                report['scaling_details'] = 'Robust scaling (using IQR)'
            else:
                scaler = StandardScaler()
                report['scaling_details'] = 'Standard scaling (default)'
            
            cleaned_df[numerical_cols] = scaler.fit_transform(cleaned_df[numerical_cols])
            report['actions_taken'].append(f'Applied {scaling_method} scaling to {len(numerical_cols)} numerical columns')
    
    # Remove duplicates
    duplicates = cleaned_df.duplicated().sum()
    if duplicates > 0:
        cleaned_df.drop_duplicates(inplace=True)
        report['actions_taken'].append(f'Removed {duplicates} duplicate rows')
    
    # Convert categorical columns to one-hot encoding
    categorical_cols = cleaned_df.select_dtypes(include=['object', 'category']).columns
    if len(categorical_cols) > 0:
        cleaned_df = pd.get_dummies(cleaned_df, columns=categorical_cols, drop_first=True)
        report['actions_taken'].append(f'One-hot encoded {len(categorical_cols)} categorical columns')
    
    report['final_shape'] = cleaned_df.shape
    report['rows_removed'] = original_shape[0] - cleaned_df.shape[0]
    report['columns_changed'] = original_shape[1] - cleaned_df.shape[1]
    
    return cleaned_df, report