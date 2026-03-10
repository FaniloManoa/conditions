import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy.orm import Session
from sqlalchemy import text
from database import SessionLocal, engine
import models

def seed_initial_data():
    db = SessionLocal()
    
    # Create tables
    models.Base.metadata.create_all(bind=engine)

    # Update Enum if needed (PostgreSQL specific)
    # This part handles migrating old databases to the new Enum values
    with engine.connect() as conn:
        for val in ['EXCHANGE_IN']:
            try:
                conn.execution_options(isolation_level="AUTOCOMMIT").execute(text(f"ALTER TYPE commissiontype ADD VALUE '{val}'"))
                print(f"ENUM CommissionType: {val} added")
            except Exception: pass
            
        for val in ['PARTICULIER', 'INSTITUTIONNEL']:
            try:
                conn.execution_options(isolation_level="AUTOCOMMIT").execute(text(f"ALTER TYPE clientcategory ADD VALUE '{val}'"))
                print(f"ENUM ClientCategory: {val} added")
            except Exception: pass

        # Add identifier column if it doesn't exist
        try:
            conn.execution_options(isolation_level="AUTOCOMMIT").execute(text("ALTER TABLE clients ADD COLUMN identifier VARCHAR"))
            print("Column 'identifier' added to table 'clients'")
        except Exception: pass
    
    # 1. Add Default Commissions (Standards)
    # We define standards for each category to ensure the app works immediately
    for cat in models.ClientCategory:
        for t in models.CommissionType:
            exists = db.query(models.CommissionConfig).filter(
                models.CommissionConfig.client_id == None,
                models.CommissionConfig.client_category == cat,
                models.CommissionConfig.type == t
            ).first()
            
            if not exists:
                # Default logic: Professionals/Institutions often have lower rates but higher floors
                is_corp = cat == models.ClientCategory.CORPORATE
                is_inst = cat == models.ClientCategory.INSTITUTIONNEL
                
                pct = 0.5 if (is_corp or is_inst) else 1.2
                floor_val = 15000.0 if (is_corp or is_inst) else 5000.0
                ceil_val = 250000.0 if is_corp else (500000.0 if is_inst else 75000.0)

                db.add(models.CommissionConfig(
                    client_category=cat,
                    type=t,
                    is_enabled=True if t != models.CommissionType.FLAT else False,
                    is_percentage=True,
                    percentage_value=pct,
                    has_floor=True,
                    floor=floor_val,
                    has_ceiling=True,
                    ceiling=ceil_val
                ))

    # 2. Add some Demo Clients
    clients_data = [
        {"name": "SONATEL SA", "activity": "Telecommunications", "category": models.ClientCategory.CORPORATE},
        {"name": "Jean Dupont", "activity": "Consultant Independant", "category": models.ClientCategory.PARTICULIER},
        {"name": "TotalEnergies", "activity": "Energie", "category": models.ClientCategory.CORPORATE},
        {"name": "Banque Mondiale", "activity": "Institution Financière", "category": models.ClientCategory.INSTITUTIONNEL},
    ]
    
    for c_data in clients_data:
        exists = db.query(models.Client).filter(models.Client.name == c_data["name"]).first()
        if not exists:
            client = models.Client(**c_data)
            db.add(client)
            db.flush() # Get ID
            
            # Add a demo account
            acc = models.Account(
                account_number=f"SN062 01001 {10000000 + client.id} 45",
                currency="XOF",
                client_id=client.id
            )
            db.add(acc)
            
            # Add a specific commission for SONATEL as an example of override
            if client.name == "SONATEL SA":
                db.add(models.CommissionConfig(
                    client_id=client.id,
                    type=models.CommissionType.FLAT,
                    is_enabled=True,
                    is_percentage=True,
                    percentage_value=0.25,
                    has_floor=True,
                    floor=10000
                ))

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_initial_data()
