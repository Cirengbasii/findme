from flask import Flask
from flask_cors import CORS
from routes.auth_routes import auth_routes
from routes.item_routes import item_routes

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)


# ✅ daftar blueprint dengan prefix yang pas
app.register_blueprint(auth_routes, url_prefix="/api/auth")
app.register_blueprint(item_routes, url_prefix="/api/items")

# ✅ cek daftar route aktif
print("✅ Blueprints terdaftar:")
for rule in app.url_map.iter_rules():
    print(rule)
# Tes koneksi database saat server dijalankan
from database import get_db_connection
try:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT current_database();")
    print("✅ Flask terhubung ke database:", cur.fetchone()[0])
    cur.close()
    conn.close()
except Exception as e:
    print("❌ Gagal connect ke database:", e)

@app.route('/')
def home():
    return {"message": "Lost & Found API is running 🚀"}



if __name__ == '__main__':
    app.run(debug=True)
