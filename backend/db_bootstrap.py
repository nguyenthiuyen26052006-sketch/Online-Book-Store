from __future__ import annotations

from pathlib import Path

from sqlalchemy import text
from sqlalchemy.orm import Session
from pymysql.err import IntegrityError

import database
import models


def _backup_sql_path() -> Path:
    return Path(__file__).resolve().parent / "backup.sql"


def _strip_sql_comments(sql: str) -> str:
    lines_out: list[str] = []
    for line in sql.splitlines():
        stripped = line.strip()
        if stripped.startswith("--"):
            continue
        lines_out.append(line)
    return "\n".join(lines_out)


def _split_statements(sql: str) -> list[str]:
    cleaned = _strip_sql_comments(sql)
    parts = [p.strip() for p in cleaned.split(";")]
    return [p for p in parts if p]


def database_has_any_user(db: Session) -> bool:
    return db.query(models.User).limit(1).count() > 0


def run_backup_sql_if_empty() -> bool:
    path = _backup_sql_path()
    if not path.is_file():
        return False

    db = database.SessionLocal()
    try:
        if database_has_any_user(db):
            return False
    finally:
        db.close()

    raw = path.read_text(encoding="utf-8")
    statements = _split_statements(raw)
    if not statements:
        return False

    try:
        with database.engine.begin() as conn:
            for stmt in statements:
                upper = stmt.lstrip().upper()
                if not upper or upper.startswith("SELECT"):
                    continue
                try:
                    conn.execute(text(stmt))
                except Exception as e:
                    if "Duplicate entry" in str(e) or "1062" in str(e):
                        print(f"[db_bootstrap] Data already exists (loaded by another worker): {str(e)[:80]}...")
                        return True
                    raise
    except Exception as exc:
        print(f"[db_bootstrap] Lỗi khi chạy backup.sql: {exc}")
        return False

    print("[db_bootstrap] ✓ Sample data loaded from backup.sql")
    return True