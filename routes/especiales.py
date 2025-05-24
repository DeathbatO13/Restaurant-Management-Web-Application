from flask import Blueprint, request, render_template

especiales_bp = Blueprint('especiales', __name__)

@especiales_bp.route('/especiales', methods=['POST'])
def especiales():
    platos_seleccionados = request.form.getlist('platos')
    return render_template('especiales.html', platos=platos_seleccionados)
