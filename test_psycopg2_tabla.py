# test_psycopg2_tabla.py
import psycopg2

DATABASE_URL = "postgresql://felix:hellen2308@localhost/minibanco"

try:
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS prueba_tabla (
            id SERIAL PRIMARY KEY
        );
    """)
    conn.commit()
    print("Tabla 'prueba_tabla' creada exitosamente usando psycopg2!")

    cur.close()
    conn.close()

except psycopg2.Error as e:
    print(f"Error al interactuar con PostgreSQL: {e}")
    if conn:
        conn.rollback()
        conn.close()
