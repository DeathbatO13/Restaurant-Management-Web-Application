import os
import platform
import tempfile
import time

# Solo importar win32print si estás en Windows
if platform.system() == "Windows":
    import win32print
else:
    win32print = None

def imprimir_ticket(pedido, printer_name=None):
    if win32print is None:
        print("Impresión deshabilitada (no es Windows). Pedido recibido:")
        print(pedido)
        return  # Salir sin imprimir en Linux

    texto = f"""
===================================
       RESTAURANTE - PEDIDO
===================================

Pedido #{pedido['id']}
Fecha: {pedido.get('fecha', '')}

Cliente: {pedido.get('nombre', '')}
Tipo: {'Domicilio' if pedido.get('tipo') == 'delivery' else 'En mesa'}

{f"Dirección: {pedido.get('direccion')}" if pedido.get('tipo') == 'delivery' else f"Mesa: {pedido.get('mesa')}"}
Teléfono: {pedido.get('telefono') or '---'}

------------ PLATOS --------------
"""

    for plato in pedido.get('platos', []):
        if isinstance(plato, dict):
            texto += f" - {plato.get('nombre', '')} x{plato.get('quantity', 1)}\n"
        else:
            texto += f" - {plato}\n"
    texto += f"""
Postre: {'Sí' if pedido.get('postre') else 'No'}
TOTAL: ${pedido.get('total'):,.0f}

===================================
     ¡Gracias por tu pedido!
===================================
"""

    # Comando ESC/POS para corte total de papel
    CUT_PAPER = b'\x1D\x56\x00'

    if not printer_name:
        printer_name = win32print.GetDefaultPrinter()

    with tempfile.NamedTemporaryFile(delete=False, suffix=".txt", mode="w", encoding="utf-8") as f:
        f.write(texto)
        temp_path = f.name

    hPrinter = win32print.OpenPrinter(printer_name)
    try:
        hJob = win32print.StartDocPrinter(hPrinter, 1, ("Ticket Restaurante", None, "RAW"))
        win32print.StartPagePrinter(hPrinter)
        with open(temp_path, "r", encoding="utf-8") as f:
            for line in f:
                win32print.WritePrinter(hPrinter, line.encode("utf-8"))
        win32print.WritePrinter(hPrinter, CUT_PAPER)
        win32print.EndPagePrinter(hPrinter)
        win32print.EndDocPrinter(hPrinter)
    finally:
        win32print.ClosePrinter(hPrinter)

    try:
        os.remove(temp_path)
    except Exception:
        pass