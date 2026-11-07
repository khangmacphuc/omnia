use keyring::{Entry, Error as KeyringError};
use serde::Serialize;
use uuid::Uuid;
use zeroize::Zeroizing;

use crate::error::{NativeError, NativeResult};

const SERVICE_NAME: &str = "ai.omnia.desktop.provider";
const MAX_SECRET_BYTES: usize = 16 * 1024;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum SecretPurpose {
    ProviderCredential,
}

impl SecretPurpose {
    fn reference_prefix(self) -> &'static str {
        match self {
            Self::ProviderCredential => "provider_secret_",
        }
    }
}

#[derive(Clone, Copy, Debug, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum SecretStatus {
    Present,
    Missing,
    #[allow(dead_code)]
    Locked,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SecretReceipt {
    pub secret_ref: String,
    pub status: SecretStatus,
}

#[derive(Default)]
pub struct SecretBroker;

impl SecretBroker {
    pub fn put(&self, purpose: SecretPurpose, secret: String) -> NativeResult<SecretReceipt> {
        let secret = validate_secret(secret)?;
        let secret_ref = format!("{}{}", purpose.reference_prefix(), Uuid::new_v4().simple());
        let entry = entry(&secret_ref)?;
        entry
            .set_password(secret.as_str())
            .map_err(map_write_error)?;
        Ok(SecretReceipt {
            secret_ref,
            status: SecretStatus::Present,
        })
    }

    #[allow(dead_code)]
    pub fn replace(
        &self,
        purpose: SecretPurpose,
        secret_ref: &str,
        secret: String,
    ) -> NativeResult<SecretReceipt> {
        validate_secret_ref(secret_ref, purpose)?;
        let secret = validate_secret(secret)?;
        let entry = entry(secret_ref)?;
        entry
            .set_password(secret.as_str())
            .map_err(map_write_error)?;
        Ok(SecretReceipt {
            secret_ref: secret_ref.to_owned(),
            status: SecretStatus::Present,
        })
    }

    #[allow(dead_code)]
    pub fn probe(&self, purpose: SecretPurpose, secret_ref: &str) -> NativeResult<SecretStatus> {
        validate_secret_ref(secret_ref, purpose)?;
        let entry = entry(secret_ref)?;
        match entry.get_password() {
            Ok(secret) => {
                let _secret = Zeroizing::new(secret);
                Ok(SecretStatus::Present)
            }
            Err(KeyringError::NoEntry) => Ok(SecretStatus::Missing),
            Err(KeyringError::NoStorageAccess(_)) => Ok(SecretStatus::Locked),
            Err(error) => Err(map_read_error(error)),
        }
    }

    pub fn delete(&self, purpose: SecretPurpose, secret_ref: &str) -> NativeResult<bool> {
        validate_secret_ref(secret_ref, purpose)?;
        let entry = entry(secret_ref)?;
        match entry.delete_credential() {
            Ok(()) => Ok(true),
            Err(KeyringError::NoEntry) => Ok(false),
            Err(error) => Err(map_write_error(error)),
        }
    }

    pub fn with_secret<T>(
        &self,
        purpose: SecretPurpose,
        secret_ref: &str,
        operation: impl FnOnce(&str) -> NativeResult<T>,
    ) -> NativeResult<T> {
        validate_secret_ref(secret_ref, purpose)?;
        let entry = entry(secret_ref)?;
        let secret = Zeroizing::new(entry.get_password().map_err(map_read_error)?);
        operation(secret.as_str())
    }
}

fn entry(secret_ref: &str) -> NativeResult<Entry> {
    Entry::new(SERVICE_NAME, secret_ref).map_err(|_| {
        NativeError::new(
            "vault_unavailable",
            "Windows Credential Manager is unavailable",
        )
    })
}

fn validate_secret(secret: String) -> NativeResult<Zeroizing<String>> {
    let secret = Zeroizing::new(secret);
    if secret.trim().is_empty() {
        return Err(NativeError::invalid("secret", "cannot be empty"));
    }
    if secret.len() > MAX_SECRET_BYTES {
        return Err(NativeError::invalid("secret", "is too large"));
    }
    Ok(secret)
}

fn validate_secret_ref(secret_ref: &str, purpose: SecretPurpose) -> NativeResult<()> {
    let valid = secret_ref
        .strip_prefix(purpose.reference_prefix())
        .is_some_and(|suffix| {
            suffix.len() == 32 && suffix.bytes().all(|byte| byte.is_ascii_hexdigit())
        });
    if valid {
        Ok(())
    } else {
        Err(NativeError::invalid("secretRef", "is malformed"))
    }
}

fn map_write_error(error: KeyringError) -> NativeError {
    match error {
        KeyringError::NoStorageAccess(_) => NativeError::retryable(
            "vault_locked",
            "Windows Credential Manager is locked or unavailable",
        ),
        _ => NativeError::new(
            "vault_failed",
            "Windows Credential Manager rejected the operation",
        ),
    }
}

fn map_read_error(error: KeyringError) -> NativeError {
    match error {
        KeyringError::NoEntry => {
            NativeError::new("secret_missing", "The saved credential is missing")
        }
        KeyringError::NoStorageAccess(_) => NativeError::retryable(
            "vault_locked",
            "Windows Credential Manager is locked or unavailable",
        ),
        _ => NativeError::new(
            "vault_failed",
            "Windows Credential Manager rejected the operation",
        ),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn secret_refs_are_opaque_purpose_bound_and_strict() {
        assert!(validate_secret_ref(
            "provider_secret_0123456789abcdef0123456789abcdef",
            SecretPurpose::ProviderCredential,
        )
        .is_ok());
        assert!(validate_secret_ref("raw-api-key", SecretPurpose::ProviderCredential).is_err());
        assert!(validate_secret_ref("secret_short", SecretPurpose::ProviderCredential).is_err());
    }

    #[test]
    fn secrets_have_bounded_nonempty_input() {
        assert!(validate_secret("  ".into()).is_err());
        assert!(validate_secret("token".into()).is_ok());
        assert!(validate_secret("x".repeat(MAX_SECRET_BYTES + 1)).is_err());
    }
}
