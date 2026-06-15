import firebase_admin
from firebase_admin import credentials, firestore
from app.config import settings

def init_firebase():
    if not firebase_admin._apps:
        if settings.firebase_credentials_path:
            cred = credentials.Certificate(settings.firebase_credentials_path)
            firebase_admin.initialize_app(cred)
        else:
            # Fallback to default application credentials if running in GCP
            firebase_admin.initialize_app()

init_firebase()
db = firestore.client()
