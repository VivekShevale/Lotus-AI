import numpy as np
from typing import List, Dict, Any, Optional
from scipy import stats
import pandas as pd

def calculate_stats(values: List) -> Optional[Dict[str, Any]]:
    """
    Calculate statistical measures for numeric values
    
    Args:
        values: List of values
        
    Returns:
        Dictionary of statistics or None if insufficient data
    """
    # Filter numeric values
    numeric = []
    for v in values:
        try:
            if v is None or pd.isna(v):
                continue
            num = float(v)
            if np.isfinite(num):
                numeric.append(num)
        except:
            continue
    
    if len(numeric) < 2:
        return None
    
    numeric_array = np.array(numeric)
    
    # Basic statistics - convert numpy types to Python native types
    stats_dict = {
        'count': int(len(numeric)),  # Convert to int
        'mean': float(np.mean(numeric_array)),
        'median': float(np.median(numeric_array)),
        'std': float(np.std(numeric_array, ddof=1)),
        'variance': float(np.var(numeric_array, ddof=1)),
        'min': float(np.min(numeric_array)),
        'max': float(np.max(numeric_array)),
        'q1': float(np.percentile(numeric_array, 25)),
        'q3': float(np.percentile(numeric_array, 75)),
        'iqr': float(np.percentile(numeric_array, 75) - np.percentile(numeric_array, 25)),
        'range': float(np.max(numeric_array) - np.min(numeric_array))
    }
    
    # Skewness and kurtosis
    if len(numeric) >= 3 and stats_dict['std'] > 1e-10:
        try:
            stats_dict['skewness'] = float(stats.skew(numeric_array))
            stats_dict['kurtosis'] = float(stats.kurtosis(numeric_array))
        except:
            stats_dict['skewness'] = None
            stats_dict['kurtosis'] = None
    
    # Detect outliers using IQR method
    lower_bound = stats_dict['q1'] - 1.5 * stats_dict['iqr']
    upper_bound = stats_dict['q3'] + 1.5 * stats_dict['iqr']
    outliers = [float(x) for x in numeric_array if x < lower_bound or x > upper_bound]  # Convert to float
    
    stats_dict['outlier_count'] = int(len(outliers))  # Convert to int
    stats_dict['outlier_percentage'] = float((len(outliers) / len(numeric)) * 100) if numeric else 0.0
    stats_dict['lower_bound'] = float(lower_bound)
    stats_dict['upper_bound'] = float(upper_bound)
    
    # Normality test (for larger samples)
    if len(numeric) >= 20:
        try:
            _, p_value = stats.shapiro(numeric_array)
            stats_dict['normality_pvalue'] = float(p_value) if not np.isnan(p_value) else None
        except:
            stats_dict['normality_pvalue'] = None
    
    return stats_dict

def infer_column_type(values: List) -> Dict[str, Any]:
    """
    Infer column data type with confidence
    
    Args:
        values: List of values
        
    Returns:
        Dictionary with type information
    """
    non_null = [v for v in values if v is not None and not pd.isna(v)]
    if not non_null:
        return {'type': 'empty', 'confidence': 1.0}
    
    # Check for datetime
    date_count = 0
    for v in non_null:
        if isinstance(v, (pd.Timestamp, np.datetime64)):
            date_count += 1
        elif isinstance(v, str):
            try:
                pd.to_datetime(v)
                date_count += 1
            except:
                pass
    
    if date_count / len(non_null) > 0.7:
        return {'type': 'datetime', 'confidence': date_count / len(non_null)}
    
    # Check for numeric
    numeric_count = 0
    for v in non_null:
        try:
            float(v)
            numeric_count += 1
        except:
            pass
    
    numeric_ratio = numeric_count / len(non_null)
    
    if numeric_ratio > 0.9:
        unique_values = set(non_null)
        unique_ratio = len(unique_values) / len(non_null)
        
        # Check if it's continuous
        if unique_ratio > 0.9 and len(unique_values) > 10:
            return {'type': 'continuous', 'confidence': numeric_ratio}
        # Check if it's ordinal/categorical numeric
        elif unique_ratio < 0.1 and len(unique_values) < 10:
            return {'type': 'ordinal', 'confidence': numeric_ratio}
        else:
            return {'type': 'numeric', 'confidence': numeric_ratio}
    
    # Check for categorical
    unique_values = set(str(v).lower().strip() for v in non_null if v is not None)
    unique_ratio = len(unique_values) / len(non_null)
    
    # Binary categorical
    if len(unique_values) == 2:
        return {'type': 'binary', 'confidence': 1.0}
    
    # Regular categorical
    if unique_ratio < 0.5 and len(unique_values) < 50:
        return {'type': 'categorical', 'confidence': 1 - unique_ratio}
    
    # ID column
    if unique_ratio > 0.95 and len(non_null) > 10:
        return {'type': 'identifier', 'confidence': unique_ratio}
    
    # Text column
    avg_len = np.mean([len(str(v)) for v in non_null if v is not None])
    if avg_len > 50:
        return {'type': 'text', 'confidence': 0.8}
    
    return {'type': 'unknown', 'confidence': 0.5}

def calculate_correlation(df: pd.DataFrame, col1: str, col2: str) -> float:
    """
    Calculate correlation between two columns
    
    Args:
        df: DataFrame
        col1: First column name
        col2: Second column name
        
    Returns:
        Correlation coefficient
    """
    try:
        # Extract numeric values
        series1 = pd.to_numeric(df[col1], errors='coerce')
        series2 = pd.to_numeric(df[col2], errors='coerce')
        
        # Drop NaN pairs
        valid_pairs = pd.concat([series1, series2], axis=1).dropna()
        
        if len(valid_pairs) < 2:
            return 0
        
        return float(valid_pairs.iloc[:, 0].corr(valid_pairs.iloc[:, 1]))
    except:
        return 0