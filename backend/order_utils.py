"""
Order status helpers: canonical statuses, legacy aliases, transitions, and history rows.
Legacy: API and DB may still contain "completed" until migrated to "delivered".
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

import models

CANONICAL_ORDER_STATUSES = frozenset(
    {"pending", "confirmed", "shipping", "delivered", "cancelled"}
)
LEGACY_STATUS_ALIASES = {"completed": "delivered"}

# Allowed transitions between canonical statuses.
VALID_STATUS_TRANSITIONS: dict[str, set[str]] = {
    "pending": {"confirmed", "cancelled"},
    "confirmed": {"shipping", "cancelled"},
    "shipping": {"delivered", "cancelled"},
    "delivered": set(),
    "cancelled": set(),
}


def normalize_order_status(status: str) -> str:
    key = (status or "").strip().lower()
    return LEGACY_STATUS_ALIASES.get(key, key)


def is_terminal_order_status(status: str) -> bool:
    n = normalize_order_status(status)
    return n in {"delivered", "cancelled"}


def assert_valid_target_status(status: str) -> str:
    normalized = normalize_order_status(status)
    if normalized not in CANONICAL_ORDER_STATUSES:
        raise ValueError("Invalid order status")
    return normalized


def can_transition(from_status: str, to_status: str) -> bool:
    current = normalize_order_status(from_status)
    target = normalize_order_status(to_status)
    return target in VALID_STATUS_TRANSITIONS.get(current, set())


def append_order_history(
    db: Session,
    order_id: int,
    status: str,
    note: Optional[str] = None,
    changed_at: Optional[datetime] = None,
) -> models.OrderStatusHistory:
    row = models.OrderStatusHistory(
        order_id=order_id,
        status=normalize_order_status(status),
        note=note,
        changed_at=changed_at or datetime.utcnow(),
    )
    db.add(row)
    return row


def set_order_status(
    db: Session,
    order: models.Order,
    new_status_raw: str,
    note: Optional[str] = None,
) -> None:
    """Updates order.status and appends history. Raises ValueError on invalid input or transition."""
    new_status = assert_valid_target_status(new_status_raw)
    current = normalize_order_status(order.status)
    if new_status == current:
        return
    if not can_transition(current, new_status):
        raise ValueError(f"Cannot change order from '{current}' to '{new_status}'")
    order.status = new_status
    append_order_history(db, order.id, new_status, note)
