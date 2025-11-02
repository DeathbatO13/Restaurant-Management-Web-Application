from models import get_connection

# Lista de platos extraída del frontend, organizados por categoría.
platos = [
    # Desayunos
    {"nombre": "Tradicional", "descripcion": "Huevos al gusto. Arepa con mantequilla. Queso campesino. Chocolate o Cafe.", "precio": 9000, "categoria": "desayunos"},
    {"nombre": "Montañero", "descripcion": "Calentado de frijol, lentejas o pasta con arroz. Chicharron o carne en posta. Arepa con queso. Huevo al gusto. Aguapanela con limon o Cafe.", "precio": 12000, "categoria": "desayunos"},
    {"nombre": "Americano", "descripcion": "Tostadas con mantequilla o mermelada. Huevo frito o revuelto. Salchichas o jamon. Jugo natural y Cafe.", "precio": 9000, "categoria": "desayunos"},
    {"nombre": "Ligero", "descripcion": "Arepa de chocolo o pan. Queso fresco. Fruta picada. Yogurt o aromatica natural.", "precio": 7000, "categoria": "desayunos"},
    {"nombre": "Huevos al gusto", "descripcion": "Pericos/Revueltos/Fritos. Pan o arepa. Chocolate, Cafe o aromatica.", "precio": 8000, "categoria": "desayunos"},

    # Menú del día
    {"nombre": "Lunes", "descripcion": "Crema de Ahuyama - Fríjoles antioqueños con carne molida o chicharrón - Pasta con pollo en salsa criolla - Lentejas caseras con salchicha - Arvejas verdes guisadas - Jugo de mora o limonada", "precio": 15000, "categoria": "menu_del_dia"},
    {"nombre": "Martes", "descripcion": "Sopa de pasta - Fríjoles con pezuña o tocino - Pasta con albóndigas - Lentejas con carne molida - Garbanzos con callo - Jugo de papaya o limonada", "precio": 15000, "categoria": "menu_del_dia"},
    {"nombre": "Miercoles", "descripcion": "Sopa de cebada - Fríjoles con plátano maduro - Pasta en salsa blanca con pollo o atún - Lentejas con papa y zanahoria - Habichuelas guisadas - Jugo de tomate de arbol o limonada ", "precio": 15000, "categoria": "menu_del_dia"},
    {"nombre": "Jueves", "descripcion": "Sopa de colicero - Fríjoles con tocino - Pasta con queso y jamón - Lentejas con chorizo - Alverjas amarillas con carne guisada - Jugo de piña o limonada", "precio": 15000, "categoria": "menu_del_dia"},
    {"nombre": "Viernes", "descripcion": "Frijoles con hueso ahumado - Pasta con salsa boloñesa - Lentejas con Costilla - Jugo de mora o limonada", "precio": 15000, "categoria": "menu_del_dia"},

    # Carnes y parrilla
    {"nombre": "Beef Barril", "descripcion": "", "precio": 33000, "categoria": "carnes_y_parrilla"},
    {"nombre": "Bondiola BBQ", "descripcion": "", "precio": 33000, "categoria": "carnes_y_parrilla"},
    {"nombre": "Churrasco al barril", "descripcion": "", "precio": 33000, "categoria": "carnes_y_parrilla"},
    {"nombre": "Costillas BBQ al barril", "descripcion": "", "precio": 28000, "categoria": "carnes_y_parrilla"},
    {"nombre": "Mix Parrillero (para 1 persona)", "descripcion": "", "precio": 33000, "categoria": "carnes_y_parrilla"},
    {"nombre": "Mix Parrillero (para 2 persona)", "descripcion": "", "precio": 55000, "categoria": "carnes_y_parrilla"},
    {"nombre": "Mix Parrillero (para 3 persona)", "descripcion": "", "precio": 80000, "categoria": "carnes_y_parrilla"},
    {"nombre": "Mix Parrillero (para 4 personas)", "descripcion": "", "precio": 100000, "categoria": "carnes_y_parrilla"},
    {"nombre": "Punta de anca a la plancha", "descripcion": "", "precio": 25000, "categoria": "carnes_y_parrilla"},
    {"nombre": "Bistec a caballo", "descripcion": "", "precio": 22000, "categoria": "carnes_y_parrilla"},
    {"nombre": "Sobrebarriga en salsa criolla o al barril", "descripcion": "", "precio": 28000, "categoria": "carnes_y_parrilla"},
    {"nombre": "Lomo en champiñones", "descripcion": "", "precio": 28000, "categoria": "carnes_y_parrilla"},

    # Pollo
    {"nombre": "Pollo entero al barril", "descripcion": "", "precio": 35000, "categoria": "pollo"},
    {"nombre": "Alitas al barril", "descripcion": "", "precio": 22000, "categoria": "pollo"},
    {"nombre": "Pechuga al Grill", "descripcion": "", "precio": 28000, "categoria": "pollo"},
    {"nombre": "Pollo a la criolla", "descripcion": "", "precio": 28000, "categoria": "pollo"},
    {"nombre": "Pechuga napolitana", "descripcion": "", "precio": 28000, "categoria": "pollo"},

    # Cerdo
    {"nombre": "Lomo de cerdo parrillada", "descripcion": "", "precio": 28000, "categoria": "cerdo"},
    {"nombre": "Chuleta Ahumada", "descripcion": "", "precio": 28000, "categoria": "cerdo"},
    {"nombre": "Costilla chicharrón al barril", "descripcion": "", "precio": 33000, "categoria": "cerdo"},
    {"nombre": "Chuleta valluna", "descripcion": "", "precio": 28000, "categoria": "cerdo"},

    # Pescados y mariscos
    {"nombre": "Mojarra al barril", "descripcion": "", "precio": 30000, "categoria": "pescados_y_mariscos"},
    {"nombre": "Filete de pescado apanado o al ajillo", "descripcion": "", "precio": 29000, "categoria": "pescados_y_mariscos"},
    {"nombre": "Cazuela de mariscos", "descripcion": "", "precio": 35000, "categoria": "pescados_y_mariscos"},

    # Bebidas naturales
    {"nombre": "Jugo de Maracuya", "descripcion": "", "precio": 8000, "categoria": "bebidas_naturales"},
    {"nombre": "Jugo de Mango", "descripcion": "", "precio": 8000, "categoria": "bebidas_naturales"},
    {"nombre": "Jugo de Guayaba", "descripcion": "", "precio": 8000, "categoria": "bebidas_naturales"},
    {"nombre": "Jugo de Mora", "descripcion": "", "precio": 8000, "categoria": "bebidas_naturales"},
    {"nombre": "Jugo de Lulo", "descripcion": "", "precio": 8000, "categoria": "bebidas_naturales"},
    {"nombre": "Limonada Natural", "descripcion": "", "precio": 8000, "categoria": "bebidas_naturales"},
    {"nombre": "Jugo de Curuba", "descripcion": "", "precio": 8000, "categoria": "bebidas_naturales"},
    {"nombre": "Jugo de Tamarindo", "descripcion": "", "precio": 8000, "categoria": "bebidas_naturales"},
    {"nombre": "Refajo Artesanal (Cerveza + Cola + Hielo)", "descripcion": "", "precio": 10000, "categoria": "bebidas_naturales"},

    # Bebidas comerciales
    {"nombre": "Gaseosas", "descripcion": "400 ml", "precio": 6000, "categoria": "bebidas_comerciales"},
    {"nombre": "Agua en botella", "descripcion": "", "precio": 3000, "categoria": "bebidas_comerciales"},
    {"nombre": "Agua con Gas", "descripcion": "", "precio": 4500, "categoria": "bebidas_comerciales"},
    {"nombre": "Jugos en caja o botella", "descripcion": "", "precio": 4000, "categoria": "bebidas_comerciales"},

    # Bebidas calientes
    {"nombre": "Cafe tinto", "descripcion": "", "precio": 2000, "categoria": "bebidas_calientes"},
    {"nombre": "Cafe con leche", "descripcion": "", "precio": 2500, "categoria": "bebidas_calientes"},
    {"nombre": "Chocolate Caliente", "descripcion": "", "precio": 3000, "categoria": "bebidas_calientes"},
    {"nombre": "Aromatica de frutas", "descripcion": "O de hierbas naturales", "precio": 3500, "categoria": "bebidas_calientes"},
]

conn = get_connection()
c = conn.cursor()


for plato in platos:
    c.execute("""
        SELECT id FROM platos_adicionales WHERE nombre = ? AND categoria = ?
    """, (plato["nombre"], plato["categoria"]))
    exists = c.fetchone()
    if exists:
        c.execute("""
            UPDATE platos_adicionales
            SET descripcion = ?, precio = ?
            WHERE id = ?
        """, (plato.get("descripcion", ""), plato["precio"], exists[0]))
    else:
        c.execute("""
            INSERT INTO platos_adicionales (nombre, descripcion, precio, categoria, visible)
            VALUES (?, ?, ?, ?, 1)
        """, (plato["nombre"], plato.get("descripcion", ""), plato["precio"], plato["categoria"]))

conn.commit()
conn.close()
print("✅ Platos cargados exitosamente en la base de datos.")