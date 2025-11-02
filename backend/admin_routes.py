from flask import Blueprint, request, jsonify
from models import (
    agregar_plato,
    obtener_platos_adicionales,
    eliminar_plato,
    obtener_todos_los_platos,
    actualizar_visibilidad_plato,
    actualizar_plato,
    get_connection
)
from datetime import datetime, date
import json

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/platos', methods=['GET'])
def listar():
    return jsonify(obtener_todos_los_platos())  

@admin_bp.route('/platos', methods=['POST'])
def agregar():
    data = request.json
    categoria = data.get('categoria', '')
    # Si hay subcategoria, usar esa como categoria
    if data.get('subcategoria'):
        categoria = data['subcategoria']
    agregar_plato(data['nombre'], data.get('descripcion', ''), data['precio'], categoria)
    return jsonify({"mensaje": "Plato agregado correctamente"})

@admin_bp.route('/platos/<int:plato_id>', methods=['DELETE'])
def eliminar(plato_id):
    eliminar_plato(plato_id)
    return jsonify({"mensaje": "Plato eliminado"})

@admin_bp.route('/platos/<int:plato_id>', methods=['PUT'])
def actualizar(plato_id):
    data = request.json
    actualizar_plato(plato_id, data['nombre'], data.get('descripcion', ''), data['precio'], data['categoria'])
    return jsonify({"mensaje": "Plato actualizado correctamente"})

@admin_bp.route('/platos/todos', methods=['GET'])
def listar_todos():
    return jsonify(obtener_todos_los_platos())

@admin_bp.route('/platos/<int:plato_id>/visibilidad', methods=['PATCH'])
def actualizar_visibilidad(plato_id):
    data = request.json
    visible = data.get('visible', True)
    actualizar_visibilidad_plato(plato_id, visible)
    return jsonify({"mensaje": "Visibilidad actualizada"})

# ✅ Nuevo endpoint para entregar el menú agrupado
@admin_bp.route('/menu', methods=['GET'])
def menu_agrupado():
    platos = obtener_platos_adicionales()

    agrupado = {
        "desayunos": [],
        "menu_del_dia": [],
        "platos_especiales": {
            "carnes_y_parrilla": [],
            "pollo": [],
            "cerdo": [],
            "pescados_y_mariscos": []
        },
        "bebidas": {
            "bebidas_naturales": [],
            "bebidas_comerciales": [],
            "bebidas_calientes": []
        }
    }

    for plato in platos:
        cat = plato["categoria"]
        if cat in agrupado:
            agrupado[cat].append(plato)
        elif cat in agrupado["platos_especiales"]:
            agrupado["platos_especiales"][cat].append(plato)
        elif cat in agrupado["bebidas"]:
            agrupado["bebidas"][cat].append(plato)

    return jsonify(agrupado)

@admin_bp.route('/ventas/hoy', methods=['GET'])
def ventas_hoy():
    conn = get_connection()
    c = conn.cursor()
    hoy = date.today()
    inicio = datetime.combine(hoy, datetime.min.time())
    fin = datetime.combine(hoy, datetime.max.time())
    c.execute(
        "SELECT total, platos FROM pedidos WHERE fecha >= ? AND fecha <= ?",
        (inicio.strftime('%Y-%m-%d %H:%M:%S'), fin.strftime('%Y-%m-%d %H:%M:%S'))
    )
    rows = c.fetchall()
    conn.close()

    total = 0
    platos_vendidos = {}

    for row in rows:
        total += row["total"] or 0
        try:
            platos = json.loads(row["platos"])
        except Exception:
            platos = []
        for plato in platos:
            cat = plato.get("categoria", "otros")
            nombre = plato.get("nombre", "Desconocido")
            if cat not in platos_vendidos:
                platos_vendidos[cat] = {}
            if nombre not in platos_vendidos[cat]:
                platos_vendidos[cat][nombre] = 0
            platos_vendidos[cat][nombre] += plato.get("quantity", 1)

    return jsonify({
        "total": total,
        "platos_vendidos": platos_vendidos
    })
