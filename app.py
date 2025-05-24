from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')  # Presentación y pregunta de ubicación

@app.route('/menu', methods=['GET', 'POST'])
def menu():
    if request.method == 'POST':
        # Aquí puedes capturar qué platos seleccionó el usuario
        return redirect(url_for('especiales'))
    return render_template('menu.html')

@app.route('/especiales', methods=['GET', 'POST'])
def especiales():
    if request.method == 'POST':
        # Guardar elección de platos especiales
        return redirect(url_for('confirmacion'))
    return render_template('especiales.html')

@app.route('/confirmacion', methods=['GET', 'POST'])
def confirmacion():
    if request.method == 'POST':
        ubicacion = request.form.get('ubicacion')
        if ubicacion == 'domicilio':
            return redirect(url_for('domicilio'))
        return redirect(url_for('index'))  # O finalizar el pedido
    return render_template('confirmacion.html')

@app.route('/domicilio', methods=['GET', 'POST'])
def domicilio():
    if request.method == 'POST':
        # Guardar datos de domicilio
        return redirect(url_for('confirmacion'))
    return render_template('domicilio_form.html')

@app.route('/admin')
def admin():
    return render_template('admin.html')  # Panel del administrador

if __name__ == '__main__':
    app.run(debug=True)
