import boto3
import io
import os
from datetime import datetime
import joblib
from concurrent.futures import ThreadPoolExecutor

class R2Storage:
    def __init__(self):
        self.account_id = os.getenv('R2_ACCOUNT_ID')
        self.access_key = os.getenv('R2_ACCESS_KEY_ID')
        self.secret_key = os.getenv('R2_SECRET_ACCESS_KEY')
        self.bucket_name = os.getenv('R2_BUCKET_NAME')
        
        # Create S3 client configured for Cloudflare R2
        self.s3_client = boto3.client(
            service_name='s3',
            endpoint_url=f'https://{self.account_id}.r2.cloudflarestorage.com',
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name='auto'
        )
        
        # Thread pool for async uploads
        self.executor = ThreadPoolExecutor(max_workers=5)
    
    def _upload_and_update_db(self, buffer_data, object_key, model_id, app):
        """Internal method to upload to R2 and update database status"""
        try:
            # Import here to avoid circular imports
            from app.models.ml_model import MLModel
            from app.database.sql_db import db
            
            # Upload to R2
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=object_key,
                Body=buffer_data,
                ContentType='application/octet-stream'
            )
            
            print(f"✓ Model uploaded to R2: {object_key}")
            
            # Update database status to 'ready' within app context
            with app.app_context():
                model = MLModel.query.filter_by(model_id=model_id).first()
                if model:
                    model.status = 'ready'
                    model.upload_completed_at = datetime.utcnow()
                    model.file_size = len(buffer_data)
                    db.session.commit()
                    print(f"✓ Database updated for model: {model_id}")
            
        except Exception as e:
            print(f"✗ Failed to upload to R2: {str(e)}")
            
            # Try to mark as failed in database
            try:
                from app.models.ml_model import MLModel
                from app.database.sql_db import db
                
                with app.app_context():
                    model = MLModel.query.filter_by(model_id=model_id).first()
                    if model:
                        model.status = 'failed'
                        db.session.commit()
            except Exception as db_error:
                print(f"✗ Failed to update database status: {str(db_error)}")
    
    def save_model_only(self, sklearn_model, model_id, model_type='linear_regression'):
        """
        Save ONLY the sklearn model object to R2 (minimal storage)
        Metadata is stored in database
        
        Args:
            sklearn_model: The trained sklearn model object
            model_id: Unique identifier for the model
            model_type: Type of model
        
        Returns:
            str: r2_object_key
        """
        try:
            from flask import current_app
            
            # Serialize ONLY the model object (not metadata)
            buffer = io.BytesIO()
            joblib.dump(sklearn_model, buffer)
            buffer.seek(0)
            buffer_data = buffer.getvalue()
            
            # R2 object key
            object_key = f"trained_models/{model_type}/{model_id}.pkl"
            
            # Get current app instance to pass to background thread
            app = current_app._get_current_object()
            
            # Submit upload to background thread pool (non-blocking)
            self.executor.submit(
                self._upload_and_update_db,
                buffer_data,
                object_key,
                model_id,
                app
            )
            
            # Return immediately
            return object_key
            
        except Exception as e:
            raise Exception(f"Failed to prepare model for upload: {str(e)}")
    
    def save_model_direct_async(self, model_data, model_id, model_type='linear_regression'):
        """
        Serialize model in memory and upload directly to R2 in background
        NO LOCAL STORAGE - Everything happens in memory
        
        Args:
            model_data: Dictionary containing model and metadata
            model_id: Unique identifier for the model
            model_type: Type of model
        
        Returns:
            str: r2_object_key (upload happens in background)
        """
        try:
            from flask import current_app
            
            # Serialize model to bytes in memory
            buffer = io.BytesIO()
            joblib.dump(model_data, buffer)
            buffer.seek(0)
            buffer_data = buffer.getvalue()
            
            # R2 object key
            object_key = f"trained_models/{model_type}/{model_id}.pkl"
            
            # Get current app instance to pass to background thread
            app = current_app._get_current_object()
            
            # Submit upload to background thread pool (non-blocking)
            self.executor.submit(
                self._upload_and_update_db,
                buffer_data,
                object_key,
                model_id,
                app
            )
            
            # Return immediately - upload happens in background
            return object_key
            
        except Exception as e:
            raise Exception(f"Failed to prepare model for upload: {str(e)}")
    
    def save_model_sync(self, model_data, model_id, model_type='linear_regression'):
        """
        Save directly to R2 synchronously (blocks until upload completes)
        Use only when immediate R2 persistence is required
        """
        try:
            buffer = io.BytesIO()
            joblib.dump(model_data, buffer)
            buffer.seek(0)
            
            object_key = f"trained_models/{model_type}/{model_id}.pkl"
            
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=object_key,
                Body=buffer.getvalue(),
                ContentType='application/octet-stream'
            )
            
            return object_key
            
        except Exception as e:
            raise Exception(f"Failed to save model to R2: {str(e)}")
    
    def load_model(self, object_key):
        """Load trained model from R2"""
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=object_key
            )
            
            # Load directly from stream
            buffer = io.BytesIO(response['Body'].read())
            model_data = joblib.load(buffer)
            
            return model_data
            
        except Exception as e:
            raise Exception(f"Failed to load model from R2: {str(e)}")
    
    def load_model_only(self, object_key):
        """
        Load ONLY the sklearn model from R2
        (For when you saved with save_model_only)
        
        Args:
            object_key: R2 object key of the model
        
        Returns:
            sklearn model object
        """
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=object_key
            )
            
            # Load only the model
            buffer = io.BytesIO(response['Body'].read())
            model = joblib.load(buffer)
            
            return model
            
        except Exception as e:
            raise Exception(f"Failed to load model from R2: {str(e)}")
    
    def model_exists(self, object_key):
        """Check if model exists in R2"""
        try:
            self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=object_key
            )
            return True
        except:
            return False
    
    def delete_model(self, object_key):
        """Delete model from R2"""
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=object_key
            )
            return True
            
        except Exception as e:
            raise Exception(f"Failed to delete model from R2: {str(e)}")
    
    def list_models(self, model_type=None):
        """List all saved models in R2"""
        try:
            prefix = f"trained_models/{model_type}/" if model_type else "trained_models/"
            
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix
            )
            
            if 'Contents' in response:
                return [obj['Key'] for obj in response['Contents']]
            return []
            
        except Exception as e:
            raise Exception(f"Failed to list models from R2: {str(e)}")
    
    def get_model_info(self, object_key):
        """Get metadata about a model in R2"""
        try:
            response = self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=object_key
            )
            
            return {
                'size': response['ContentLength'],
                'last_modified': response['LastModified'].isoformat(),
                'object_key': object_key
            }
            
        except Exception as e:
            raise Exception(f"Failed to get model info: {str(e)}")
    
    def get_file_size(self, object_key):
        """Get file size from R2"""
        try:
            response = self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=object_key
            )
            return response['ContentLength']
        except Exception as e:
            return None
    
    def shutdown(self):
        """Gracefully shutdown executor"""
        self.executor.shutdown(wait=True)