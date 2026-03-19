import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/smart_interview')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-dev')
    
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
    JUDGE0_API_KEY = os.environ.get('JUDGE0_API_KEY', '')
    JUDGE0_API_HOST = os.environ.get('JUDGE0_API_HOST', 'judge0-ce.p.rapidapi.com')
