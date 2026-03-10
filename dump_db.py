import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy import text
from database import engine

def check_db():
    with engine.connect() as conn:
        print("\n--- CLIENTS ---")
        clients = conn.execute(text("SELECT id, name, category FROM clients;")).fetchall()
        for c in clients:
            print(c)
            
        print("\n--- GLOBAL COMMISSIONS ---")
        configs = conn.execute(text("SELECT type, client_category, is_enabled, percentage_value FROM commission_configs WHERE client_id IS NULL;")).fetchall()
        for c in configs:
            print(c)
            
        print("\n--- SPECIFIC COMMISSIONS ---")
        specifics = conn.execute(text("SELECT client_id, type, is_enabled, percentage_value FROM commission_configs WHERE client_id IS NOT NULL;")).fetchall()
        for s in specifics:
            print(s)

if __name__ == "__main__":
    check_db()
