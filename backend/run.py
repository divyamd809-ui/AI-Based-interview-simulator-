from app import create_app   # or import your app correctly

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)