from typing import Dict, List, Any, Optional
import pandas as pd
from app.utils.statistics import infer_column_type

class TaskAgent:
    """Agent for detecting ML task type and target column"""
    
    def __init__(self):
        pass
    
    def detect(self, data: List[Dict], columns: List[str], 
               column_stats: Dict[str, Any]) -> Dict[str, Any]:
        """
        Detect ML task type and target column
        
        Args:
            data: List of dictionaries representing rows
            columns: List of column names
            column_stats: Statistics from quality agent
            
        Returns:
            Dictionary with task detection results
        """
        df = pd.DataFrame(data)
        
        # Try to detect target column
        target_info = self._detect_target_column(df, columns, column_stats)
        
        # If no clear target, analyze all columns
        if not target_info['target_column']:
            potential_targets = self._find_potential_targets(df, columns, column_stats)
            target_info['potential_targets'] = potential_targets
            
            if potential_targets:
                # Use the best potential target
                best_target = potential_targets[0]
                target_info['target_column'] = best_target['column']
                target_info['task_type'] = best_target['likely_task']
                target_info['confidence'] = best_target['score'] / 100
        
        # Calculate target balance if classification
        if target_info['task_type'] == 'classification' and target_info['target_column']:
            balance_ratio = self._calculate_balance_ratio(df, target_info['target_column'])
            target_info['balance_ratio'] = balance_ratio
            target_info['is_imbalanced'] = balance_ratio < 0.3 if balance_ratio else False
        
        return target_info
    
    def _detect_target_column(self, df: pd.DataFrame, columns: List[str],
                            column_stats: Dict[str, Any]) -> Dict[str, Any]:
        """Try to detect target column"""
        result = {
            'task_type': None,
            'target_column': None,
            'confidence': 0,
            'reasoning': []
        }
        
        # Check last column (common convention)
        last_col = columns[-1]
        last_stats = column_stats.get(last_col, {})
        
        if last_stats.get('type') == 'binary':
            result.update({
                'task_type': 'classification',
                'target_column': last_col,
                'confidence': 0.9,
                'reasoning': [f"Last column '{last_col}' is binary (2 unique values)"]
            })
        elif last_stats.get('type') == 'categorical' and last_stats.get('unique', 0) <= 10:
            result.update({
                'task_type': 'classification',
                'target_column': last_col,
                'confidence': 0.85,
                'reasoning': [f"Last column '{last_col}' has {last_stats.get('unique')} categories"],
                'num_classes': last_stats.get('unique')
            })
        elif last_stats.get('type') in ['continuous', 'numeric'] and last_stats.get('unique_ratio', 0) > 0.5:
            result.update({
                'task_type': 'regression',
                'target_column': last_col,
                'confidence': 0.8,
                'reasoning': [f"Last column '{last_col}' is continuous with high uniqueness"]
            })
        elif last_stats.get('null_percentage', 100) == 0:
            # Last column with no missing values
            result.update({
                'task_type': 'regression' if last_stats.get('type') in ['continuous', 'numeric'] else 'classification',
                'target_column': last_col,
                'confidence': 0.7,
                'reasoning': [f"Last column '{last_col}' has no missing values"]
            })
        
        return result
    
    def _find_potential_targets(self, df: pd.DataFrame, columns: List[str],
                              column_stats: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Find all potential target columns"""
        potential_targets = []
        
        for col in columns:
            stats = column_stats.get(col, {})
            col_type = stats.get('type', '')
            unique_vals = stats.get('unique', 0)
            null_pct = stats.get('null_percentage', 100)
            
            # Calculate target score
            score = 0
            
            # Position bonus (last column)
            if col == columns[-1]:
                score += 30
            
            # Type-based scores
            if col_type == 'binary':
                score += 40
                likely_task = 'classification'
            elif col_type == 'categorical' and 2 <= unique_vals <= 20:
                score += 35
                likely_task = 'classification'
            elif col_type in ['continuous', 'numeric'] and unique_vals > 10:
                score += 30
                likely_task = 'regression'
            elif col_type == 'ordinal' and unique_vals > 3:
                score += 25
                likely_task = 'classification'
            else:
                continue  # Not a good target
            
            # Completeness bonus
            if null_pct == 0:
                score += 20
            
            # Name hints
            col_lower = col.lower()
            if any(keyword in col_lower for keyword in ['target', 'label', 'class', 'outcome', 'result']):
                score += 15
            if any(keyword in col_lower for keyword in ['score', 'price', 'amount', 'value', 'rating']):
                score += 10
            
            potential_targets.append({
                'column': col,
                'type': col_type,
                'unique': unique_vals,
                'null_percentage': null_pct,
                'score': score,
                'likely_task': likely_task
            })
        
        # Sort by score
        return sorted(potential_targets, key=lambda x: x['score'], reverse=True)[:5]
    
    def _calculate_balance_ratio(self, df: pd.DataFrame, target_col: str) -> Optional[float]:
        """Calculate class balance ratio for classification"""
        if target_col not in df.columns:
            return None
        
        value_counts = df[target_col].value_counts()
        if len(value_counts) < 2:
            return None
        
        min_count = value_counts.min()
        max_count = value_counts.max()
        
        return round(min_count / max_count, 3)