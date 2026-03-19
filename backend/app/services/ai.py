import random

def generate_question(topic, difficulty):
    """
    Generates a coding question using AI or mock library.
    """
    questions = {
        "DSA": {
            "Easy": [
                {"title": "Two Sum", "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."},
                {"title": "Reverse String", "description": "Write a function that reverses a string."}
            ],
            "Medium": [
                {"title": "Longest Substring Without Repeating Characters", "description": "Given a string s, find the length of the longest substring without repeating characters."}
            ]
        },
        "DBMS": {
            "Easy": [
                {"title": "Find Nth Highest Salary", "description": "Write a SQL query to get the nth highest salary from the Employee table."}
            ]
        }
    }
    
    # Fallback default
    fallback = {"title": "General Question", "description": "Write a function to solve this problem."}
    
    topic_questions = questions.get(topic, {}).get(difficulty)
    if topic_questions:
        return random.choice(topic_questions)
    
    return fallback

def generate_chat_response(message, topic):
    """
    Mocks an AI interviewer's chat response.
    """
    responses = [
        "That's an interesting approach. Call you elaborate on the time complexity?",
        "Have you considered any edge cases here?",
        "Good start, let's keep going and write down the code for this.",
        "Can you think of a more optimal solution?"
    ]
    return random.choice(responses)
