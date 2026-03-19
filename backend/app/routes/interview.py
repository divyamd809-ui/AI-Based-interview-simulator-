from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.ai import generate_question, generate_chat_response
from app import db
import datetime
from bson import ObjectId

interview_bp = Blueprint('interview', __name__)

@interview_bp.route('/start', methods=['POST'])
@jwt_required()
def start_interview():
    user_id = get_jwt_identity()
    data = request.get_json()
    topic = data.get('topic', 'DSA')
    difficulty = data.get('difficulty', 'Medium')

    question = generate_question(topic, difficulty)
    
    new_session = {
        "user_id": ObjectId(user_id),
        "topic": topic,
        "difficulty": difficulty,
        "question": question,
        "startTime": datetime.datetime.utcnow(),
        "status": "in_progress",
        "chat_history": []
    }
    
    from app import db
    result = db.interviews.insert_one(new_session)
    
    return jsonify({
        "sessionId": str(result.inserted_id),
        "question": question
    }), 201

@interview_bp.route('/chat/<session_id>', methods=['POST'])
@jwt_required()
def chat_interaction(session_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    message = data.get('message')
    
    if not message:
        return jsonify({"error": "Message is required"}), 400

    from app import db
    session = db.interviews.find_one({"_id": ObjectId(session_id), "user_id": ObjectId(user_id)})
    if not session:
        return jsonify({"error": "Interview session not found"}), 404
        
    # Generate bot response
    bot_response = generate_chat_response(message, session['topic'])
    
    chat_entry = {"user": message, "bot": bot_response, "timestamp": datetime.datetime.utcnow()}
    
    db.interviews.update_one(
        {"_id": ObjectId(session_id)},
        {"$push": {"chat_history": chat_entry}}
    )

    return jsonify({"response": bot_response}), 200

@interview_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()
    
    from app import db
    sessions = list(db.interviews.find({"user_id": ObjectId(user_id)}).sort("startTime", -1))
    
    for session in sessions:
        session['_id'] = str(session['_id'])
        session['user_id'] = str(session['user_id'])
        
    return jsonify({"history": sessions}), 200
