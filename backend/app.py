from flask import Flask, jsonify, request
from flask_cors import CORS
from models import obtener_menu
from database import init_db
from datetime import datetime

app = Flask(__name__)
CORS(app)

init_db()

@app.route('/api/menu', methods=['GET'])
def menu_dia():
    dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    dia_actual = dias[datetime.today().weekday()]
    platos = obtener_menu(dia_actual)
    return jsonify({"dia": dia_actual, "platos": platos})

@app.route('/api/especiales', methods=['POST'])
def guardar_especiales():
    data = request.get_json()
    seleccionados = data.get('platos', [])
    print("Platos seleccionados:", seleccionados)
    return jsonify({"message": "Especiales recibidos", "platos": seleccionados})

if __name__ == '__main__':
    app.run(debug=True)
