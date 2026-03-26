import sqlite3

conn = sqlite3.connect('backend/sonabhy.db')
cursor = conn.cursor()

# Vérifier les tables
cursor.execute('SELECT name FROM sqlite_master WHERE type="table";')
tables = cursor.fetchall()
print('Tables trouvées:', tables)

# Vérifier les directions
if any('direction' in table[0] for table in tables):
    cursor.execute('SELECT * FROM direction')
    directions = cursor.fetchall()
    print('Directions:', directions)

# Vérifier les services
if any('service' in table[0] for table in tables):
    cursor.execute('SELECT * FROM service')
    services = cursor.fetchall()
    print('Services:', services)

# Vérifier les employés
if any('employee' in table[0] for table in tables):
    cursor.execute('SELECT * FROM employee')
    employees = cursor.fetchall()
    print('Employés:', employees)

conn.close()
