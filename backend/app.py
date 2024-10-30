from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS  # Import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# MySQL Configuration
app.config['MYSQL_HOST'] = 'localhost'  # Update with your MySQL host
app.config['MYSQL_USER'] = 'root'  # Your MySQL username
app.config['MYSQL_PASSWORD'] = '&udhir2Kum#r'  # Your MySQL password
app.config['MYSQL_DB'] = 'authpanel'  # Your database name

mysql = MySQL(app)

@app.route('/login', methods=['POST'])
def login():
    username_or_email = request.json.get('username_or_email')
    password = request.json.get('password')
    if not username_or_email or not password:  # Check for missing credentials
        return jsonify({'message': 'Email/Username and password are required!'}), 400

    cur = mysql.connection.cursor()
    cur.execute("SELECT name FROM users WHERE (email=%s OR username=%s) AND password=%s", (username_or_email, username_or_email, password))
    user = cur.fetchone()
    cur.close()
    if user:
        a = jsonify({'message': 'Login successful!', 'name': user})
        return a, 200
    else:
        return jsonify({'message': 'Invalid credentials!'}), 401

@app.route('/register', methods=['POST'])
def register():
    email = request.json.get('email')
    password = request.json.get('password')
    name = request.json.get('name')
    username = request.json.get('username')
    security_question = request.json.get('security_question')
    security_answer = request.json.get('security_answer')
        
    if not email or not password or not name or not username or not security_question or not security_answer:
        return jsonify({'message': 'All fields are required!'}), 400
    try:
        cur = mysql.connection.cursor()
        cur.execute("INSERT INTO users(email,password,name,username,security_question,security_answer) VALUES(%s,%s,%s,%s,%s,%s)", (email, password, name, username, security_question, security_answer))
        print("User registered successfully!")
        mysql.connection.commit()
        return jsonify({'message': 'User registered successfully!'}), 201
    except Exception as e:
        mysql.connection.rollback()
        print(e)
        return jsonify({f'message': 'Error: User could not be registered.'}), 500
    finally:
        cur.close()

@app.route('/validate', methods=['POST'])
def validate():
    username_or_email = request.json.get('username_or_email')
    security_question = request.json.get('security_question')
    security_answer = request.json.get('security_answer')
    
    if not username_or_email or not security_question or not security_answer:
        return jsonify({'message':'All fields are required!'}), 400
    cur = mysql.connection.cursor()
    cur.execute("SELECT username FROM users WHERE (email = %s OR username = %s) AND security_question = %s AND security_answer = %s",(username_or_email, username_or_email, security_question, security_answer))
    user = cur.fetchone()
    cur.close()
    if user:
        return jsonify({'message':'Account found','username':user}), 200
    else:
        return jsonify({'message': 'Invalid credentials!'}), 401
    
@app.route('/reset', methods=['POST'])
def reset():
    password = request.json.get('password')
    username = request.json.get('username')
    if not password:
        return jsonify({'message':'All fields are required!'}), 400
    cur = mysql.connection.cursor()
    cur.execute("UPDATE users SET password = %s WHERE username = %s",(password, username))
    mysql.connection.commit()
    cur.close()
    return jsonify({'message':'Password reset successfully!'}), 200
if __name__ == '__main__':
    app.run(debug=True)