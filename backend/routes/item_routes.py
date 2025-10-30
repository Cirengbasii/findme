from flask import Blueprint, request, jsonify
from database import get_db_connection

item_routes = Blueprint('item_routes', __name__)

# GET semua item
@item_routes.route('/', methods=['GET'])
def get_items():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM items")
    rows = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]
    items = [dict(zip(columns, row)) for row in rows]
    cursor.close()
    conn.close()
    return jsonify(items)

# POST item baru
@item_routes.route('/', methods=['POST'])
def add_item():
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    location = data.get('location')
    user_id = data.get('user_id')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO items (title, description, status, location, user_id)
        VALUES (%s, %s, %s, %s, %s)
    """, (title, description, 'lost', location, user_id))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Item added successfully"}), 201
