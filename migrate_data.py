import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy import text
from database import engine

def migrate_data():
    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
        # Update existing clients
        conn.execute(text("UPDATE clients SET category = 'PARTICULIER' WHERE category::text = 'RETAIL'"))
        print("Updated category for clients")
        # Update existing global configs
        conn.execute(text("UPDATE commission_configs SET client_category = 'PARTICULIER' WHERE client_category::text = 'RETAIL'"))
        print("Updated category for commissions")

if __name__ == "__main__":
    migrate_data()
