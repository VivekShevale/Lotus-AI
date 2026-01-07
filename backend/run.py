from app import create_app
from app.database.sql_db import db
from app.models.user import User

app = create_app()

# Optional: create tables automatically
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)