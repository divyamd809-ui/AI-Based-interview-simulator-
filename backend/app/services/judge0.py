# Stub for Judge0 API execution
def execute_code_stub(code, language_id):
    """
    Mocks a response from the Judge0 Code Execution API.
    """
    # Just a simple stub that evaluates python if it's very simple, otherwise just echoes it.
    # We will just return a simulated successful pass for demonstration.
    
    is_error = "SyntaxError" in code or "Exception" in code
    
    if is_error:
        return {
            "status": {"description": "Compilation Error"},
            "stdout": None,
            "stderr": "SyntaxError: invalid syntax",
            "time": "0.012",
            "memory": 2048
        }
    
    return {
        "status": {"description": "Accepted"},
        "stdout": "Code executed successfully. Output stubbed.",
        "stderr": None,
        "time": "0.024",
        "memory": 4096
    }
