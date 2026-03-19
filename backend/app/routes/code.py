from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.judge0 import execute_code_stub
from app import db
from bson import ObjectId

code_bp = Blueprint('code', __name__)

@code_bp.route('/execute', methods=['POST'])
@jwt_required()
def execute_code():
    data = request.get_json()
    code = data.get('source_code')
    language_id = data.get('language_id', 71) # 71 for Python by default
    session_id = data.get('session_id')
    
    if not code:
        return jsonify({"error": "Source code is required"}), 400
        
    # Call judge0 API stub to execute code
    result = execute_code_stub(code, language_id)
    
    # Optional: save code snippet to session if provided
    if session_id:
        user_id = get_jwt_identity()
        from app import db
        db.interviews.update_one(
            {"_id": ObjectId(session_id), "user_id": ObjectId(user_id)},
            {"$set": {"last_code": code, "last_result": result}}
        )
        
    return jsonify(result), 200
