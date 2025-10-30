from flask import Blueprint, request, jsonify
import psycopg2
from werkzeug.security import generate_password_hash, check_password_hash
import jwt, datetime
from config import Config
from database import get_db_connection

# inilah blueprint yang akan di-import oleh app.py
auth_routes = Blueprint('auth_routes', __name__)

# REGISTER
@auth_routes.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not all([name, email, password]):
        return jsonify({'message': 'Semua field wajib diisi!'}), 400

    hashed_pw = generate_password_hash(password)

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE email = %s", (email,))
    existing_user = cur.fetchone()
    if existing_user:
        cur.close()
        conn.close()
        return jsonify({'message': 'Email sudah digunakan!'}), 400

    cur.execute(
        "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
        (name, email, hashed_pw)
    )
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({'message': 'Registrasi berhasil!'}), 201


# LOGIN
@auth_routes.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({'message': 'Email dan password wajib diisi!'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if not user or not check_password_hash(user[3], password):  # kolom password
        return jsonify({'message': 'Email atau password salah!'}), 401

    token = jwt.encode(
        {
            'user_id': user[0],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        },
        Config.SECRET_KEY,
        algorithm='HS256'
    )

    return jsonify({'token': token, 'message': 'Login berhasil!'}), 200
