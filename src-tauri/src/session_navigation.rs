//! Metadata-only session navigation, independent from transcripts and app state.
//! Writes use an exact revision so concurrent windows cannot silently replace
//! another window's ordered tab list. Missing/deleted sessions are pruned on
//! load, while saves reject them to avoid reviving stale session references.

use std::collections::HashSet;

use rusqlite::{params, Connection, OptionalExtension, TransactionBehavior};
use serde::{Deserialize, Serialize};
use tauri::State;

use crate::{
    error::{NativeError, NativeResult},
    harness_bridge::HarnessHub,
    harness_store::HarnessStore,
};

const MAX_OPEN_SESSIONS: usize = 256;
const MAX_SAFE_NAVIGATION_REVISION: i64 = (1_i64 << 53) - 1;

#[derive(Clone, Debug, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AgentSessionNavigationSnapshot {
    pub schema_version: u32,
    pub revision: i64,
    pub open_ids: Vec<String>,
    pub active_id: Option<String>,
    pub updated_at_ms: i64,
}

impl Default for AgentSessionNavigationSnapshot {
    fn default() -> Self {
        Self {
            schema_version: 1,
            revision: 0,
            open_ids: Vec::new(),
            active_id: None,
            updated_at_ms: 0,
        }
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct SaveAgentSessionNavigationRequest {
    pub expected_revision: i64,
    pub open_ids: Vec<String>,
    pub active_id: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentSessionNavigationLoad {
    pub snapshot: AgentSessionNavigationSnapshot,
    pub receipt_id: String,
}

#[derive(Debug, Serialize)]
#[serde(tag = "status", rename_all = "camelCase")]
pub enum AgentSessionNavigationSave {
    Saved {
        snapshot: AgentSessionNavigationSnapshot,
        #[serde(rename = "receiptId")]
        receipt_id: String,
    },
    Conflict {
        snapshot: AgentSessionNavigationSnapshot,
        #[serde(rename = "receiptId")]
        receipt_id: String,
    },
}

fn new_receipt_id() -> String {
    format!("session_navigation_{}", uuid::Uuid::new_v4().simple())
}

/// Return the immutable receipt for the current projection.  Revision zero is
/// the empty state and has a stable synthetic identity because no mutation has
/// been committed yet.  Receipts for revisions written by older builds are
/// created by the HarnessStore schema bootstrap migration.
fn current_receipt_id(connection: &Connection, revision: i64) -> NativeResult<String> {
    if revision == 0 {
        return Ok("session_navigation_empty".to_owned());
    }
    connection
        .query_row(
            "SELECT receipt_id FROM agent_session_navigation_receipts WHERE revision = ?1",
            [revision],
            |row| row.get(0),
        )
        .optional()?
        .ok_or_else(|| {
            NativeError::new(
                "session_navigation_receipt_missing",
                "The durable navigation receipt is missing for the current revision",
            )
        })
}

fn validate_navigation(open_ids: &[String], active_id: Option<&str>) -> NativeResult<()> {
    if open_ids.len() > MAX_OPEN_SESSIONS {
        return Err(NativeError::invalid(
            "openIds",
            "contains more than 256 sessions",
        ));
    }
    let mut unique = HashSet::new();
    for id in open_ids {
        if id.trim() != id || id.is_empty() || id.len() > 200 || id.chars().any(char::is_control) {
            return Err(NativeError::invalid(
                "openIds",
                "contains an invalid session ID",
            ));
        }
        if !unique.insert(id.as_str()) {
            return Err(NativeError::invalid(
                "openIds",
                "contains a duplicate session ID",
            ));
        }
    }
    if active_id.is_some_and(|id| !unique.contains(id)) {
        return Err(NativeError::invalid(
            "activeId",
            "must reference an open session",
        ));
    }
    Ok(())
}

fn read_snapshot(connection: &Connection) -> NativeResult<AgentSessionNavigationSnapshot> {
    let row: Option<(i64, String)> = connection
        .query_row(
            "SELECT revision, snapshot_json FROM agent_session_navigation WHERE singleton = 1",
            [],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .optional()?;
    let Some((revision, raw)) = row else {
        return Ok(AgentSessionNavigationSnapshot::default());
    };
    if raw.len() > 128 * 1024 {
        return Err(NativeError::new(
            "session_navigation_invalid",
            "The stored navigation snapshot exceeds its safety limit",
        ));
    }
    let mut snapshot: AgentSessionNavigationSnapshot =
        serde_json::from_str(&raw).map_err(|_| {
            NativeError::new(
                "session_navigation_invalid",
                "The stored navigation snapshot is invalid",
            )
        })?;
    if snapshot.schema_version != 1
        || revision <= 0
        || revision > MAX_SAFE_NAVIGATION_REVISION
        || snapshot.revision != revision
        || snapshot.updated_at_ms <= 0
    {
        return Err(NativeError::new(
            "session_navigation_invalid",
            "The stored navigation snapshot has invalid revision metadata",
        ));
    }
    validate_navigation(&snapshot.open_ids, snapshot.active_id.as_deref())?;
    let mut exists =
        connection.prepare("SELECT EXISTS(SELECT 1 FROM agent_sessions WHERE id = ?1)")?;
    let mut retained = Vec::new();
    for id in snapshot.open_ids {
        if exists.query_row([&id], |row| row.get::<_, bool>(0))? {
            retained.push(id);
        }
    }
    snapshot.open_ids = retained;
    if snapshot
        .active_id
        .as_ref()
        .is_some_and(|id| !snapshot.open_ids.contains(id))
    {
        snapshot.active_id = None;
    }
    Ok(snapshot)
}

impl HarnessStore {
    pub fn load_session_navigation(&self) -> NativeResult<AgentSessionNavigationLoad> {
        let connection = self.lock()?;
        let snapshot = read_snapshot(&connection)?;
        Ok(AgentSessionNavigationLoad {
            receipt_id: current_receipt_id(&connection, snapshot.revision)?,
            snapshot,
        })
    }

    pub fn save_session_navigation(
        &self,
        request: SaveAgentSessionNavigationRequest,
    ) -> NativeResult<AgentSessionNavigationSave> {
        if request.expected_revision < 0 {
            return Err(NativeError::invalid(
                "expectedRevision",
                "must be a non-negative revision",
            ));
        }
        validate_navigation(&request.open_ids, request.active_id.as_deref())?;
        let mut connection = self.lock()?;
        let tx = connection.transaction_with_behavior(TransactionBehavior::Immediate)?;
        let current = read_snapshot(&tx)?;
        if current.revision != request.expected_revision {
            let revision = current.revision;
            return Ok(AgentSessionNavigationSave::Conflict {
                snapshot: current,
                receipt_id: current_receipt_id(&tx, revision)?,
            });
        }
        for id in &request.open_ids {
            let exists: bool = tx.query_row(
                "SELECT EXISTS(SELECT 1 FROM agent_sessions WHERE id = ?1)",
                [id],
                |row| row.get(0),
            )?;
            if !exists {
                return Err(NativeError::new(
                    "agent_session_not_found",
                    "Navigation contains a session that no longer exists",
                ));
            }
        }
        let revision = current
            .revision
            .checked_add(1)
            .filter(|value| *value <= MAX_SAFE_NAVIGATION_REVISION)
            .ok_or_else(|| {
                NativeError::new(
                    "session_navigation_revision_exhausted",
                    "The navigation revision cannot advance",
                )
            })?;
        let snapshot = AgentSessionNavigationSnapshot {
            schema_version: 1,
            revision,
            open_ids: request.open_ids,
            active_id: request.active_id,
            updated_at_ms: chrono::Utc::now().timestamp_millis(),
        };
        let raw = serde_json::to_string(&snapshot).map_err(|_| {
            NativeError::new(
                "session_navigation_invalid",
                "Navigation could not be serialized",
            )
        })?;
        let receipt_id = new_receipt_id();
        tx.execute(
            "INSERT INTO agent_session_navigation_receipts
                (receipt_id, revision, snapshot_json) VALUES (?1, ?2, ?3)",
            params![receipt_id, revision, raw],
        )?;
        tx.execute(
            "INSERT INTO agent_session_navigation (singleton, revision, snapshot_json) VALUES (1, ?1, ?2)
             ON CONFLICT(singleton) DO UPDATE SET revision = excluded.revision, snapshot_json = excluded.snapshot_json",
            params![revision, raw],
        )?;
        tx.commit()?;
        Ok(AgentSessionNavigationSave::Saved {
            snapshot,
            receipt_id,
        })
    }
}

#[tauri::command]
pub fn agent_session_navigation_load(
    hub: State<'_, HarnessHub>,
) -> NativeResult<AgentSessionNavigationLoad> {
    hub.store().load_session_navigation()
}

#[tauri::command]
pub fn agent_session_navigation_save(
    hub: State<'_, HarnessHub>,
    request: SaveAgentSessionNavigationRequest,
) -> NativeResult<AgentSessionNavigationSave> {
    hub.store().save_session_navigation(request)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::harness_store::AgentSessionSummary;
    use omnia_harness::permission::PermissionMode;

    fn seed(store: &HarnessStore, id: &str) {
        store
            .save_summary(&AgentSessionSummary {
                id: id.to_owned(),
                title: id.to_owned(),
                cwd: "D:/project".to_owned(),
                profile_id: "p".to_owned(),
                model: "m".to_owned(),
                permission_mode: PermissionMode::default(),
                rules: vec![],
                reasoning_effort: None,
                fallback_models: vec![],
                token_budget: None,
                tokens_used: 0,
                system_prompt: None,
                parent_id: None,
                settings_revision: 1,
                message_count: 0,
                created_at_ms: 1,
                updated_at_ms: 1,
            })
            .unwrap();
    }

    fn request(
        revision: i64,
        ids: &[&str],
        active: Option<&str>,
    ) -> SaveAgentSessionNavigationRequest {
        SaveAgentSessionNavigationRequest {
            expected_revision: revision,
            open_ids: ids.iter().map(|id| (*id).to_owned()).collect(),
            active_id: active.map(str::to_owned),
        }
    }

    #[test]
    fn navigation_is_ordered_durable_and_cas_protected() {
        let path =
            std::env::temp_dir().join(format!("omnia-navigation-{}.sqlite", uuid::Uuid::new_v4()));
        {
            let store = HarnessStore::open(&path).unwrap();
            seed(&store, "a");
            seed(&store, "b");
            assert_eq!(
                store.load_session_navigation().unwrap().snapshot.revision,
                0
            );
            assert_eq!(
                store.load_session_navigation().unwrap().receipt_id,
                "session_navigation_empty"
            );
            assert!(matches!(
                store
                    .save_session_navigation(request(0, &["b", "a"], Some("a")))
                    .unwrap(),
                AgentSessionNavigationSave::Saved { .. }
            ));
            let first_receipt = match store
                .save_session_navigation(request(1, &["b", "a"], Some("a")))
                .unwrap()
            {
                AgentSessionNavigationSave::Saved { receipt_id, .. } => receipt_id,
                AgentSessionNavigationSave::Conflict { .. } => panic!("expected saved receipt"),
            };
            assert_ne!(first_receipt, "session_navigation_empty");
            assert_eq!(
                store.load_session_navigation().unwrap().receipt_id,
                first_receipt
            );
            assert!(matches!(
                store
                    .save_session_navigation(request(1, &["a"], Some("a")))
                    .unwrap(),
                AgentSessionNavigationSave::Conflict { receipt_id, .. } if receipt_id == first_receipt
            ));
        }
        let store = HarnessStore::open(&path).unwrap();
        let loaded = store.load_session_navigation().unwrap();
        assert_eq!(loaded.snapshot.open_ids, ["b", "a"]);
        assert_eq!(loaded.snapshot.active_id.as_deref(), Some("a"));
        assert_eq!(loaded.snapshot.revision, 2);
        drop(store);
        std::fs::remove_file(path).unwrap();
    }

    #[test]
    fn navigation_rejects_stale_unknown_duplicate_and_unbound_ids() {
        let store = HarnessStore::in_memory().unwrap();
        seed(&store, "a");
        for invalid in [
            request(-1, &["a"], None),
            request(0, &["missing"], None),
            request(0, &["a", "a"], None),
            request(0, &["a"], Some("missing")),
            request(0, &[" a"], None),
        ] {
            assert!(store.save_session_navigation(invalid).is_err());
        }
        assert_eq!(
            store.load_session_navigation().unwrap().snapshot.revision,
            0
        );
        assert!(serde_json::from_value::<SaveAgentSessionNavigationRequest>(
            serde_json::json!({"expectedRevision":0,"openIds":[],"activeId":null,"runId":"forged"})
        )
        .is_err());
    }

    #[test]
    fn deleted_sessions_are_pruned_without_reviving_them() {
        let store = HarnessStore::in_memory().unwrap();
        seed(&store, "a");
        seed(&store, "b");
        store
            .save_session_navigation(request(0, &["b", "a"], Some("b")))
            .unwrap();
        store.delete("b").unwrap();
        let loaded = store.load_session_navigation().unwrap().snapshot;
        assert_eq!(loaded.open_ids, ["a"]);
        assert_eq!(loaded.active_id, None);
        assert_eq!(loaded.revision, 1);
        assert!(store
            .save_session_navigation(request(1, &["b"], None))
            .is_err());
        assert!(matches!(
            store
                .save_session_navigation(request(1, &[], None))
                .unwrap(),
            AgentSessionNavigationSave::Saved { .. }
        ));
    }
}
