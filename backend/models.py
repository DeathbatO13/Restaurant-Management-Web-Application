import sqlite3
from datetime import datetime
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    c = conn.cursor()

    c.execute('''
    CREATE TABLE IF NOT EXISTS pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        tipo TEXT,
        mesa TEXT,
        direccion TEXT,
        telefono TEXT,
        platos TEXT,
        postre INTEGER,
        total REAL,
        fecha TEXT
    )''')

    c.execute('''
    CREATE TABLE IF NOT EXISTS platos_adicionales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        descripcion TEXT,
        precio REAL,
        categoria TEXT,
        visible INTEGER DEFAULT 1
    )''')

    conn.commit()
    conn.close()

def guardar_pedido(data):
    conn = get_connection()
    c = conn.cursor()

    c.execute('''
        INSERT INTO pedidos (nombre, tipo, mesa, direccion, telefono, platos, postre, total, fecha)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data.get('nombre'),
        data.get('tipo'),
        data.get('mesa'),  # <-- Paréntesis cerrado aquí
        data.get('direccion'),
        data.get('telefono'),
        json.dumps(data.get('platos', [])),  # <-- GUARDAR COMO JSON
        int(data.get('postre', 0)),
        data.get('total'),
        datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    ))

    conn.commit()
    pedido_id = c.lastrowid
    conn.close()

    return {
        "id": pedido_id,
        **data,
        "fecha": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }

def agregar_plato(nombre, descripcion, precio, categoria):
    conn = get_connection()
    c = conn.cursor()
    c.execute('INSERT INTO platos_adicionales (nombre, descripcion, precio, categoria) VALUES (?, ?, ?, ?)', (nombre, descripcion, precio, categoria))
    conn.commit()
    conn.close()

def obtener_platos_adicionales():
    conn = get_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM platos_adicionales WHERE visible = 1')
    platos = [dict(row) for row in c.fetchall()]
    conn.close()
    return platos

def eliminar_plato(plato_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute('DELETE FROM platos_adicionales WHERE id = ?', (plato_id,))
    conn.commit()
    conn.close()

def obtener_todos_los_platos():
    conn = get_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM platos_adicionales')
    platos = [dict(row) for row in c.fetchall()]
    conn.close()
    return platos

def actualizar_visibilidad_plato(plato_id, visible):
    conn = get_connection()
    c = conn.cursor()
    c.execute('UPDATE platos_adicionales SET visible = ? WHERE id = ?', (int(visible), plato_id))
    conn.commit()
    conn.close()

def actualizar_plato(plato_id, nombre, descripcion, precio, categoria):
    conn = get_connection()
    c = conn.cursor()
    c.execute('UPDATE platos_adicionales SET nombre = ?, descripcion = ?, precio = ?, categoria = ? WHERE id = ?', 
              (nombre, descripcion, precio, categoria, plato_id))
    conn.commit()
    conn.close()
