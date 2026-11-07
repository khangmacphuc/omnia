"""Smoke-test the checked-in SQLite storage contract.

Run with: python docs/validate_storage_schema.py
"""

from __future__ import annotations

import sqlite3
from pathlib import Path


SCHEMA = Path(__file__).with_name("storage-schema.sql")


def main() -> None:
    connection = sqlite3.connect(":memory:")
    connection.execute("PRAGMA foreign_keys = ON")
    connection.executescript(SCHEMA.read_text(encoding="utf-8"))

    tables = connection.execute(
        "SELECT name FROM sqlite_master "
        "WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).fetchall()
    indexes = connection.execute(
        "SELECT name FROM sqlite_master "
        "WHERE type = 'index' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).fetchall()
    triggers = connection.execute(
        "SELECT name FROM sqlite_master WHERE type = 'trigger' ORDER BY name"
    ).fetchall()
    foreign_key_violations = connection.execute("PRAGMA foreign_key_check").fetchall()
    integrity = connection.execute("PRAGMA integrity_check").fetchone()

    assert foreign_key_violations == [], foreign_key_violations
    assert integrity == ("ok",), integrity
    assert len(tables) >= 20, tables
    assert len(triggers) >= 2, triggers

    print(f"SQLite {sqlite3.sqlite_version}")
    print(f"Schema OK: {len(tables)} tables, {len(indexes)} indexes, {len(triggers)} triggers")


if __name__ == "__main__":
    main()
