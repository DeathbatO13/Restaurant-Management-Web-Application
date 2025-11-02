import os
import sys
from flask import Flask, send_from_directory
from flask_cors import CORS
from pedidos_routes import pedidos_bp
from admin_routes import admin_bp

# Función que permite compatibilidad con PyInstaller
def get_resource_path(relative_path):
    base_path = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_path, relative_path)

# Establecer ruta correcta para 'static'
static_folder_path = get_resource_path('static')

app = Flask(__name__, static_folder=static_folder_path, static_url_path='/')
CORS(app)

# Rutas
app.register_blueprint(pedidos_bp, url_prefix='/api/pedidos')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

# Servir frontend
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
