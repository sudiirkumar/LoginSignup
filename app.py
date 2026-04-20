from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB Configuration
mongo_uri = os.getenv("MONGO_URI")
if not mongo_uri:
    raise ValueError("MONGO_URI is not set. Add it to your .env file.")

app.config["MONGO_URI"] = mongo_uri
mongo = PyMongo(app)

@app.route('/home')
def home():
    return "Welcome to the Authentication Panel API (MongoDB)!"

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username_or_email = data.get('username_or_email')
    password = data.get('password')

    if not username_or_email or not password:
        return jsonify({'message': 'Email/Username and password are required!'}), 400

    users = mongo.db.users
    # Check against both email and username
    user = users.find_one({
        "$or": [{"email": username_or_email}, {"username": username_or_email}],
        "password": password
    })

    if user:
        return jsonify({'message': 'Login successful!', 'name': user.get('name')}), 200
    
    return jsonify({'message': 'Invalid credentials!'}), 401

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    required_fields = ['email', 'password', 'name', 'username', 'security_question', 'security_answer']
    if not all(k in data for k in required_fields):
        return jsonify({'message': 'All fields are required!'}), 400
        
    users = mongo.db.users

    # Check if user already exists
    if users.find_one({"$or": [{"email": data['email']}, {"username": data['username']}]}):
        return jsonify({'message': 'User already exists!'}), 409

    try:
        users.insert_one({
            "email": data['email'],
            "password": data['password'], # Note: You should hash passwords in a real app!
            "name": data['name'],
            "username": data['username'],
            "security_question": data['security_question'],
            "security_answer": data['security_answer']
        })
        return jsonify({'message': 'User registered successfully!'}), 201
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/validate', methods=['POST'])
def validate():
    data = request.get_json()
    username_or_email = data.get('username_or_email')
    security_question = data.get('security_question')
    security_answer = data.get('security_answer')
    
    if not username_or_email or not security_question or not security_answer:
        return jsonify({'message': 'All fields are required!'}), 400

    users = mongo.db.users
    user = users.find_one({
        "$or": [{"email": username_or_email}, {"username": username_or_email}],
        "security_question": security_question,
        "security_answer": security_answer
    })
    
    if user:
        return jsonify({'message': 'Account found', 'username': user.get('username')}), 200
        
    return jsonify({'message': 'Invalid credentials!'}), 401

@app.route('/reset', methods=['POST'])
def reset():
    data = request.get_json()
    password = data.get('password')
    username = data.get('username')
    
    if not password or not username:
        return jsonify({'message': 'All fields are required!'}), 400
        
    users = mongo.db.users
    result = users.update_one(
        {"username": username},
        {"$set": {"password": password}}
    )
    
    if result.modified_count > 0:
        return jsonify({'message': 'Password reset successfully!'}), 200
    
    return jsonify({'message': 'User not found or password unchanged.'}), 404

if __name__ == '__main__':
    app.run(debug=True)
