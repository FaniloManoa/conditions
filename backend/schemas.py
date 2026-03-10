from pydantic import BaseModel
from typing import List, Optional
from models import ClientCategory, CommissionType

class CommissionConfigBase(BaseModel):
    type: CommissionType
    is_enabled: bool = True
    is_percentage: bool = True
    percentage_value: float = 0.0
    fixed_amount: float = 0.0
    has_floor: bool = False
    floor: float = 0.0
    has_ceiling: bool = False
    ceiling: float = 0.0

class CommissionConfigCreate(CommissionConfigBase):
    client_id: Optional[int] = None
    client_category: Optional[ClientCategory] = None

class CommissionConfig(CommissionConfigBase):
    id: int
    client_id: Optional[int]
    client_category: Optional[ClientCategory]

    class Config:
        from_attributes = True

class AccountBase(BaseModel):
    account_number: str
    currency: str

class Account(AccountBase):
    id: int
    client_id: int

    class Config:
        from_attributes = True

class ClientBase(BaseModel):
    identifier: Optional[str] = None
    name: str
    activity: str
    category: ClientCategory

class ClientCreate(ClientBase):
    account_number: Optional[str] = None
    account_currency: Optional[str] = "MGA"

class Client(ClientBase):
    id: int
    accounts: List[Account] = []
    
    class Config:
        from_attributes = True

class FeeCalculationRequest(BaseModel):
    client_id: int
    amount: float
    type: CommissionType
    exchange_rate: Optional[float] = 1.0

class FeeCalculationResponse(BaseModel):
    type: CommissionType
    fee: float
    description: str
    is_flat_override: bool = False
    is_specific: bool = False
