from flask import Blueprint, request, jsonify
from app.utils.r2_storage import R2Storage
from app.models.ml_model import MLModel
from app.database.sql_db import db
import pandas as pd
import io

model_bp = Blueprint("model", __name__)


@model_bp.route("/api/model/status/<model_id>", methods=["GET"])
def check_model_status(model_id):
    """Check model status from DATABASE (fast query)"""
    try:
        model = MLModel.query.filter_by(model_id=model_id).first()
        
        if not model:
            return jsonify({"error": "Model not found"}), 404
        
        return jsonify({
            "status": model.status,
            "model_id": model.model_id,
            "upload_completed_at": model.upload_completed_at.isoformat() if model.upload_completed_at else None,
            "file_size": model.file_size,
            "created_at": model.created_at.isoformat()
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@model_bp.route("/api/model/predict", methods=["POST"])
def predict_with_model():
    """Make predictions using a saved model"""
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        model_id = request.form.get("model_id")
        
        if not model_id:
            return jsonify({"error": "model_id is required"}), 400

        # Get model info from database
        ml_model = MLModel.query.filter_by(model_id=model_id).first()
        
        if not ml_model:
            return jsonify({"error": "Model not found"}), 404
        
        if ml_model.status != 'ready':
            return jsonify({"error": f"Model is not ready. Status: {ml_model.status}"}), 400

        # Load ONLY the sklearn model from R2
        r2_storage = R2Storage()
        sklearn_model = r2_storage.load_model_only(ml_model.r2_path)

        # Read input data
        file = request.files["file"]
        filename = file.filename.lower()
        
        if filename.endswith('.xlsx'):
            df = pd.read_excel(file, engine='openpyxl')
        elif filename.endswith('.xls'):
            df = pd.read_excel(file, engine='xlrd')
        else:
            # Read as CSV
            df = pd.read_csv(file)

        # Get feature names from database
        import json
        feature_names = json.loads(ml_model.feature_names)
        
        # Check if all required features are present
        missing_features = [f for f in feature_names if f not in df.columns]
        if missing_features:
            return jsonify({
                "error": f"Missing required features: {', '.join(missing_features)}",
                "required_features": feature_names,
                "provided_features": df.columns.tolist()
            }), 400
        
        # Prepare features (same preprocessing as training)
        # Apply one-hot encoding for categorical columns if needed
        X = df.copy()
        X = pd.get_dummies(X, drop_first=True)
        
        # Select only the features used during training
        try:
            X = X[feature_names]
        except KeyError as e:
            # If after encoding we still don't have the right columns
            return jsonify({
                "error": "Feature mismatch after encoding",
                "details": str(e),
                "required_features": feature_names,
                "available_features": X.columns.tolist(),
                "hint": "Make sure your data has the same structure as the training data"
            }), 400

        # Make predictions
        predictions = sklearn_model.predict(X)

        return jsonify({
            "model_id": model_id,
            "predictions": [float(pred) for pred in predictions],
            "n_predictions": len(predictions),
            "model_info": ml_model.to_dict()
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@model_bp.route("/api/model/list", methods=["GET"])
def list_models():
    """List all models from DATABASE (fast query with filters)"""
    try:
        # Optional filters
        model_type = request.args.get("model_type")
        status = request.args.get("status")
        user_id = request.args.get("user_id")
        
        # Build query
        query = MLModel.query
        
        if model_type:
            query = query.filter_by(model_type=model_type)
        if status:
            query = query.filter_by(status=status)
        if user_id:
            query = query.filter_by(user_id=user_id)
        
        # Order by newest first
        models = query.order_by(MLModel.created_at.desc()).all()
        
        return jsonify({
            "models": [model.to_dict() for model in models],
            "count": len(models)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@model_bp.route("/api/model/delete/<model_id>", methods=["DELETE"])
def delete_model(model_id):
    """Delete model from BOTH database and R2"""
    try:
        # Get model from database
        ml_model = MLModel.query.filter_by(model_id=model_id).first()
        
        if not ml_model:
            return jsonify({"error": "Model not found"}), 404
        
        # Delete from R2
        r2_storage = R2Storage()
        try:
            r2_storage.delete_model(ml_model.r2_path)
        except Exception as e:
            print(f"Warning: Failed to delete from R2: {e}")
        
        # Delete from database
        db.session.delete(ml_model)
        db.session.commit()

        return jsonify({
            "message": "Model deleted successfully",
            "model_id": model_id
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@model_bp.route("/api/model/info/<model_id>", methods=["GET"])
def get_model_info(model_id):
    """Get model info from DATABASE (instant)"""
    try:
        ml_model = MLModel.query.filter_by(model_id=model_id).first()
        
        if not ml_model:
            return jsonify({"error": "Model not found"}), 404
        
        return jsonify(ml_model.to_dict())

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@model_bp.route("/api/model/search", methods=["GET"])
def search_models():
    """Search models by name or type"""
    try:
        search_term = request.args.get("q", "")
        
        models = MLModel.query.filter(
            db.or_(
                MLModel.model_name.ilike(f"%{search_term}%"),
                MLModel.model_id.ilike(f"%{search_term}%"),
                MLModel.model_type.ilike(f"%{search_term}%")
            )
        ).order_by(MLModel.created_at.desc()).all()
        
        return jsonify({
            "models": [model.to_dict() for model in models],
            "count": len(models)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@model_bp.route("/api/model/stats", methods=["GET"])
def get_stats():
    """Get overall statistics from database"""
    try:
        total_models = MLModel.query.count()
        ready_models = MLModel.query.filter_by(status='ready').count()
        uploading_models = MLModel.query.filter_by(status='uploading').count()
        failed_models = MLModel.query.filter_by(status='failed').count()
        
        # Models by type
        from sqlalchemy import func
        models_by_type = db.session.query(
            MLModel.model_type,
            func.count(MLModel.id)
        ).group_by(MLModel.model_type).all()
        
        return jsonify({
            "total_models": total_models,
            "ready": ready_models,
            "uploading": uploading_models,
            "failed": failed_models,
            "by_type": {model_type: count for model_type, count in models_by_type}
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500