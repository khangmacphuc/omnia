"""Exercise the durable attachment-draft binding contract in SQLite.

This is intentionally stricter than ``validate_storage_schema.py``.  The
general schema smoke test proves that the DDL loads and that SQLite reports a
healthy database.  This verifier proves the security and lifecycle invariants
that must hold before Omnia enables native multimodal dispatch.

Run with::

    python docs/validate_attachment_schema.py

The fixtures contain no filesystem paths, file bytes, credentials, or user
data.  Every case runs against a fresh in-memory database created from the
checked-in schema.
"""

from __future__ import annotations

import sqlite3
from collections.abc import Callable
from pathlib import Path


SCHEMA = Path(__file__).with_name("storage-schema.sql")
CREATED_AT_MS = 1_000
BIND_AT_MS = 1_500
EXPIRES_AT_MS = 4_000


def new_database() -> sqlite3.Connection:
    connection = sqlite3.connect(":memory:")
    connection.execute("PRAGMA foreign_keys = ON")
    connection.executescript(SCHEMA.read_text(encoding="utf-8"))
    return connection


def insert_base_scope(connection: sqlite3.Connection) -> None:
    connection.execute(
        """INSERT INTO app_profiles (
               id, display_name, created_at_ms, updated_at_ms, settings_json
           ) VALUES ('profile_a', 'Profile A', ?, ?, '{}')""",
        (CREATED_AT_MS, CREATED_AT_MS),
    )
    connection.execute(
        """INSERT INTO provider_profiles (
               id, profile_id, provider_type, display_name,
               normalized_base_url, auth_scheme, config_json,
               egress_policy_json, enabled, created_at_ms, updated_at_ms
           ) VALUES (
               'provider_a', 'profile_a', 'openai', 'Provider A',
               'https://example.invalid/v1', 'none', '{}', '{}', 1, ?, ?
           )""",
        (CREATED_AT_MS, CREATED_AT_MS),
    )
    for project_id, name in (("project_a", "Project A"), ("project_b", "Project B")):
        connection.execute(
            """INSERT INTO projects (
                   id, profile_id, name, created_at_ms, updated_at_ms,
                   metadata_json
               ) VALUES (?, 'profile_a', ?, ?, ?, '{}')""",
            (project_id, name, CREATED_AT_MS, CREATED_AT_MS),
        )
    connection.execute(
        """INSERT INTO conversations (
               id, profile_id, project_id, title, created_at_ms,
               updated_at_ms, metadata_json
           ) VALUES (
               'conversation_a', 'profile_a', 'project_a', 'Attachment contract',
               ?, ?, '{}'
           )""",
        (CREATED_AT_MS, CREATED_AT_MS),
    )
    connection.execute(
        """INSERT INTO conversation_branches (
               id, conversation_id, created_at_ms
           ) VALUES ('branch_a', 'conversation_a', ?)""",
        (CREATED_AT_MS,),
    )
    connection.execute(
        """UPDATE conversations
              SET active_branch_id = 'branch_a'
            WHERE id = 'conversation_a'"""
    )


def insert_run_graph(
    connection: sqlite3.Connection,
    suffix: str,
    user_sequence: int,
    assistant_sequence: int,
    parent_message_id: str | None = None,
) -> None:
    user_id = f"user_{suffix}"
    assistant_id = f"assistant_{suffix}"
    run_id = f"run_{suffix}"
    attempt_id = f"attempt_{suffix}"
    connection.execute(
        """INSERT INTO messages (
               id, conversation_id, branch_id, parent_message_id, role, status,
               sequence_no, content_json, content_text, created_at_ms,
               updated_at_ms, finalized_at_ms, metadata_json
           ) VALUES (
               ?, 'conversation_a', 'branch_a', ?, 'user', 'complete', ?,
               '[{"type":"text","text":"question"}]', 'question',
               ?, ?, ?, '{}'
           )""",
        (
            user_id,
            parent_message_id,
            user_sequence,
            CREATED_AT_MS,
            CREATED_AT_MS,
            CREATED_AT_MS,
        ),
    )
    connection.execute(
        """INSERT INTO messages (
               id, conversation_id, branch_id, parent_message_id, role, status,
               sequence_no, content_json, content_text, provider_profile_id,
               model_id, created_at_ms, updated_at_ms, metadata_json
           ) VALUES (
               ?, 'conversation_a', 'branch_a', ?, 'assistant', 'draft', ?,
               '[]', '', 'provider_a', 'model-a', ?, ?, '{}'
           )""",
        (assistant_id, user_id, assistant_sequence, CREATED_AT_MS, CREATED_AT_MS),
    )
    connection.execute(
        """INSERT INTO generations (
               id, conversation_id, branch_id, assistant_message_id,
               provider_profile_id, model_id, state, request_parameters_json,
               created_at_ms
           ) VALUES (
               ?, 'conversation_a', 'branch_a', ?, 'provider_a', 'model-a',
               'queued', '{}', ?
           )""",
        (run_id, assistant_id, CREATED_AT_MS),
    )
    connection.execute(
        """INSERT INTO run_attempts (
               id, generation_id, ordinal, provider_profile_id, model_id,
               state, accepted_by_provider, idempotency_supported, created_at_ms
           ) VALUES (?, ?, 1, 'provider_a', 'model-a', 'created', 'false', 0, ?)""",
        (attempt_id, run_id, CREATED_AT_MS),
    )
    connection.execute(
        """INSERT INTO frozen_provider_inputs (
               id, schema_version, attempt_id, run_id, provider_profile_id,
               model_id, messages_json, parameters_json, content_sha256,
               created_at_ms
           ) VALUES (
               ?, 1, ?, ?, 'provider_a', 'model-a',
               '[{"role":"user","content":"question"}]', '{}', ?, ?
           )""",
        (
            f"frozen_{suffix}",
            attempt_id,
            run_id,
            "f" * 64,
            CREATED_AT_MS,
        ),
    )


def insert_draft(
    connection: sqlite3.Connection,
    *,
    with_attachment: bool = True,
    expires_at_ms: int = EXPIRES_AT_MS,
) -> None:
    connection.execute(
        """INSERT INTO attachment_drafts (
               id, profile_id, project_id, conversation_id, branch_id, state,
               expires_at_ms, created_at_ms, updated_at_ms, metadata_json
           ) VALUES (
               'draft_a', 'profile_a', 'project_a', 'conversation_a',
               'branch_a', 'open', ?, ?, ?, '{}'
           )""",
        (expires_at_ms, CREATED_AT_MS, CREATED_AT_MS),
    )
    if not with_attachment:
        return
    blob_id = "a" * 64
    connection.execute(
        """INSERT INTO blob_objects (
               id, cipher_version, key_version, wrapped_dek, nonce, media_type,
               plaintext_size, ciphertext_size, storage_relpath, created_at_ms
           ) VALUES (
               ?, 1, 1, X'01', X'000000000000000000000000', 'text/plain',
               4, 20, 'v1/aa/attachment-contract', ?
           )""",
        (blob_id, CREATED_AT_MS),
    )
    connection.execute(
        """INSERT INTO attachments (
               id, profile_id, draft_id, blob_id, filename, media_type,
               byte_size, created_at_ms, metadata_json
           ) VALUES (
               'attachment_a', 'profile_a', 'draft_a', ?, 'fixture.txt',
               'text/plain', 4, ?, '{}'
           )""",
        (blob_id, CREATED_AT_MS),
    )


def fixture(
    *,
    with_attachment: bool = True,
    expires_at_ms: int = EXPIRES_AT_MS,
    second_run: bool = False,
) -> sqlite3.Connection:
    connection = new_database()
    insert_base_scope(connection)
    insert_run_graph(connection, "a", 0, 1)
    if second_run:
        insert_run_graph(connection, "b", 2, 3, parent_message_id="assistant_a")
    insert_draft(
        connection,
        with_attachment=with_attachment,
        expires_at_ms=expires_at_ms,
    )
    connection.commit()
    return connection


def bind_draft(
    connection: sqlite3.Connection,
    *,
    user_message_id: str = "user_a",
    run_id: str = "run_a",
    binding_key: str = "binding-a",
    bound_at_ms: int = BIND_AT_MS,
) -> None:
    connection.execute(
        """UPDATE attachment_drafts
              SET state = 'bound', binding_key = ?, bound_message_id = ?,
                  bound_run_id = ?, bound_at_ms = ?, updated_at_ms = ?
            WHERE id = 'draft_a'""",
        (binding_key, user_message_id, run_id, bound_at_ms, bound_at_ms),
    )


def expect_rejected(operation: Callable[[sqlite3.Connection], None], connection: sqlite3.Connection) -> None:
    connection.execute("SAVEPOINT attachment_contract_case")
    try:
        operation(connection)
    except sqlite3.DatabaseError:
        connection.execute("ROLLBACK TO attachment_contract_case")
        connection.execute("RELEASE attachment_contract_case")
        return
    connection.execute("ROLLBACK TO attachment_contract_case")
    connection.execute("RELEASE attachment_contract_case")
    raise AssertionError("SQLite accepted an attachment operation that must fail closed")


def empty_draft_cannot_bind() -> None:
    connection = fixture(with_attachment=False)
    expect_rejected(bind_draft, connection)


def expired_draft_cannot_bind() -> None:
    connection = fixture(expires_at_ms=BIND_AT_MS)
    expect_rejected(bind_draft, connection)


def draft_with_only_deleted_attachments_cannot_bind() -> None:
    connection = fixture()
    connection.execute(
        "UPDATE attachments SET deleted_at_ms = 1_200 WHERE id = 'attachment_a'"
    )
    expect_rejected(bind_draft, connection)


def bound_message_must_be_the_run_parent() -> None:
    connection = fixture(second_run=True)
    expect_rejected(
        lambda database: bind_draft(
            database,
            user_message_id="user_a",
            run_id="run_b",
        ),
        connection,
    )


def captured_project_scope_must_still_match() -> None:
    connection = fixture()
    connection.execute(
        "UPDATE conversations SET project_id = 'project_b' WHERE id = 'conversation_a'"
    )
    expect_rejected(bind_draft, connection)


def live_lineage_is_required() -> None:
    mutations = {
        "profile soft delete": (
            "UPDATE app_profiles SET deleted_at_ms = 1200 WHERE id = 'profile_a'",
            (),
        ),
        "project soft delete": (
            "UPDATE projects SET deleted_at_ms = 1200 WHERE id = 'project_a'",
            (),
        ),
        "conversation soft delete": (
            "UPDATE conversations SET deleted_at_ms = 1200 WHERE id = 'conversation_a'",
            (),
        ),
        "branch soft delete": (
            "UPDATE conversation_branches SET deleted_at_ms = 1200 WHERE id = 'branch_a'",
            (),
        ),
        "user message soft delete": (
            "UPDATE messages SET deleted_at_ms = 1200 WHERE id = 'user_a'",
            (),
        ),
        "user message is not complete": (
            "UPDATE messages SET status = 'failed', finalized_at_ms = 1200 WHERE id = 'user_a'",
            (),
        ),
        "assistant projection soft delete": (
            "UPDATE messages SET deleted_at_ms = 1200 WHERE id = 'assistant_a'",
            (),
        ),
        "assistant projection terminal": (
            "UPDATE messages SET status = 'complete', finalized_at_ms = 1200 WHERE id = 'assistant_a'",
            (),
        ),
        "run terminal": (
            "UPDATE generations SET state = 'complete', completed_at_ms = 1200 WHERE id = 'run_a'",
            (),
        ),
        "attempt no longer created": (
            "UPDATE run_attempts SET state = 'dispatching', started_at_ms = 1200 WHERE id = 'attempt_a'",
            (),
        ),
        "prepared attempt is missing": (
            "DELETE FROM run_attempts WHERE id = 'attempt_a'",
            (),
        ),
    }
    failures: list[str] = []
    for label, (statement, parameters) in mutations.items():
        connection = fixture()
        connection.execute(statement, parameters)
        try:
            expect_rejected(bind_draft, connection)
        except AssertionError as error:
            failures.append(f"{label}: {error}")
    if failures:
        raise AssertionError("; ".join(failures))


def terminalize_draft(connection: sqlite3.Connection, state: str) -> None:
    if state == "bound":
        bind_draft(connection)
        return
    if state == "abandoned":
        connection.execute(
            """UPDATE attachment_drafts
                  SET state = 'abandoned', abandoned_at_ms = ?, updated_at_ms = ?
                WHERE id = 'draft_a'""",
            (BIND_AT_MS, BIND_AT_MS),
        )
        return
    if state == "expired":
        connection.execute(
            """UPDATE attachment_drafts
                  SET state = 'expired', expired_at_ms = ?, updated_at_ms = ?
                WHERE id = 'draft_a'""",
            (EXPIRES_AT_MS, EXPIRES_AT_MS),
        )
        return
    raise AssertionError(f"unsupported terminal fixture state: {state}")


def terminal_draft_is_fully_immutable() -> None:
    mutations = {
        "metadata_json": ("metadata_json = '{\"tampered\":true}'", ()),
        "expires_at_ms": ("expires_at_ms = ?", (EXPIRES_AT_MS + 1_000,)),
        "created_at_ms": ("created_at_ms = ?", (CREATED_AT_MS - 1,)),
        "updated_at_ms": ("updated_at_ms = ?", (BIND_AT_MS + 1,)),
        "bound_at_ms": ("bound_at_ms = ?", (BIND_AT_MS + 1,)),
    }
    failures: list[str] = []
    for state in ("bound", "abandoned", "expired"):
        for label, (assignment, parameters) in mutations.items():
            connection = fixture()
            terminalize_draft(connection, state)
            connection.commit()
            try:
                expect_rejected(
                    lambda database, sql=assignment, values=parameters: database.execute(
                        f"UPDATE attachment_drafts SET {sql} WHERE id = 'draft_a'",
                        values,
                    ),
                    connection,
                )
            except AssertionError as error:
                failures.append(f"{state} field {label}: {error}")
    if failures:
        raise AssertionError("; ".join(failures))


def valid_bind_and_rehome_is_atomic_compatible() -> None:
    connection = fixture()
    connection.execute("BEGIN")
    bind_draft(connection)
    connection.execute(
        """UPDATE attachments
              SET draft_id = NULL, message_id = 'user_a', project_id = NULL
            WHERE id = 'attachment_a' AND draft_id = 'draft_a'"""
    )
    connection.commit()
    draft = connection.execute(
        """SELECT state, bound_message_id, bound_run_id
             FROM attachment_drafts WHERE id = 'draft_a'"""
    ).fetchone()
    owner = connection.execute(
        """SELECT draft_id, message_id, project_id
             FROM attachments WHERE id = 'attachment_a'"""
    ).fetchone()
    assert draft == ("bound", "user_a", "run_a"), draft
    assert owner == (None, "user_a", None), owner
    assert connection.execute("PRAGMA foreign_key_check").fetchall() == []
    assert connection.execute("PRAGMA quick_check").fetchone() == ("ok",)


CASES: tuple[tuple[str, Callable[[], None]], ...] = (
    ("empty draft bind denial", empty_draft_cannot_bind),
    ("expired draft bind denial", expired_draft_cannot_bind),
    ("deleted-only draft bind denial", draft_with_only_deleted_attachments_cannot_bind),
    ("exact message-to-run relationship", bound_message_must_be_the_run_parent),
    ("captured project scope revalidation", captured_project_scope_must_still_match),
    ("live lifecycle lineage", live_lineage_is_required),
    ("terminal draft immutability", terminal_draft_is_fully_immutable),
    ("valid atomic-compatible bind and re-home", valid_bind_and_rehome_is_atomic_compatible),
)


def main() -> None:
    failures: list[str] = []
    for name, case in CASES:
        try:
            case()
        except Exception as error:  # Keep all contract failures visible in one run.
            failures.append(f"{name}: {error}")

    if failures:
        formatted = "\n".join(f"  - {failure}" for failure in failures)
        raise SystemExit(f"Attachment schema contract FAILED:\n{formatted}")

    print(f"SQLite {sqlite3.sqlite_version}")
    print(f"Attachment schema contract OK: {len(CASES)} invariant groups")


if __name__ == "__main__":
    main()
