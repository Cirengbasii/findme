from flask import Blueprint, request, jsonify
from database import get_db_connection
from flask_cors import cross_origin

item_routes = Blueprint('item_routes', __name__)

# ✅ Route untuk menambahkan barang hilang
@item_routes.route('', methods=['POST', 'OPTIONS'])
@cross_origin(origin='*', methods=['POST', 'OPTIONS'], supports_credentials=True)
def add_item():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    print("📦 Data diterima (LOST):", data)

    title = data.get('title')
    description = data.get('description')
    location = data.get('location')
    user_id = data.get('user_id')

    if not title or not description or not location:
        return jsonify({"message": "Missing required fields"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO items (title, description, status, location, user_id)
            VALUES (%s, %s, %s, %s, %s)
        """, (title, description, 'lost', location, user_id))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "✅ Barang hilang berhasil disimpan"}), 201

    except Exception as e:
        print("❌ Error simpan data lost:", e)
        return jsonify({"message": "Terjadi kesalahan di server"}), 500


# ✅ Route untuk laporan barang ditemukan
@item_routes.route('/found', methods=['POST', 'OPTIONS'])
@cross_origin(origin='*', methods=['POST', 'OPTIONS'], supports_credentials=True)
def report_found():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    print("📦 Data laporan ditemukan:", data)

    title = data.get('title')
    description = data.get('description')
    location = data.get('location')
    user_id = data.get('user_id')

    if not title or not description or not location:
        return jsonify({"message": "Missing required fields"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO items (title, description, status, location, user_id)
            VALUES (%s, %s, %s, %s, %s)
        """, (title, description, 'found', location, user_id))
        conn.commit()
        cursor.close()
        conn.close()

        print("✅ Barang ditemukan berhasil disimpan")
        return jsonify({"message": "✅ Barang ditemukan berhasil disimpan"}), 200

    except Exception as e:
        print("❌ Error simpan data found:", e)
        return jsonify({"message": "Terjadi kesalahan di server"}), 500
