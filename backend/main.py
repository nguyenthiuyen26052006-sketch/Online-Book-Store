import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import database
import models
from db_bootstrap import run_backup_sql_if_empty
from routers import admin, books, cart, categories, orders, reviews, super_admin, users

app = FastAPI(title="Online Book Store API", redirect_slashes=False)

frontend_origin = os.getenv("FRONTEND_ORIGIN")
allowed_origins = [origin.strip() for origin in frontend_origin.split(",")]

print(f"[CORS] Allowing origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    database.init_db()
    engine = database.engine

    # Tạo tất cả bảng nếu chưa có
    try:
        database.Base.metadata.create_all(bind=engine)
        print("[Startup] ✓ Database tables created/verified")
    except Exception as e:
        print(f"[Startup] ✗ Error creating tables: {e}")
        raise

    # Nạp dữ liệu mẫu nếu DB trống
    try:
        result = run_backup_sql_if_empty()
        if result:
            print("[Startup] ✓ Backup data loaded successfully")
        else:
            print("[Startup] ✓ Database already contains data or backup not needed")
    except Exception as e:
        print(f"[Startup] ✗ Error loading backup: {e}")
        raise


@app.get("/")
async def root():
    return {"message": "Online Book Store backend is running"}


app.include_router(users.router)
app.include_router(categories.router)
app.include_router(books.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(reviews.router)
app.include_router(admin.router)
app.include_router(super_admin.router)