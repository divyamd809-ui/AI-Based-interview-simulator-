from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient

# Define jwt and db proxies so they can be imported
jwt = JWTManager()
db = None

def create_app():
    global db
    app = Flask(__name__)
    from config import Config
    app.config.from_object(Config)

    CORS(app)
    jwt.init_app(app)

    # Initialize MongoDB
    client = MongoClient(app.config['MONGO_URI'])
    db = client.get_database() # Uses the database specified in MONGO_URI

    # Register blueprints (imports must be inside to avoid circular deps)
    from app.routes.auth import auth_bp
    from app.routes.interview import interview_bp
    from app.routes.code import code_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(interview_bp, url_prefix='/api/interview')
    app.register_blueprint(code_bp, url_prefix='/api/code')

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "healthy"}), 200

    return app
