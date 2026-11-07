#!/usr/bin/env node
/**
 * Dependency-free validator for the machine-readable source ledger.
 *
 * This checks shape, stable identity, path safety, local-file integrity, and
 * source-class/locator compatibility. It deliberately does not make network
 * requests: URL reachability is a separate, explicitly recorded observation.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.resolve(SCRIPT_DIR, "../../..");
const DEFAULT_LEDGER = path.join(DEFAULT_ROOT, "docs", "omnia-ultra", "delivery", "source-ledger.json");
const SOURCE_CLASSES = new Set([
  "internal-research",
  "normative-contract",
  "informative-register",
  "pinned-repository",
  "official-documentation",
]);
const LOCATOR_KIND_FOR_CLASS = new Map([
  ["internal-research", "local-file"],
  ["normative-contract", "local-file"],
  ["informative-register", "local-file"],
  ["pinned-repository", "repository"],
  ["official-documentation", "url"],
]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
const HASH_RE = /^[a-f0-9]{64}$/;
const SOURCE_ID_RE = /^src\.[a-z0-9][a-z0-9.-]{1,191}$/;
const LEDGER_ID_RE = /^OMNIA-[A-Z0-9-]+$/;
const REVISION_RE = /^\d{4}-\d{2}-\d{2}\.\d+$/;

function parseArgs(argv) {
  const values = argv.slice(2);
  const readArg = (flag, fallback) => {
    const index = values.indexOf(flag);
    return index >= 0 && values[index + 1] ? path.resolve(values[index + 1]) : fallback;
  };
  return {
    json: values.includes("--json"),
    check: values.includes("--check") || !values.includes("--report"),
    root: readArg("--root", DEFAULT_ROOT),
    ledger: readArg("--ledger", DEFAULT_LEDGER),
  };
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function add(errors, code, message, details = {}) {
  errors.push({ code, message, ...details });
}

function readJson(file, errors) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    add(errors, "invalid-json", `cannot read source ledger JSON: ${error.message}`, { file });
    return null;
  }
}

function checkUnknownFields(record, allowed, label, errors) {
  if (!isObject(record)) return;
  for (const key of Object.keys(record)) {
    if (!allowed.has(key)) add(errors, "unknown-field", `${label} contains unsupported field ${key}`, { label, field: key });
  }
}

function checkRequiredFields(record, required, label, errors) {
  if (!isObject(record)) {
    add(errors, "invalid-object", `${label} must be an object`, { label });
    return;
  }
  for (const field of required) {
    if (!(field in record)) add(errors, "missing-field", `${label} is missing required field ${field}`, { label, field });
  }
}

function checkString(value, label, errors, { min = 1 } = {}) {
  if (typeof value !== "string" || value.trim().length < min) add(errors, "invalid-string", `${label} must be a non-empty string`, { label });
}

function checkDate(value, label, errors) {
  if (typeof value !== "string" || !DATE_RE.test(value) || Number.isNaN(Date.parse(value))) {
    add(errors, "invalid-date", `${label} must be a UTC ISO-8601 date-time`, { label, value });
  }
}

function checkUniqueStrings(value, label, errors) {
  if (!Array.isArray(value)) {
    add(errors, "invalid-array", `${label} must be an array`, { label });
    return;
  }
  const seen = new Set();
  for (const item of value) {
    checkString(item, `${label}[]`, errors);
    if (seen.has(item)) add(errors, "duplicate-value", `${label} contains a duplicate value`, { label, value: item });
    seen.add(item);
  }
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function validateScope(scope, errors) {
  const label = "scope";
  checkRequiredFields(scope, ["purpose", "authority", "notEvidenceOf"], label, errors);
  checkUnknownFields(scope, new Set(["purpose", "authority", "notEvidenceOf"]), label, errors);
  checkString(scope?.purpose, `${label}.purpose`, errors);
  checkString(scope?.authority, `${label}.authority`, errors);
  checkUniqueStrings(scope?.notEvidenceOf, `${label}.notEvidenceOf`, errors);
}

function validatePolicy(policy, errors) {
  const label = "policy";
  checkRequiredFields(policy, ["sourceClasses", "hashAlgorithm", "localFileHashMode", "urlReachability", "crosswalk"], label, errors);
  checkUnknownFields(policy, new Set(["sourceClasses", "hashAlgorithm", "localFileHashMode", "urlReachability", "crosswalk"]), label, errors);
  checkUniqueStrings(policy?.sourceClasses, `${label}.sourceClasses`, errors);
  if (policy?.hashAlgorithm !== "sha256") add(errors, "invalid-policy", `${label}.hashAlgorithm must be sha256`, { label });
  if (!["current-content", "historical-content", "not-collected"].includes(policy?.localFileHashMode)) add(errors, "invalid-policy", `${label}.localFileHashMode is invalid`, { label });
  if (!["not-checked", "checked", "partially-checked"].includes(policy?.urlReachability)) add(errors, "invalid-policy", `${label}.urlReachability is invalid`, { label });
  checkString(policy?.crosswalk, `${label}.crosswalk`, errors);
  for (const sourceClass of policy?.sourceClasses || []) {
    if (!SOURCE_CLASSES.has(sourceClass)) add(errors, "invalid-source-class", `policy lists unsupported source class ${sourceClass}`, { sourceClass });
  }
}

function validateCrosswalk(crosswalk, errors) {
  const label = "crosswalk";
  checkRequiredFields(crosswalk, ["status", "requirementToSourceMappings", "note"], label, errors);
  checkUnknownFields(crosswalk, new Set(["status", "requirementToSourceMappings", "note"]), label, errors);
  if (!["not-started", "partial", "complete"].includes(crosswalk?.status)) add(errors, "invalid-crosswalk-status", `${label}.status is invalid`, { status: crosswalk?.status });
  if (!Array.isArray(crosswalk?.requirementToSourceMappings)) add(errors, "invalid-array", `${label}.requirementToSourceMappings must be an array`, { label });
  checkString(crosswalk?.note, `${label}.note`, errors);
}

function validateLocator(locator, sourceClass, label, root, errors) {
  if (!isObject(locator)) {
    add(errors, "invalid-locator", `${label} must be an object`, { label });
    return;
  }
  const expectedKind = LOCATOR_KIND_FOR_CLASS.get(sourceClass);
  if (locator.kind !== expectedKind) add(errors, "locator-class-mismatch", `${label}.kind must be ${expectedKind} for ${sourceClass}`, { label, sourceClass, kind: locator.kind });
  if (locator.kind === "local-file") {
    checkUnknownFields(locator, new Set(["kind", "path", "section"]), label, errors);
    checkString(locator.path, `${label}.path`, errors);
    checkString(locator.section, `${label}.section`, errors);
    const relativePath = String(locator.path || "");
    if (path.isAbsolute(relativePath) || /^[A-Za-z]:/.test(relativePath) || relativePath.split(/[\\/]/).includes("..")) {
      add(errors, "unsafe-local-path", `${label}.path must be repository-relative and traversal-free`, { label, path: relativePath });
      return;
    }
    const normalized = relativePath.replaceAll("\\", "/");
    if (normalized !== relativePath) add(errors, "non-canonical-local-path", `${label}.path must use forward slashes`, { label, path: relativePath });
    const file = path.resolve(root, normalized);
    if (!file.startsWith(`${path.resolve(root)}${path.sep}`) && file !== path.resolve(root)) add(errors, "local-path-escape", `${label}.path escapes repository root`, { label, path: relativePath });
    if (!fs.existsSync(file)) add(errors, "missing-local-source", `${label}.path does not exist`, { label, path: relativePath });
  } else if (locator.kind === "url") {
    checkUnknownFields(locator, new Set(["kind", "url", "section"]), label, errors);
    checkString(locator.url, `${label}.url`, errors);
    checkString(locator.section, `${label}.section`, errors);
    if (typeof locator.url !== "string" || !/^https:\/\/[^\s]+$/.test(locator.url)) add(errors, "invalid-url", `${label}.url must be HTTPS`, { label, url: locator.url });
  } else if (locator.kind === "repository") {
    checkUnknownFields(locator, new Set(["kind", "repository", "revision", "section"]), label, errors);
    checkString(locator.repository, `${label}.repository`, errors);
    checkString(locator.section, `${label}.section`, errors);
    checkRequiredFields(locator.revision, ["type", "value"], `${label}.revision`, errors);
    checkUnknownFields(locator.revision, new Set(["type", "value"]), `${label}.revision`, errors);
    if (locator.revision?.type !== "git-commit") add(errors, "invalid-revision-type", `${label}.revision.type must be git-commit for pinned sources`, { label });
    if (typeof locator.revision?.value !== "string" || !/^[a-f0-9]{40}$/i.test(locator.revision.value)) add(errors, "invalid-revision", `${label}.revision.value must be a 40-character commit`, { label, value: locator.revision?.value });
  } else {
    add(errors, "unsupported-locator-kind", `${label}.kind is unsupported`, { label, kind: locator.kind });
  }
}

function validateReview(review, label, errors) {
  checkRequiredFields(review, ["reviewedAt", "freshness", "retrievalStatus", "notes"], label, errors);
  checkUnknownFields(review, new Set(["reviewedAt", "retrievedAt", "freshness", "retrievalStatus", "notes"]), label, errors);
  checkDate(review?.reviewedAt, `${label}.reviewedAt`, errors);
  if (review?.retrievedAt !== undefined) checkDate(review.retrievedAt, `${label}.retrievedAt`, errors);
  if (!["current", "historical", "stale", "unknown"].includes(review?.freshness)) add(errors, "invalid-freshness", `${label}.freshness is invalid`, { label, freshness: review?.freshness });
  if (!["verified", "documented-only", "not-checked", "unreachable"].includes(review?.retrievalStatus)) add(errors, "invalid-retrieval-status", `${label}.retrievalStatus is invalid`, { label, retrievalStatus: review?.retrievalStatus });
  checkString(review?.notes, `${label}.notes`, errors);
}

function validateIntegrity(integrity, locator, label, root, errors) {
  if (integrity === undefined) {
    if (locator?.kind === "local-file") add(errors, "missing-integrity", `${label} local files must declare a SHA-256 content hash`, { label });
    return;
  }
  checkRequiredFields(integrity, ["algorithm", "contentHash"], label, errors);
  checkUnknownFields(integrity, new Set(["algorithm", "contentHash"]), label, errors);
  if (integrity?.algorithm !== "sha256") add(errors, "invalid-integrity-algorithm", `${label}.algorithm must be sha256`, { label });
  if (typeof integrity?.contentHash !== "string" || !HASH_RE.test(integrity.contentHash)) add(errors, "invalid-content-hash", `${label}.contentHash must be a lowercase SHA-256 digest`, { label });
  if (locator?.kind === "local-file" && HASH_RE.test(integrity?.contentHash || "")) {
    const file = path.resolve(root, locator.path);
    if (fs.existsSync(file)) {
      let stat;
      try {
        stat = fs.statSync(file);
      } catch (error) {
        add(errors, "unreadable-local-source", `${label} local source cannot be inspected`, {
          label,
          path: locator.path,
          reason: error instanceof Error ? error.message : String(error),
        });
        return;
      }
      if (!stat.isFile()) {
        add(errors, "non-regular-local-source", `${label} local source must be a regular file`, {
          label,
          path: locator.path,
        });
        return;
      }
      let actual;
      try {
        actual = sha256(file);
      } catch (error) {
        add(errors, "unreadable-local-source", `${label} local source cannot be hashed`, {
          label,
          path: locator.path,
          reason: error instanceof Error ? error.message : String(error),
        });
        return;
      }
      if (actual !== integrity.contentHash) add(errors, "content-hash-mismatch", `${label}.contentHash does not match the local file`, { label, expected: integrity.contentHash, actual, path: locator.path });
    }
  }
}

function validateSource(source, index, root, ids, errors) {
  const label = `sources[${index}]`;
  checkRequiredFields(source, ["sourceId", "title", "sourceClass", "locator", "review", "evidenceBoundary", "crosswalk"], label, errors);
  checkUnknownFields(source, new Set(["sourceId", "title", "sourceClass", "locator", "review", "integrity", "evidenceBoundary", "crosswalk"]), label, errors);
  if (typeof source?.sourceId !== "string" || !SOURCE_ID_RE.test(source.sourceId)) add(errors, "invalid-source-id", `${label}.sourceId is not stable`, { label, sourceId: source?.sourceId });
  if (ids.has(source?.sourceId)) add(errors, "duplicate-source-id", `${label}.sourceId is duplicated`, { label, sourceId: source?.sourceId });
  ids.add(source?.sourceId);
  checkString(source?.title, `${label}.title`, errors);
  if (!SOURCE_CLASSES.has(source?.sourceClass)) add(errors, "invalid-source-class", `${label}.sourceClass is invalid`, { label, sourceClass: source?.sourceClass });
  validateLocator(source?.locator, source?.sourceClass, `${label}.locator`, root, errors);
  validateReview(source?.review, `${label}.review`, errors);
  validateIntegrity(source?.integrity, source?.locator, `${label}.integrity`, root, errors);

  const boundary = source?.evidenceBoundary;
  checkRequiredFields(boundary, ["classification", "limitations"], `${label}.evidenceBoundary`, errors);
  checkUnknownFields(boundary, new Set(["classification", "limitations"]), `${label}.evidenceBoundary`, errors);
  checkString(boundary?.classification, `${label}.evidenceBoundary.classification`, errors);
  checkUniqueStrings(boundary?.limitations, `${label}.evidenceBoundary.limitations`, errors);

  const crosswalk = source?.crosswalk;
  checkRequiredFields(crosswalk, ["status", "claimIds", "requirementIds", "capabilityIds", "evidenceIds"], `${label}.crosswalk`, errors);
  checkUnknownFields(crosswalk, new Set(["status", "claimIds", "requirementIds", "capabilityIds", "evidenceIds"]), `${label}.crosswalk`, errors);
  if (!["mapped", "partially-mapped", "unmapped"].includes(crosswalk?.status)) add(errors, "invalid-source-crosswalk-status", `${label}.crosswalk.status is invalid`, { label });
  for (const field of ["claimIds", "requirementIds", "capabilityIds", "evidenceIds"]) checkUniqueStrings(crosswalk?.[field], `${label}.crosswalk.${field}`, errors);
}

function validateLedger(ledger, root) {
  const errors = [];
  checkRequiredFields(ledger, ["$schema", "schemaVersion", "ledgerId", "ledgerRevision", "title", "status", "lastReviewedAt", "scope", "policy", "crosswalk", "sources"], "ledger", errors);
  checkUnknownFields(ledger, new Set(["$schema", "schemaVersion", "ledgerId", "ledgerRevision", "title", "status", "lastReviewedAt", "scope", "policy", "crosswalk", "sources"]), "ledger", errors);
  if (ledger?.schemaVersion !== 1) add(errors, "unsupported-schema", "ledger.schemaVersion must be 1", { value: ledger?.schemaVersion });
  if (typeof ledger?.ledgerId !== "string" || !LEDGER_ID_RE.test(ledger.ledgerId)) add(errors, "invalid-ledger-id", "ledger.ledgerId is invalid", { value: ledger?.ledgerId });
  if (typeof ledger?.ledgerRevision !== "string" || !REVISION_RE.test(ledger.ledgerRevision)) add(errors, "invalid-ledger-revision", "ledger.ledgerRevision is invalid", { value: ledger?.ledgerRevision });
  checkString(ledger?.title, "ledger.title", errors);
  if (!["research-ledger", "current", "superseded", "archived"].includes(ledger?.status)) add(errors, "invalid-ledger-status", "ledger.status is invalid", { value: ledger?.status });
  checkDate(ledger?.lastReviewedAt, "ledger.lastReviewedAt", errors);
  validateScope(ledger?.scope, errors);
  validatePolicy(ledger?.policy, errors);
  validateCrosswalk(ledger?.crosswalk, errors);
  if (!Array.isArray(ledger?.sources) || ledger.sources.length < 1) {
    add(errors, "invalid-sources", "ledger.sources must contain at least one source", {});
  } else {
    const ids = new Set();
    ledger.sources.forEach((source, index) => validateSource(source, index, root, ids, errors));
  }
  return errors;
}

const args = parseArgs(process.argv);
const readErrors = [];
const ledger = readJson(args.ledger, readErrors);
const errors = ledger ? [...readErrors, ...validateLedger(ledger, args.root)] : readErrors;
const report = {
  ok: errors.length === 0,
  ledger: args.ledger,
  root: args.root,
  counts: ledger && Array.isArray(ledger.sources)
    ? {
        sources: ledger.sources.length,
        withLocalHashes: ledger.sources.filter((source) => source.integrity?.contentHash).length,
        documentedOnlyUrls: ledger.sources.filter((source) => source.review?.retrievalStatus === "documented-only").length,
        mappedSources: ledger.sources.filter((source) => source.crosswalk?.status !== "unmapped").length,
      }
    : { sources: 0, withLocalHashes: 0, documentedOnlyUrls: 0, mappedSources: 0 },
  errors,
};

if (args.json) {
  console.log(JSON.stringify(report, null, 2));
} else if (report.ok) {
  console.log(`SOURCE_LEDGER_VERIFY: PASS (${report.counts.sources} sources, ${report.counts.withLocalHashes} hashed local files, ${report.counts.documentedOnlyUrls} documented-only URLs)`);
} else {
  for (const error of errors) console.error(`SOURCE_LEDGER_VERIFY: ${error.code}: ${error.message}`);
}

if (args.check && !report.ok) process.exit(1);
