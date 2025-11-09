import psycopg2
from config import Config

def get_db_connection():
    conn = psycopg2.connect(
        host=Config.PG_HOST,
        port=Config.PG_PORT,
        database=Config.PG_DB,      
        user=Config.PG_USER,
        password=Config.PG_PASSWORD
    )
    return conn



def init_db():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password VARCHAR(200) NOT NULL
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        location VARCHAR(100),
        date_lost DATE,
        image_url TEXT,
        user_id INTEGER REFERENCES users(id)
    );
    """)

    conn.commit()
    cur.close()
    conn.close()
    print("✅ Database dan semua tabel berhasil dibuat!")


if __name__ == "__main__":
    init_db()
