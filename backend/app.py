from flask import Flask
from flask_cors import CORS
from routes.auth_routes import auth_routes
from routes.item_routes import item_routes

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_routes, url_prefix="/api/auth")
app.register_blueprint(item_routes, url_prefix="/api")

@app.route('/')
def home():
    return {"message": "Lost & Found API is running 🚀"}

if __name__ == '__main__':
    app.run(debug=True)
