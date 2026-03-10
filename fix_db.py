import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy import text
from database import engine

def migrate():
    with engine.connect() as conn:
        print("Checking for 'identifier' column...")
        try:
            conn.execution_options(isolation_level="AUTOCOMMIT").execute(text("ALTER TABLE clients ADD COLUMN identifier VARCHAR"))
            print("Successfully added 'identifier' column.")
        except Exception as e:
            print(f"Could not add column (maybe it exists?): {e}")

if __name__ == "__main__":
    migrate()
