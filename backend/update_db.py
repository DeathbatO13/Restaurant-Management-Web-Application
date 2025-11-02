import sqlite3
from models import get_connection

def update_database():
    conn = get_connection()
    c = conn.cursor()
    
    try:
        # Verificar si la columna descripcion existe
        c.execute("PRAGMA table_info(platos_adicionales)")
        columns = [column[1] for column in c.fetchall()]
        
        if 'descripcion' not in columns:
            print("Agregando columna 'descripcion' a la tabla platos_adicionales...")
            c.execute("ALTER TABLE platos_adicionales ADD COLUMN descripcion TEXT")
            conn.commit()
            print("✅ Columna 'descripcion' agregada exitosamente.")
        else:
            print("✅ La columna 'descripcion' ya existe en la tabla.")
            
    except Exception as e:
        print(f"❌ Error al actualizar la base de datos: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    update_database() 