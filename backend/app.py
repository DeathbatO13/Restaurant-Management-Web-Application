from flask import Flask, jsonify
import sqlite3
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def get_db_connection():
    conn = sqlite3.connect('menu.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/menu', methods=['GET'])
def menu_dia():
    dia_semana = datetime.today().strftime('%A')  # 'Monday', 'Tuesday', etc.
    dias_map = {
        'Monday': 'Lunes',
        'Tuesday': 'Martes',
        'Wednesday': 'Miércoles',
        'Thursday': 'Jueves',
        'Friday': 'Viernes'
    }
    dia_es = dias_map.get(dia_semana, 'Lunes')
    
    conn = get_db_connection()
    menu = conn.execute('SELECT platos FROM menu WHERE dia = ?', (dia_es,)).fetchone()
    conn.close()

    if menu:
        import json
        return jsonify({"dia": dia_es, "menu": json.loads(menu['platos'])})
    else:
        return jsonify({"dia": dia_es, "menu": []})

if __name__ == '__main__':
    app.run()