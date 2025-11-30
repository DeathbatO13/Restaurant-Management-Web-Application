import os
import sys
from flask import Flask, send_from_directory, Response, request
import mimetypes
from flask_cors import CORS
import requests
from pedidos_routes import pedidos_bp
from admin_routes import admin_bp

# Función que permite compatibilidad con PyInstaller
def get_resource_path(relative_path):
    try:
        base_path = sys._MEIPASS  # PyInstaller temp folder
    except Exception:
        base_path = os.path.abspath(os.path.dirname(__file__))
    return os.path.join(base_path, relative_path)

# Establecer ruta correcta para 'static'
static_folder_path = get_resource_path('static')

app = Flask(__name__, static_folder=static_folder_path, static_url_path='/')
CORS(app)

# Registra tus blueprints (mantén esto igual)
app.register_blueprint(pedidos_bp, url_prefix='/api/pedidos')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

# Dirección del Next dev server durante desarrollo
NEXT_DEV_SERVER = "http://localhost:3000"

# Ruta catch-all: sirve estático si existe, si no proxy al dev server y si falla devuelve index.html estático
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    # Si existe el archivo en backend/static, devolverlo.
    # Para evitar servir una versión vieja con "Barril 360" embebida en los bundles compilados,
    # si el archivo es de texto (html, js, css) hacemos un reemplazo ligero en memoria antes de devolverlo.
    file_path = os.path.join(app.static_folder or "", path)
    if path != "" and os.path.exists(file_path) and os.path.isfile(file_path):
        # Determinar tipo MIME
        mime_type, _ = mimetypes.guess_type(file_path)
        if mime_type and (mime_type.startswith("text/") or file_path.endswith(".js")):
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                # Reemplazos puntuales no destructivos
                content = content.replace("Barril 360", "Restaurante")
                # Si existe la nueva imagen en static, actualiza la referencia; si no, deja la original
                restaurante_img = os.path.join(app.static_folder or "", "restaurante-bg.jpg")
                if os.path.exists(restaurante_img):
                    content = content.replace("/barril360-bg.jpg", "/restaurante-bg.jpg")
                    content = content.replace("Barril 360 Logo", "Restaurante Logo")
                return Response(content, mimetype=mime_type)
            except Exception:
                # Si falla la lectura/transformación, servir el archivo tal cual
                return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, path)

    # Intentar proxy al Next dev server (útil mientras desarrollas)
    try:
        proxied = requests.request(
            method=request.method,
            url=f"{NEXT_DEV_SERVER}/{path}",
            params=request.args,
            headers={k: v for k, v in request.headers.items() if k.lower() != "host"},
            data=request.get_data(),
            cookies=request.cookies,
            allow_redirects=False,
            timeout=5,
        )
        # Construir respuesta con los headers útiles
        excluded_headers = ["content-encoding", "content-length", "transfer-encoding", "connection"]
        headers = [(name, value) for name, value in proxied.headers.items() if name.lower() not in excluded_headers]
        return Response(proxied.content, proxied.status_code, headers)
    except Exception:
        # Fallback: servir index.html estático
        return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    # Ajusta host/port si necesitas
    app.run(host="0.0.0.0", port=8000, debug=True)
