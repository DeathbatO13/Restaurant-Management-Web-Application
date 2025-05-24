from flask import Blueprint, render_template
import json
from datetime import datetime

menu_bp = Blueprint('menu', __name__)

@menu_bp.route('/menu')
def menu():
    with open('menu.json', 'r', encoding='utf-8') as f:
        datos = json.load(f)

    dia_actual = datetime.now().strftime('%A').lower()

    menu_dia = datos.get(dia_actual, [])

    return render_template('menu.html', dia=dia_actual.capitalize(), menu_dia=menu_dia)
