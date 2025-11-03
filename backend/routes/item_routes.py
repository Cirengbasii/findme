from flask import Blueprint, request, jsonify
from database import get_db_connection
from flask_cors import cross_origin

item_routes = Blueprint('item_routes', __name__)

@item_routes.route('', methods=['POST', 'OPTIONS'])
@cross_origin(origin='*', methods=['POST', 'OPTIONS'], supports_credentials=True)
def add_item():
    # ✅ handle preflight request agar tidak error CORS
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    print("📦 Data diterima:", data)

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
