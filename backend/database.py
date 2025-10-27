import psycopg2
from config import Config

def get_db_connection():
    conn = psycopg2.connect(
        host=Config.PG_HOST,
        port=Config.PG_PORT,
        user=Config.PG_USER,
        password=Config.PG_PASSWORD,
        dbname=Config.PG_DB
    )
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Tabel pengguna
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(100) NOT NULL
        )
    """)

    # Tabel barang hilang
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS lost_items (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            item_name VARCHAR(100) NOT NULL,
            description TEXT,
            location VARCHAR(100),
            date_lost DATE,
            status VARCHAR(20) DEFAULT 'lost',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Tabel barang ditemukan
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS found_items (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            item_name VARCHAR(100) NOT NULL,
            description TEXT,
            location VARCHAR(100),
            date_found DATE,
            status VARCHAR(20) DEFAULT 'found',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    cursor.close()
    conn.close()
    print("✅ Database dan semua tabel berhasil dibuat!")

if __name__ == "__main__":
    init_db()
