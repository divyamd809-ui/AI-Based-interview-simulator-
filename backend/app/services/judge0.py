import requests
from config import Config
import time

def execute_code_stub(code, language_id):
    """
    Executes code against Judge0 Community API or custom host.
    """
    if not Config.JUDGE0_API_KEY:
        # Fallback to stub
        return {
            "status": {"description": "Accepted (MOCK/STUB NO API KEY PROVIDED)"},
            "stdout": "Please provide your JUDGE0_API_KEY to see real compilation and test execution.\n\n" + str(code),
            "stderr": None,
            "time": "0.012",
            "memory": 2048
        }

    url = f"https://{Config.JUDGE0_API_HOST}/submissions"
    
    # We use await wait=true if possible, or poll. Judge0 standard CE accepts wait=true.
    querystring = {"base64_encoded":"false", "wait":"true", "fields":"stdout,stderr,status_id,language_id,compile_output,message,time,memory,status"}
    
    payload = {
        "source_code": code,
        "language_id": language_id
    }
    
    headers = {
        "content-type": "application/json",
        "X-RapidAPI-Key": Config.JUDGE0_API_KEY,
        "X-RapidAPI-Host": Config.JUDGE0_API_HOST
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, params=querystring)
        if response.status_code in [200, 201]:
            result = response.json()
            # if compiled output or runtime error
            stderr_out = result.get("stderr") or result.get("compile_output") or result.get("message")
            return {
                "status": result.get("status", {"description": "Unknown"}),
                "stdout": result.get("stdout"),
                "stderr": stderr_out,
                "time": result.get("time"),
                "memory": result.get("memory")
            }
        else:
             return {
                "status": {"description": f"API Error {response.status_code}"},
                "stdout": None,
                "stderr": response.text,
                "time": None,
                "memory": None
            }
    except Exception as e:
        return {
             "status": {"description": "Internal Server Error"},
             "stdout": None,
             "stderr": str(e),
             "time": None,
             "memory": None
         }
