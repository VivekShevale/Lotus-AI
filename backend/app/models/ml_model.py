# app/models/ml_model.py
from app.database.sql_db import db
from datetime import datetime
import json

class MLModel(db.Model):
    __tablename__ = "ml_models"

    id = db.Column(db.Integer, primary_key=True)
    
    # Model identification
    model_id = db.Column(db.String(100), unique=True, nullable=False, index=True)
    model_type = db.Column(db.String(50), nullable=False)  # linear_regression, decision_tree, etc.
    model_name = db.Column(db.String(200))  # Optional user-friendly name
    
    # File storage
    r2_path = db.Column(db.String(500), nullable=False)  # Path in R2 bucket
    file_size = db.Column(db.Integer)  # Size in bytes
    
    # Model configuration
    target_column = db.Column(db.String(100))
    feature_names = db.Column(db.Text)  # JSON array of feature names
    n_features = db.Column(db.Integer)
    
    # Training parameters (stored as JSON for flexibility)
    hyperparameters = db.Column(db.Text)  # JSON object
    
    # Performance metrics (stored as JSON)
    metrics = db.Column(db.Text)  # JSON object with r2, mae, rmse, accuracy, etc.
    
    # Dataset info
    n_samples = db.Column(db.Integer)
    test_size = db.Column(db.Float)
    
    # Status tracking
    status = db.Column(db.String(20), default='uploading')  # uploading, ready, failed
    upload_completed_at = db.Column(db.DateTime)
    
    # User relationship (if you want to track who created the model)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    user = db.relationship('User', backref='models')
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<MLModel {self.model_id} ({self.model_type})>"
    
    def to_dict(self):
        """Convert model to dictionary for JSON responses"""
        return {
            'id': self.id,
            'model_id': self.model_id,
            'model_type': self.model_type,
            'model_name': self.model_name,
            'r2_path': self.r2_path,
            'file_size': self.file_size,
            'target_column': self.target_column,
            'feature_names': json.loads(self.feature_names) if self.feature_names else [],
            'n_features': self.n_features,
            'hyperparameters': json.loads(self.hyperparameters) if self.hyperparameters else {},
            'metrics': json.loads(self.metrics) if self.metrics else {},
            'n_samples': self.n_samples,
            'test_size': self.test_size,
            'status': self.status,
            'upload_completed_at': self.upload_completed_at.isoformat() if self.upload_completed_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
    
    @staticmethod
    def create_from_training(model_data, r2_path, user_id=None):
        """Helper method to create model record from training results"""
        return MLModel(
            model_id=model_data['model_id'],
            model_type=model_data['model_type'],
            r2_path=r2_path,
            target_column=model_data.get('target_column'),
            feature_names=json.dumps(model_data.get('feature_names', [])),
            n_features=len(model_data.get('feature_names', [])),
            hyperparameters=json.dumps(model_data.get('hyperparameters', {})),
            metrics=json.dumps(model_data.get('metrics', {})),
            n_samples=model_data.get('n_samples'),
            test_size=model_data.get('test_size'),
            status='uploading',
            user_id=user_id
        )