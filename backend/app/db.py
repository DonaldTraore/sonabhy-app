from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import os

DB_URL = os.getenv("SONABHY_DB_URL", "sqlite:///./sonabhy.db")
connect_args = {"check_same_thread": False} if DB_URL.startswith("sqlite") else {}
engine = create_engine(DB_URL, echo=False, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    from . import models  # ensure models are imported
    models.Base.metadata.create_all(bind=engine)


def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
