from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.ai import generate_question, generate_chat_response, generate_evaluation
from app import db
import datetime
from bson import ObjectId
import json

interview_bp = Blueprint('interview', __name__)

@interview_bp.route('/start', methods=['POST'])
@jwt_required()
def start_interview():
    user_id = get_jwt_identity()
    data = request.get_json()
    topic = data.get('topic', 'DSA')
    difficulty = data.get('difficulty', 'Medium')

    question_data = generate_question(topic, difficulty)
    
    new_session = {
        "user_id": ObjectId(user_id),
        "topic": topic,
        "difficulty": difficulty,
        "question": question_data,
        "startTime": datetime.datetime.utcnow(),
        "status": "in_progress",
        "chat_history": []
    }
    
    from app import db
    result = db.interviews.insert_one(new_session)
    
    return jsonify({
        "sessionId": str(result.inserted_id),
        "question": question_data
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
        
    chat_history_array = session.get('chat_history', [])
    
    # Generate bot response with context
    bot_response_str = generate_chat_response(message, session['topic'], chat_history_array)
    
    try:
        # Try returning JSON struct
        parsed_response = json.loads(bot_response_str)
    except:
        parsed_response = {"feedback": bot_response_str} # Fallback
    
    chat_entry = {"user": message, "bot": parsed_response, "timestamp": datetime.datetime.utcnow()}
    
    db.interviews.update_one(
        {"_id": ObjectId(session_id)},
        {"$push": {"chat_history": chat_entry}}
    )

    return jsonify({"response": parsed_response}), 200

@interview_bp.route('/evaluate/<session_id>', methods=['POST'])
@jwt_required()
def evaluate_interview(session_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    final_code = data.get('code', '')
    
    from app import db
    session = db.interviews.find_one({"_id": ObjectId(session_id), "user_id": ObjectId(user_id)})
    if not session:
        return jsonify({"error": "Interview session not found"}), 404
        
    chat_history_array = session.get('chat_history', [])
    evaluation = generate_evaluation(chat_history_array, final_code)
    
    db.interviews.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": {
            "status": "completed", 
            "evaluation": evaluation, 
            "final_code": final_code,
            "endTime": datetime.datetime.utcnow()
        }}
    )

    return jsonify({"evaluation": evaluation}), 200

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
