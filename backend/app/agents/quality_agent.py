from typing import Dict, List, Any, Tuple
import pandas as pd
from app.utils.statistics import calculate_stats, infer_column_type, calculate_correlation

class QualityAgent:
    """Agent for analyzing data quality issues"""
    
    def __init__(self):
        self.issues = []
        self.column_stats = {}
        self.correlations = []
    
    def analyze(self, data: List[Dict], columns: List[str]) -> Dict[str, Any]:
        """
        Analyze data quality
        
        Args:
            data: List of dictionaries representing rows
            columns: List of column names
            
        Returns:
            Dictionary with analysis results
        """
        df = pd.DataFrame(data)
        
        for col in columns:
            self._analyze_column(df, col)
        
        # Find correlated columns
        self._find_correlations(df)
        
        # Calculate overall quality score
        quality_score = self._calculate_quality_score()
        
        return {
            'issues': self.issues,
            'stats': self.column_stats,
            'correlations': self.correlations,
            'quality_score': quality_score,
            'summary': self._generate_summary()
        }
    
    def _analyze_column(self, df: pd.DataFrame, column: str):
        """Analyze a single column"""
        values = df[column].tolist()
        non_null = [v for v in values if v is not None and not pd.isna(v)]
        null_count = len(values) - len(non_null)
        null_percentage = (null_count / len(values)) * 100 if values else 0
        
        # Infer type
        type_info = infer_column_type(values)
        
        # Calculate statistics
        stats = {
            'null_count': null_count,
            'null_percentage': round(null_percentage, 2),
            'non_null_count': len(non_null),
            'type': type_info['type'],
            'type_confidence': round(type_info['confidence'], 2),
            'unique': len(set(non_null)),
            'unique_ratio': round(len(set(non_null)) / len(non_null), 3) if non_null else 0,
            'sample_values': list(set(non_null))[:5]
        }
        
        # Add numeric statistics if applicable
        if type_info['type'] in ['numeric', 'continuous', 'ordinal']:
            numeric_stats = calculate_stats(values)
            if numeric_stats:
                stats.update(numeric_stats)
                
                # Check for outliers
                if numeric_stats.get('outlier_count', 0) > 0:
                    outlier_pct = numeric_stats['outlier_percentage']
                    if outlier_pct > 20:
                        self._add_issue(
                            severity='high',
                            column=column,
                            issue_type='outliers',
                            message=f'{numeric_stats["outlier_count"]} outliers ({outlier_pct:.1f}%) detected',
                            recommendation='Investigate extreme values; consider robust scaling or winsorization'
                        )
                    elif outlier_pct > 5:
                        self._add_issue(
                            severity='medium',
                            column=column,
                            issue_type='outliers',
                            message=f'{numeric_stats["outlier_count"]} outliers ({outlier_pct:.1f}%) detected',
                            recommendation='Consider robust scaling methods'
                        )
                
                # Check skewness
                skewness = numeric_stats.get('skewness')
                if skewness and abs(skewness) > 1:
                    self._add_issue(
                        severity='low',
                        column=column,
                        issue_type='distribution',
                        message=f'High skewness ({skewness:.2f})',
                        recommendation='Consider log or Box-Cox transformation'
                    )
                
                # Check variance
                std = numeric_stats.get('std')
                if std and std < 0.001:
                    self._add_issue(
                        severity='medium',
                        column=column,
                        issue_type='variance',
                        message='Very low variance',
                        recommendation='Column may not be useful for modeling'
                    )
        
        # Check for missing values
        if null_percentage > 50:
            self._add_issue(
                severity='high',
                column=column,
                issue_type='missing',
                message=f'Critical: {null_percentage:.1f}% missing values',
                recommendation='Consider dropping column or advanced imputation'
            )
        elif null_percentage > 20:
            self._add_issue(
                severity='medium',
                column=column,
                issue_type='missing',
                message=f'{null_percentage:.1f}% missing values',
                recommendation='Use appropriate imputation strategy'
            )
        
        # High cardinality for categorical
        if type_info['type'] == 'categorical' and stats['unique'] > 50:
            self._add_issue(
                severity='medium',
                column=column,
                issue_type='cardinality',
                message=f'High cardinality: {stats["unique"]} unique values',
                recommendation='Consider target encoding or grouping rare categories'
            )
        
        # ID column detection
        if type_info['type'] == 'identifier':
            self._add_issue(
                severity='low',
                column=column,
                issue_type='identifier',
                message='Appears to be an ID column',
                recommendation='Exclude from modeling'
            )
        
        # Constant value
        if stats['unique'] == 1 and len(non_null) > 0:
            self._add_issue(
                severity='high',
                column=column,
                issue_type='constant',
                message='Constant value',
                recommendation='Remove column - no predictive value'
            )
        
        self.column_stats[column] = stats
    
    def _add_issue(self, severity: str, column: str, issue_type: str, 
                   message: str, recommendation: str):
        """Add a quality issue"""
        self.issues.append({
            'severity': severity,
            'column': column,
            'type': issue_type,
            'message': message,
            'recommendation': recommendation
        })
    
    def _find_correlations(self, df: pd.DataFrame):
        """Find highly correlated columns"""
        numeric_cols = [
            col for col, stats in self.column_stats.items()
            if stats['type'] in ['numeric', 'continuous', 'ordinal']
        ]
        
        for i, col1 in enumerate(numeric_cols):
            for col2 in numeric_cols[i+1:]:
                corr = calculate_correlation(df, col1, col2)
                if abs(corr) > 0.8:
                    self.correlations.append({
                        'col1': col1,
                        'col2': col2,
                        'correlation': round(corr, 3)
                    })
                    self._add_issue(
                        severity='medium' if abs(corr) > 0.9 else 'low',
                        column=f'{col1} & {col2}',
                        issue_type='correlation',
                        message=f'High correlation: {corr:.3f}',
                        recommendation='Consider removing one to reduce multicollinearity'
                    )
    
    def _calculate_quality_score(self) -> float:
        """Calculate overall quality score (0-100)"""
        if not self.column_stats:
            return 100
        
        score = 100
        
        # Deduct for issues
        for issue in self.issues:
            if issue['severity'] == 'high':
                score -= 5
            elif issue['severity'] == 'medium':
                score -= 2
            else:
                score -= 0.5
        
        # Deduct for missing values
        for col, stats in self.column_stats.items():
            if stats['null_percentage'] > 50:
                score -= 10
            elif stats['null_percentage'] > 20:
                score -= 5
        
        return max(0, min(100, score))
    
    def _generate_summary(self) -> Dict[str, Any]:
        """Generate quality summary"""
        summary = {
            'total_issues': len(self.issues),
            'high_issues': len([i for i in self.issues if i['severity'] == 'high']),
            'medium_issues': len([i for i in self.issues if i['severity'] == 'medium']),
            'low_issues': len([i for i in self.issues if i['severity'] == 'low']),
            'columns_analyzed': len(self.column_stats),
            'columns_with_missing': len([c for c, s in self.column_stats.items() 
                                         if s['null_percentage'] > 0]),
            'high_correlations': len([c for c in self.correlations if abs(c['correlation']) > 0.9])
        }
        
        return summary