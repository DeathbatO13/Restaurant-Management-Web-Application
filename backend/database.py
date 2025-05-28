import sqlite3

def init_db():
    conn = sqlite3.connect('menu.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS menu (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dia TEXT NOT NULL,
            plato TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()
