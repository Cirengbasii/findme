from flask import Blueprint, request, jsonify
from database import get_db_connection

item_routes = Blueprint('item_routes', __name__)

@item_routes.route('/items', methods=['GET'])
def get_items():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM items")
    items = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(items)

@item_routes.route('/items', methods=['POST'])
def add_item():
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    status = data.get('status')
    location = data.get('location')
    user_id = data.get('user_id')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO items (title, description, status, location, user_id)
        VALUES (%s, %s, %s, %s, %s)
    """, (title, description, status, location, user_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Item added successfully"}), 201
