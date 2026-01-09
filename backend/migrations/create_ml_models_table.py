from app import create_app
from app.database.sql_db import db

def create_tables():
    app = create_app()
    
    with app.app_context():
        # Import models to register them
        from app.models.ml_model import MLModel
        from app.models.user import User
        
        # Create all tables
        db.create_all()
        
        print("✓ Database tables created successfully!")
        print("  - users")
        print("  - ml_models")

if __name__ == "__main__":
    create_tables()