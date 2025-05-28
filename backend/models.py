import sqlite3
import json

def obtener_menu(dia):
    conn = sqlite3.connect('menu.db')
    cursor = conn.cursor()
    cursor.execute('SELECT platos FROM menu WHERE dia = ?', (dia,))
    resultado = cursor.fetchone()
    conn.close()
    if resultado:
        return json.loads(resultado[0])
    return []
