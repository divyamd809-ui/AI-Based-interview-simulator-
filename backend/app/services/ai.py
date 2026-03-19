from openai import OpenAI
from config import Config
import json

# Setup client (will be empty string if not in env but handles gracefully internally until called)
client = OpenAI(api_key=Config.OPENAI_API_KEY)

def generate_question(topic, difficulty):
    """
    Generates a coding question using OpenAI, enforcing JSON output.
    """
    if not Config.OPENAI_API_KEY:
        # Fallback to stub if no key provided
        return {"title": f"Mock Question: {topic} ({difficulty})", "description": "Please provide an API key in the backend/.env file to generate real questions."}
        
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            response_format={ "type": "json_object" },
            messages=[
                {"role": "system", "content": "You are a technical interviewer. Provide a coding question on the given topic and difficulty. Output strictly as JSON with 'title' and 'description' properties."},
                {"role": "user", "content": f"Topic: {topic}, Difficulty: {difficulty}"}
            ]
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"OpenAI Error: {e}")
        return {"title": "Error generating question", "description": str(e)}

def generate_chat_response(message, topic, chat_history_array=None):
    """
    Generates an AI interviewer's chat response with context.
    Returns structured JSON with question, hint, feedback.
    """
    if not Config.OPENAI_API_KEY:
        return json.dumps({
            "feedback": "This is a mock response.",
            "hint": "Please add an OPENAI_API_KEY.",
            "question": "Are you able to configure the environment?"
        })

    messages = [
        {"role": "system", "content": f"You are an expert technical interviewer assessing a candidate on {topic}. "
                                      f"Provide your response strictly in JSON format with three fields: "
                                      f"'feedback' (your thoughts on the candidate's message), "
                                      f"'hint' (if the candidate is stuck, else empty string), "
                                      f"and 'question' (your next follow-up question, or empty if closing)."
        }
    ]
    
    # Append past context
    if chat_history_array:
        for entry in chat_history_array:
            messages.append({"role": "user", "content": entry.get('user', '')})
            
            # Since bot response was stringified JSON, parse it or just append it raw
            bot_text = entry.get('bot', '')
            if isinstance(bot_text, dict):
                 bot_text = json.dumps(bot_text)
            messages.append({"role": "assistant", "content": bot_text})
            
    # Append new user message
    messages.append({"role": "user", "content": message})
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            response_format={ "type": "json_object" },
            messages=messages
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI Error: {e}")
        return json.dumps({
            "feedback": "Sorry, I had an error processing that.",
            "hint": "",
            "question": ""
        })

def generate_evaluation(chat_history_array, final_code):
    """
    Analyzes the entire session to provide a comprehensive evaluation.
    Returns: score, communication, logic, and suggestions.
    """
    if not Config.OPENAI_API_KEY:
        return {
            "score": "85/100",
            "communication": "Good explanation of concepts but lacked confidence. (MOCK)",
            "logic": "The code logic was solid but misses some edge cases. (MOCK)",
            "suggestions": ["Add real OPENAI_API_KEY to test properly", "Practice more edge cases", "Perform complexity analysis unprompted"]
        }
    
    system_prompt = (
        "You are an expert technical interviewer evaluating a candidate's performance. "
        "Review the exact chat sequence between the candidate 'User' and the interviewer 'Interviewer', "
        "along with the 'Final Submitted Code'.\n"
        "Output your evaluation STRICTLY in JSON format with exactly 4 keys:\n"
        "1) 'score' (string, e.g. '85/100' or 'Fail')\n"
        "2) 'communication' (string, analyze how well they explained their thoughts)\n"
        "3) 'logic' (string, analyze their coding approach, time complexity, and correctness)\n"
        "4) 'suggestions' (array of strings, actionable improvement areas)"
    )
    
    user_content = "Chat History:\n"
    if chat_history_array:
        for entry in chat_history_array:
            bot_val = entry.get('bot', '')
            if isinstance(bot_val, dict):
                 bot_val = json.dumps(bot_val)
            user_content += f"Candidate: {entry.get('user', '')}\nInterviewer: {bot_val}\n\n"
            
    user_content += f"Final Submitted Code:\n{final_code}"
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            response_format={ "type": "json_object" },
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ]
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"OpenAI Evaluation Error: {e}")
        return {
            "score": "N/A",
            "communication": "Error evaluating communication.",
            "logic": "Error evaluating logic.",
            "suggestions": ["System error occurred during evaluation.", str(e)]
        }
