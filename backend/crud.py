from sqlalchemy.orm import Session
import models, schemas
from typing import List, Optional

def get_client(db: Session, client_id: int):
    return db.query(models.Client).filter(models.Client.id == client_id).first()

def get_clients(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Client).offset(skip).limit(limit).all()

def create_client(db: Session, client: schemas.ClientCreate):
    client_data = client.dict()
    account_number = client_data.pop('account_number', None)
    account_currency = client_data.pop('account_currency', 'MGA')
    
    db_client = models.Client(**client_data)
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    
    if account_number:
        db_account = models.Account(
            account_number=account_number,
            currency=account_currency,
            client_id=db_client.id
        )
        db.add(db_account)
        db.commit()
        db.refresh(db_client)
        
    return db_client

def get_global_commissions(db: Session, category: models.ClientCategory):
    return db.query(models.CommissionConfig).filter(
        models.CommissionConfig.client_id == None,
        models.CommissionConfig.client_category == category
    ).all()

def get_effective_commission(db: Session, client_id: int, commission_type: models.CommissionType):
    client = get_client(db, client_id)
    if not client:
        return None, False
    
    # 1. Check client-specific override
    specific = db.query(models.CommissionConfig).filter(
        models.CommissionConfig.client_id == client_id,
        models.CommissionConfig.type == commission_type
    ).first()
    
    if specific:
        return specific, True
    
    # 2. Check category default
    default = db.query(models.CommissionConfig).filter(
        models.CommissionConfig.client_id == None,
        models.CommissionConfig.client_category == client.category,
        models.CommissionConfig.type == commission_type
    ).first()
    
    return default, bool(specific)

def calculate_fee(db: Session, client_id: int, type: models.CommissionType, amount: float, exchange_rate: float = 1.0):
    client = get_client(db, client_id)
    if not client:
        return 0, "Client not found", False, False

    # Check for FLAT override if current type is Exchange Virement or Transfer
    if type in [models.CommissionType.EXCHANGE_VIREMENT, models.CommissionType.TRANSFER]:
        flat_config, is_specific = get_effective_commission(db, client_id, models.CommissionType.FLAT)
        if flat_config and flat_config.is_enabled:
            return 0, "Overridden by Flat Fee", True, is_specific

    config, is_specific = get_effective_commission(db, client_id, type)
    if not config or not config.is_enabled:
        return 0, "Commission disabled or not configured", False, is_specific

    # Apply exchange rate to calculation base for all volume-based fees usually impacted by currency
    base_amount = amount
    rate_info = ""
    if type in [models.CommissionType.EXCHANGE_CESSION, models.CommissionType.EXCHANGE_VIREMENT, models.CommissionType.EXCHANGE_IN, models.CommissionType.TRANSFER, models.CommissionType.FLAT]:
        base_amount = amount * exchange_rate
        if exchange_rate != 1.0:
            rate_info = f" (Contre-valeur: {base_amount:,.2f} @ {exchange_rate})"

    fee = 0.0
    if config.is_percentage:
        fee = base_amount * (config.percentage_value / 100)
        if config.has_floor:
            fee = max(fee, config.floor)
        if config.has_ceiling:
            fee = min(fee, config.ceiling)
    else:
        fee = config.fixed_amount

    return fee, f"Calculated based on {'percentage' if config.is_percentage else 'fixed amount'}{rate_info}", False, is_specific

def update_client_commission(db: Session, client_id: int, commission: schemas.CommissionConfigBase):
    db_comm = db.query(models.CommissionConfig).filter(
        models.CommissionConfig.client_id == client_id,
        models.CommissionConfig.type == commission.type
    ).first()
    
    if db_comm:
        for key, value in commission.dict().items():
            setattr(db_comm, key, value)
    else:
        db_comm = models.CommissionConfig(**commission.dict(), client_id=client_id)
        db.add(db_comm)
    
    db.commit()
    db.refresh(db_comm)
    return db_comm

def update_global_commission(db: Session, category: models.ClientCategory, commission: schemas.CommissionConfigBase):
    db_comm = db.query(models.CommissionConfig).filter(
        models.CommissionConfig.client_id == None,
        models.CommissionConfig.client_category == category,
        models.CommissionConfig.type == commission.type
    ).first()
    
    if db_comm:
        for key, value in commission.dict().items():
            setattr(db_comm, key, value)
    else:
        db_comm = models.CommissionConfig(**commission.dict(), client_category=category)
        db.add(db_comm)
    
    db.commit()
    db.refresh(db_comm)
    return db_comm
