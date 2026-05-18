import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import time

# -------------------------
# DATABASE URL BUILD
# -------------------------

DB_USER = os.getenv("MYSQL_USER")
DB_PASSWORD = os.getenv("MYSQL_ROOT_PASSWORD")
DB_HOST = os.getenv("MYSQL_HOST")
DB_PORT = os.getenv("MYSQL_PORT")
DB_NAME = os.getenv("MYSQL_DATABASE")


DATABASE_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    f"?charset=utf8mb4"
)

# -------------------------
# LAZY ENGINE INIT
# -------------------------

engine = None
SessionLocal = None


def init_db():
    """
    Create engine only when app starts
    → tránh lỗi worker spawn + DB chưa ready
    """
    global engine, SessionLocal

    # Retry connection with exponential backoff
    max_retries = 5
    retry_delay = 1
    
    for attempt in range(max_retries):
        try:
            engine = create_engine(
                DATABASE_URL,
                echo=False,
                future=True,
                pool_pre_ping=True,
                pool_recycle=3600,
                connect_args={"connect_timeout": 20},
            )
            # Test connection
            with engine.connect() as conn:
                conn.execute(__import__('sqlalchemy').text("SELECT 1"))
            break
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"[Database] Connection attempt {attempt + 1} failed: {e}. Retrying in {retry_delay}s...")
                time.sleep(retry_delay)
                retry_delay *= 2
            else:
                raise

    SessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine
    )


# -------------------------
# BASE MODEL
# -------------------------

Base = declarative_base()


# -------------------------
# FASTAPI DEPENDENCY
# -------------------------

def get_db():
    """
    One DB session per request
    """
    if SessionLocal is None:
        raise Exception("Database not initialized. Call init_db() first.")

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()