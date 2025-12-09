import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from scipy import stats
import warnings
warnings.filterwarnings('ignore')
from flask import request, jsonify

def clean_data(
    input_csv=None,
    output_csv=None,
    df=None,
    missing_threshold=0.6,
    outlier_method='iqr',
    remove_outliers=True,
    scale_features=False,
    verbose=True,
    run_remove_duplicates=True,
    run_handle_missing=True,
    run_clean_text=True
):
    input_csv = request.files['file']
    # Load data
    if df is None:
        df = pd.read_csv(input_csv)
    if verbose:
        print("\n" + "="*60)
        print("📊 DATA CLEANING PIPELINE")
        print("="*60)
        print(f"\n🔹 Initial Shape: {df.shape}")
    # if run_remove_duplicates:
    #     duplicates = df.duplicated().sum()
    #     df.drop_duplicates(inplace=True)
    # if run_handle_missing:
    #     df = handle_missing_values(df, numeric_cols, categorical_cols)
    # if run_clean_text:
    #     df = clean_text_columns(df, categorical_cols)
    
    # Track changes
    initial_rows = len(df)
    initial_cols = len(df.columns)
    
    # 1. Initial data type optimization
    df = optimize_dtypes(df, verbose)
    
    # 2. Remove completely empty rows/columns
    df.dropna(how='all', axis=0, inplace=True)
    df.dropna(how='all', axis=1, inplace=True)
    
    # 3. Remove duplicate rows
    duplicates = df.duplicated().sum()
    df.drop_duplicates(inplace=True, keep='first')
    if verbose and duplicates > 0:
        print(f"\n✓ Removed {duplicates} duplicate rows")
    
    # 4. Drop columns with excessive missing values
    missing_pct = df.isna().mean()
    cols_to_drop = missing_pct[missing_pct > missing_threshold].index.tolist()
    if cols_to_drop:
        df.drop(columns=cols_to_drop, inplace=True)
        if verbose:
            print(f"\n✓ Dropped {len(cols_to_drop)} columns with >{missing_threshold*100}% missing")
    
    # 5. Identify column types
    numeric_cols = df.select_dtypes(include=['int64', 'float64', 'int32', 'float32']).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
    
    # 6. Handle missing values
    df = handle_missing_values(df, numeric_cols, categorical_cols, verbose)
    
    # 7. Clean text data
    df = clean_text_columns(df, categorical_cols, verbose)
    
    # 8. Handle outliers
    if remove_outliers and numeric_cols:
        df, outliers_removed = handle_outliers(df, numeric_cols, method=outlier_method, verbose=verbose)
    
    # 9. Encode categorical variables
    df, label_encoders = encode_categoricals(df, categorical_cols, verbose)
    
    # 10. Feature scaling (optional)
    if scale_features and numeric_cols:
        df, scaler = scale_numeric_features(df, numeric_cols, verbose)
    
    # 11. Final validation and type conversion
    df = final_validation(df, verbose)
    
    # 12. Convert all numeric columns to standard Python types
    df = convert_to_standard_types(df, verbose)
    
    if verbose:
        print("\n" + "="*60)
        print("✅ CLEANING COMPLETE!")
        print("="*60)
        print(f"🔹 Final Shape: {df.shape}")
        print(f"🔹 Rows removed: {initial_rows - len(df)}")
        print(f"🔹 Columns removed: {initial_cols - len(df.columns)}")
        print("="*60 + "\n")
    
    if output_csv:
        df.to_csv(output_csv, index=False)
    return df, label_encoders if 'label_encoders' in locals() else None

def convert_to_standard_types(df, verbose=True):
    """Convert all numeric columns to standard Python int/float types"""
    for col in df.select_dtypes(include=['int8', 'int16', 'int32', 'int64']).columns:
        df[col] = df[col].astype('int64')
    
    for col in df.select_dtypes(include=['float32', 'float64']).columns:
        df[col] = df[col].astype('float64')
    
    if verbose:
        print("✓ Converted all numeric columns to standard Python types")
    
    return df

def optimize_dtypes(df, verbose=True):
    """Optimize data types but ensure final conversion to standard types"""
    for col in df.select_dtypes(include=['int64']).columns:
        df[col] = pd.to_numeric(df[col], downcast='integer')
    for col in df.select_dtypes(include=['float64']).columns:
        df[col] = pd.to_numeric(df[col], downcast='float')
    if verbose:
        print("\n✓ Optimized data types")
    return df

def handle_missing_values(df, numeric_cols, categorical_cols, verbose=True):
    """Smart missing value imputation"""
    missing_before = df.isna().sum().sum()
    
    for col in numeric_cols:
        missing_count = df[col].isna().sum()
        if missing_count > 0:
            if df[col].skew() > 1 or df[col].skew() < -1:
                df[col].fillna(df[col].median(), inplace=True)
            else:
                df[col].fillna(df[col].mean(), inplace=True)
    
    for col in categorical_cols:
        missing_count = df[col].isna().sum()
        if missing_count > 0:
            if not df[col].mode().empty:
                df[col].fillna(df[col].mode()[0], inplace=True)
            else:
                df[col].fillna('unknown', inplace=True)
    
    if verbose and missing_before > 0:
        print(f"\n✓ Imputed {missing_before} missing values")
    return df

def clean_text_columns(df, categorical_cols, verbose=True):
    """Clean and standardize text data"""
    for col in categorical_cols:
        df[col] = df[col].astype(str)
        df[col] = df[col].str.strip()
        df[col] = df[col].str.lower()
        df[col] = df[col].replace('nan', np.nan)
        df[col] = df[col].replace('', np.nan)
    
    if verbose and categorical_cols:
        print(f"\n✓ Cleaned {len(categorical_cols)} text columns")
    return df

def handle_outliers(df, numeric_cols, method='iqr', verbose=True):
    """Remove outliers using different methods"""
    outliers_removed = 0
    initial_len = len(df)
    
    if method == 'iqr':
        for col in numeric_cols:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower = Q1 - 1.5 * IQR
            upper = Q3 + 1.5 * IQR
            df = df[(df[col] >= lower) & (df[col] <= upper)]
    
    elif method == 'zscore':
        for col in numeric_cols:
            z_scores = np.abs(stats.zscore(df[col]))
            df = df[z_scores < 3]
    
    outliers_removed = initial_len - len(df)
    
    if verbose and outliers_removed > 0:
        print(f"\n✓ Removed {outliers_removed} outlier rows using {method.upper()} method")
    
    return df, outliers_removed

def encode_categoricals(df, categorical_cols, verbose=True):
    """Encode categorical variables with label encoding"""
    label_encoders = {}
    
    for col in categorical_cols:
        if col in df.columns:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            label_encoders[col] = le
    
    if verbose and label_encoders:
        print(f"\n✓ Encoded {len(label_encoders)} categorical columns")
    
    return df, label_encoders

def scale_numeric_features(df, numeric_cols, verbose=True):
    """Standardize numerical features"""
    scaler = StandardScaler()
    df[numeric_cols] = scaler.fit_transform(df[numeric_cols])
    
    if verbose:
        print(f"\n✓ Scaled {len(numeric_cols)} numerical features")
    
    return df, scaler

def final_validation(df, verbose=True):
    """Final checks and corrections"""
    df.dropna(inplace=True)
    df.reset_index(drop=True, inplace=True)
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(inplace=True)
    
    if verbose:
        print("\n✓ Final validation complete")
    
    return df