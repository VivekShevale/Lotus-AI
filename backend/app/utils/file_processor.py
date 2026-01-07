import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any
import io

def process_file(file_path: str) -> pd.DataFrame:
    """
    Process uploaded file (CSV or Excel) into pandas DataFrame
    
    Args:
        file_path: Path to uploaded file
        
    Returns:
        pandas DataFrame
        
    Raises:
        ValueError: If file format is unsupported or corrupted
    """
    # Determine file type by extension
    if file_path.endswith('.csv'):
        df = pd.read_csv(file_path)
    elif file_path.endswith(('.xlsx', '.xls')):
        df = pd.read_excel(file_path, engine='openpyxl')
    else:
        raise ValueError(f"Unsupported file format: {file_path}")
    
    # Clean column names
    df.columns = [str(col).strip() for col in df.columns]
    
    # Convert object types to appropriate types
    for col in df.columns:
        if df[col].dtype == 'object':
            # Try to convert to datetime
            try:
                df[col] = pd.to_datetime(df[col])
            except:
                # Try to convert to numeric
                try:
                    df[col] = pd.to_numeric(df[col], errors='ignore')
                except:
                    pass
    
    # Replace infinite values with NaN
    df = df.replace([np.inf, -np.inf], np.nan)
    
    return df

def validate_dataframe(df: pd.DataFrame) -> Tuple[bool, str]:
    """
    Validate DataFrame for analysis
    
    Args:
        df: DataFrame to validate
        
    Returns:
        Tuple of (is_valid, message)
    """
    if df.empty:
        return False, "Dataset is empty"
    
    if len(df.columns) < 2:
        return False, "Dataset must have at least 2 columns"
    
    if len(df) < 10:
        return False, "Dataset must have at least 10 rows for meaningful analysis"
    
    # Check for excessive missing values
    missing_pct = df.isnull().mean().max() * 100
    if missing_pct > 90:
        return False, f"One or more columns have {missing_pct:.1f}% missing values"
    
    return True, "Dataset is valid"

def get_dataset_statistics(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Get basic statistics about the dataset
    
    Args:
        df: DataFrame
        
    Returns:
        Dictionary with dataset statistics
    """
    stats = {
        'rows': len(df),
        'columns': len(df.columns),
        'total_cells': len(df) * len(df.columns),
        'missing_cells': df.isnull().sum().sum(),
        'missing_percentage': (df.isnull().sum().sum() / (len(df) * len(df.columns))) * 100,
        'column_types': df.dtypes.apply(lambda x: x.name).to_dict(),
        'memory_usage_mb': df.memory_usage(deep=True).sum() / 1024 / 1024
    }
    
    return stats