from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models, schemas, crud
from database import SessionLocal, engine, get_db

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Banking Conditions Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/clients", response_model=List[schemas.Client])
def read_clients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_clients(db, skip=skip, limit=limit)

@app.post("/clients", response_model=schemas.Client)
def create_client(client: schemas.ClientCreate, db: Session = Depends(get_db)):
    return crud.create_client(db=db, client=client)

@app.get("/clients/{client_id}", response_model=schemas.Client)
def read_client(client_id: int, db: Session = Depends(get_db)):
    db_client = crud.get_client(db, client_id=client_id)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return db_client

@app.get("/clients/{client_id}/commissions/{type}", response_model=schemas.CommissionConfig)
def get_client_commission(client_id: int, type: models.CommissionType, db: Session = Depends(get_db)):
    config, is_specific = crud.get_effective_commission(db, client_id, type)
    if not config:
        raise HTTPException(status_code=404, detail="Commission configuration not found")
    return config

@app.get("/commissions/global/{category}", response_model=List[schemas.CommissionConfig])
def get_global_commissions(category: models.ClientCategory, db: Session = Depends(get_db)):
    return crud.get_global_commissions(db, category)

@app.post("/commissions/global/{category}", response_model=schemas.CommissionConfig)
def update_global_commission(category: models.ClientCategory, commission: schemas.CommissionConfigBase, db: Session = Depends(get_db)):
    return crud.update_global_commission(db, category, commission)

@app.post("/clients/{client_id}/commissions", response_model=schemas.CommissionConfig)
def update_client_commission(client_id: int, commission: schemas.CommissionConfigBase, db: Session = Depends(get_db)):
    return crud.update_client_commission(db, client_id, commission)

@app.post("/calculate", response_model=schemas.FeeCalculationResponse)
def calculate_fee(request: schemas.FeeCalculationRequest, db: Session = Depends(get_db)):
    fee, desc, is_flat, is_specific = crud.calculate_fee(
        db, 
        request.client_id, 
        request.type, 
        request.amount, 
        request.exchange_rate
    )
    return {
        "type": request.type,
        "fee": fee,
        "description": desc,
        "is_flat_override": is_flat,
        "is_specific": is_specific
    }

# Initial seed route (optional tool for developer)
@app.post("/seed")
def seed_data(db: Session = Depends(get_db)):
    # Check if defaults exist
    for cat in models.ClientCategory:
        for t in models.CommissionType:
            exists = db.query(models.CommissionConfig).filter(
                models.CommissionConfig.client_id == None,
                models.CommissionConfig.client_category == cat,
                models.CommissionConfig.type == t
            ).first()
            if not exists:
                db.add(models.CommissionConfig(
                    client_category=cat,
                    type=t,
                    is_enabled=True if t != models.CommissionType.FLAT else False,
                    is_percentage=True,
                    percentage_value=0.5 if cat != models.ClientCategory.PARTICULIER else 1.2,
                    has_floor=True,
                    floor=5000.0,
                    has_ceiling=True,
                    ceiling=100000.0
                ))
    db.commit()
    return {"message": "Defaults seeded"}
