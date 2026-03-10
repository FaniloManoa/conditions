import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy import text
from database import engine

def migrate_enums():
    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
        try:
            conn.execute(text("ALTER TYPE clientcategory ADD VALUE 'PARTICULIER'"))
            print("PARTICULIER added")
        except Exception as e: print(f"PARTICULIER error: {e}")
        try:
            conn.execute(text("ALTER TYPE clientcategory ADD VALUE 'INSTITUTIONNEL'"))
            print("INSTITUTIONNEL added")
        except Exception as e: print(f"INSTITUTIONNEL error: {e}")

if __name__ == "__main__":
    migrate_enums()
