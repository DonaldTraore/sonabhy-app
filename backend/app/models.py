from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class DirectionTable(Base):
    __tablename__ = "direction"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, index=True)
    services = relationship("ServiceTable", back_populates="direction")


class ServiceTable(Base):
    __tablename__ = "service"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, index=True)
    direction_id = Column(Integer, ForeignKey("direction.id"))
    direction = relationship("DirectionTable", back_populates="services")
    employees = relationship("EmployeeTable", back_populates="service")


class EmployeeTable(Base):
    __tablename__ = "employee"
    id = Column(Integer, primary_key=True, index=True)
    prenom = Column(String, index=True)
    nom = Column(String, index=True)
    fonction = Column(String, default="")
    email = Column(String, index=True, nullable=True)
    telephone = Column(String, nullable=True)
    service_id = Column(Integer, ForeignKey("service.id"))
    service = relationship("ServiceTable", back_populates="employees")


# API Models
class Direction(BaseModel):
    id: int
    nom: str

    class Config:
        from_attributes = True


class DirectionCreate(BaseModel):
    nom: str


class DirectionUpdate(BaseModel):
    nom: Optional[str] = None


class Service(BaseModel):
    id: int
    nom: str
    direction_id: int

    class Config:
        from_attributes = True


class ServiceCreate(BaseModel):
    nom: str
    direction_id: int


class ServiceUpdate(BaseModel):
    nom: Optional[str] = None
    direction_id: Optional[int] = None


class Employee(BaseModel):
    id: int
    prenom: str
    nom: str
    fonction: str
    email: Optional[str] = None
    telephone: Optional[str] = None
    service_id: int

    class Config:
        from_attributes = True


class EmployeeCreate(BaseModel):
    prenom: str
    nom: str
    fonction: str
    email: Optional[str] = None
    telephone: Optional[str] = None
    service_id: int


class EmployeeUpdate(BaseModel):
    prenom: Optional[str] = None
    nom: Optional[str] = None
    fonction: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    service_id: Optional[int] = None
