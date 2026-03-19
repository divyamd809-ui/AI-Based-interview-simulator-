from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import bcrypt
import datetime
# Import db lazily via current_app or directly from app
from app import db
from bson import ObjectId

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    # from app import db
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not email or not password or not name:
        return jsonify({"error": "Missing required fields"}), 400

    from app import db # import here to ensure db is initialized
    if db.users.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400

    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    new_user = {
        "name": name,
        "email": email,
        "password": hashed_pw.decode('utf-8'),
        "created_at": datetime.datetime.utcnow()
    }
    
    db.users.insert_one(new_user)
    return jsonify({"message": "User registered successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    from app import db
    user = db.users.find_one({"email": email})
    
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity=str(user['_id']), expires_delta=datetime.timedelta(days=1))
    
    return jsonify({
        "token": access_token,
        "user": {
            "id": str(user['_id']),
            "name": user['name'],
            "email": user['email']
        }
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_user():
    user_id = get_jwt_identity()
    from app import db
    user = db.users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    user['_id'] = str(user['_id'])
    return jsonify({"user": user}), 200
