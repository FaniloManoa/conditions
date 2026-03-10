from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Float, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
import enum
from database import Base

class ClientCategory(str, enum.Enum):
    PARTICULIER = "PARTICULIER"
    CORPORATE = "CORPORATE"
    INSTITUTIONNEL = "INSTITUTIONNEL"

class CommissionType(str, enum.Enum):
    EXCHANGE_CESSION = "EXCHANGE_CESSION"
    EXCHANGE_VIREMENT = "EXCHANGE_VIREMENT"
    TRANSFER = "TRANSFER"
    SWIFT = "SWIFT"
    CORRESPONDENT = "CORRESPONDENT"
    FLAT = "FLAT"
    EXCHANGE_IN = "EXCHANGE_IN"

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    identifier = Column(String, unique=True, index=True, nullable=True)
    name = Column(String, index=True)
    activity = Column(String)
    category = Column(Enum(ClientCategory), default=ClientCategory.PARTICULIER)

    accounts = relationship("Account", back_populates="owner")
    specific_commissions = relationship("CommissionConfig", back_populates="client")

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    account_number = Column(String, unique=True, index=True)
    currency = Column(String)
    client_id = Column(Integer, ForeignKey("clients.id"))

    owner = relationship("Client", back_populates="accounts")

class CommissionConfig(Base):
    __tablename__ = "commission_configs"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True) # NULL for global defaults
    client_category = Column(Enum(ClientCategory), nullable=True) # Used if client_id is NULL
    type = Column(Enum(CommissionType))
    
    is_enabled = Column(Boolean, default=True)
    is_percentage = Column(Boolean, default=True)
    percentage_value = Column(Float, default=0.0)
    fixed_amount = Column(Float, default=0.0)
    
    has_floor = Column(Boolean, default=False)
    floor = Column(Float, default=0.0)
    
    has_ceiling = Column(Boolean, default=False)
    ceiling = Column(Float, default=0.0)

    client = relationship("Client", back_populates="specific_commissions")

    __table_args__ = (
        # Unique default per category and type
        UniqueConstraint('client_id', 'client_category', 'type', name='_client_type_uc'),
    )
