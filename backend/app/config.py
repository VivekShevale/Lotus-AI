# app/config.py
import os
from dotenv import load_dotenv

# Load environment variables when this module is imported
load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300
    }
    import tempfile

    # existing configs
    UPLOAD_FOLDER = tempfile.gettempdir()
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB