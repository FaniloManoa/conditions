import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy import text
from database import engine

def debug_db():
    try:
        with engine.connect() as conn:
            # Check type names
            res = conn.execute(text("SELECT typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE typtype = 'e' AND n.nspname = 'public';"))
            print("Enum types found in public:")
            for row in res:
                typename = row[0]
                print(f" - {typename}")
                # Check values for each
                val_res = conn.execute(text(f"SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = '{typename}' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'))"))
                print(f"   Values: {[r[0] for r in val_res]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_db()
