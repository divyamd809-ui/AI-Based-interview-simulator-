from flask import Flask

def create_app():
    app = Flask(__name__)

    from app.routes.interview import interview_bp
    app.register_blueprint(interview_bp)

    return app