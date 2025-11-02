from flask import Blueprint, request, jsonify
from models import guardar_pedido
from print_utils import imprimir_ticket

pedidos_bp = Blueprint('pedidos', __name__)

@pedidos_bp.route('/', methods=['POST'])
def crear_pedido():
    data = request.json
    pedido = guardar_pedido(data)
    try:
        imprimir_ticket(pedido)
        return jsonify({"mensaje": "Pedido guardado e impreso", "pedido": pedido})
    except Exception as e:
        return jsonify({"mensaje": "Pedido guardado, pero error al imprimir", "error": str(e), "pedido": pedido}), 500
