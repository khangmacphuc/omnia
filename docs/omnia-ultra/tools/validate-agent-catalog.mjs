#!/usr/bin/env node
/**
 * Deterministic, dependency-free validator for the Omnia specialist catalog.
 *
 * The catalog is intentionally data-first. This checker verifies the parts of
 * the JSON contracts that protect lifecycle truth, role/persona separation,
 * revision replay, and milestone accounting. It does not grant runtime
 * authority and it never reads prompts, credentials, cookies, or sessions.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SPEC_ROOT = path.resolve(SCRIPT_DIR, '..');
function filesForRoot(root) {
  return {
    catalog: path.join(root, 'harness', 'catalog', 'agent-catalog.json'),
    roles: path.join(root, 'harness', 'catalog', 'role-profiles.json'),
    personas: path.join(root, 'harness', 'catalog', 'persona-packs.json')
  };
}

const ROLE_REQUIRED = [
  'schemaVersion', 'profileId', 'revisionId', 'lifecycle', 'category',
  'displayName', 'purpose', 'nonGoals', 'expertiseTags', 'inputContract',
  'outputContract', 'modelPolicyId', 'contextPolicyId', 'memoryPolicyId',
  'mandatorySourceIds', 'toolPolicy', 'skillIds', 'capabilityCeilingId',
  'sandboxPolicyId', 'budget', 'failureModes', 'stopConditions',
  'escalationRules', 'handoffContract', 'examples', 'evaluation', 'evidence',
  'createdAt', 'updatedAt'
];

const ROLE_ALLOWED = new Set([
  ...ROLE_REQUIRED, 'description', 'aliases', 'supersedesRevisionId', 'machinePolicyId',
  'checklist', 'iconId', 'runtimeGlyphId'
]);

const PERSONA_REQUIRED = [
  'schemaVersion', 'personaId', 'revisionId', 'lifecycle', 'displayName',
  'purpose', 'nonGoals', 'language', 'voice', 'explanationDensity',
  'pedagogyModes', 'presentationDefaults', 'workflowDefaults', 'examples',
  'evidence', 'createdAt', 'updatedAt'
];

const PERSONA_ALLOWED = new Set([
  ...PERSONA_REQUIRED, 'description', 'aliases', 'iconId'
]);

const LIFECYCLES = new Set(['draft', 'enabled', 'disabled', 'deprecated', 'superseded', 'blocked']);
const CATALOG_LIFECYCLES = new Set(['draft', 'enabled', 'superseded', 'archived']);
const ID_RE = /^[a-z0-9][a-z0-9._:-]{1,191}$/;
const HASH_RE = /^[a-f0-9]{64}$/i;
const PERSONA_FORBIDDEN_KEYS = new Set([
  'toolIds', 'toolPolicy', 'allowedToolClassIds', 'grantIds', 'secretRefs',
  'secretIds', 'credentialRefs', 'sessionId', 'sessionIds', 'environmentId',
  'environmentIds', 'approvalId', 'approvalIds', 'capabilityCeilingId',
  'authorityCeilingId', 'sandboxPolicyId', 'machinePolicyId', 'modelPolicyId',
  'contextPolicyId', 'memoryPolicyId', 'skillIds', 'networkPolicy',
  'allowedDataClassIds', 'forbiddenSideEffectClasses'
]);

const ROLE_DIFF_KEYS = [
  'category', 'purpose', 'nonGoals', 'expertiseTags', 'inputContract',
  'outputContract', 'modelPolicyId', 'contextPolicyId', 'memoryPolicyId',
  'mandatorySourceIds', 'toolPolicy', 'skillIds', 'capabilityCeilingId',
  'sandboxPolicyId', 'budget', 'failureModes', 'stopConditions',
  'escalationRules', 'handoffContract', 'evaluation'
];

// Canonical hashes intentionally omit identity, lifecycle, evidence and
// timestamps. Two revisions with different IDs but the same operational
// contract must still be detected as duplicate filler.
const ROLE_CANONICAL_KEYS = [
  'category', 'displayName', 'description', 'purpose', 'nonGoals',
  'expertiseTags', 'inputContract', 'outputContract', 'modelPolicyId',
  'contextPolicyId', 'memoryPolicyId', 'mandatorySourceIds', 'toolPolicy',
  'skillIds', 'capabilityCeilingId', 'sandboxPolicyId', 'machinePolicyId',
  'budget', 'failureModes', 'stopConditions', 'escalationRules',
  'handoffContract', 'checklist', 'examples', 'evaluation'
];

const PERSONA_CANONICAL_KEYS = [
  'displayName', 'description', 'purpose', 'nonGoals', 'language', 'voice',
  'explanationDensity', 'pedagogyModes', 'presentationDefaults',
  'workflowDefaults', 'examples'
];

const PERSONA_DIFF_KEYS = [
  'purpose', 'nonGoals', 'language', 'voice', 'explanationDensity',
  'pedagogyModes', 'presentationDefaults', 'workflowDefaults'
];

const CATALOG_ALLOWED = new Set([
  'schemaVersion', 'catalogId', 'revisionId', 'lifecycle', 'sourceManifestRevisionId',
  'profileRefs', 'personaRefs', 'countPolicy', 'milestoneTargets', 'derivedCounts',
  'evidence', 'createdAt', 'updatedAt'
]);

const ENTRY_REF_ALLOWED = new Set([
  'id', 'revisionId', 'path', 'lifecycle', 'alias', 'aliasOf', 'evidenceStatus',
  'canonicalHash', 'differentiationHash', 'category'
]);

function parseArgs(argv) {
  const values = argv.slice(2);
  const args = new Set(values);
  const rootIndex = values.indexOf('--root');
  const root = rootIndex >= 0 && values[rootIndex + 1] ? path.resolve(values[rootIndex + 1]) : SPEC_ROOT;
  return { json: args.has('--json'), check: args.has('--check') || !args.has('--report'), root };
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`cannot read JSON ${file}: ${error.message}`);
  }
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  }
  return value;
}

function sha256(value) {
  return crypto.createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
}

function pick(value, keys) {
  return Object.fromEntries(keys.map((key) => [key, value[key]]));
}

function displayPath(file) {
  return path.relative(SPEC_ROOT, file).replaceAll(path.sep, '/');
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function add(errors, code, message, details = {}) {
  errors.push({ code, message, ...details });
}

function requireFields(record, fields, kind, errors) {
  if (!isObject(record)) return;
  for (const field of fields) {
    if (!(field in record)) add(errors, 'missing-field', `${kind} is missing required field ${field}`, { kind, field });
  }
}

function checkId(value, label, errors) {
  if (typeof value !== 'string' || !ID_RE.test(value)) {
    add(errors, 'invalid-id', `${label} must match the stable lowercase ID contract`, { label, value });
  }
}

function checkDate(value, label, errors) {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    add(errors, 'invalid-date', `${label} must be an ISO date-time`, { label, value });
  }
}

function checkArray(value, label, errors, { min = 0 } = {}) {
  if (!Array.isArray(value) || value.length < min) {
    add(errors, 'invalid-array', `${label} must be an array with at least ${min} item(s)`, { label });
  }
}

function checkEvidence(record, kind, errors) {
  const evidence = record.evidence;
  if (!isObject(evidence)) {
    add(errors, 'invalid-evidence', `${kind} evidence must be an object`, { kind });
    return;
  }
  requireFields(evidence, ['evidenceIds', 'status', 'lastEvaluatedAt', 'sourceRefs'], `${kind} evidence`, errors);
  checkArray(evidence.evidenceIds, `${kind}.evidence.evidenceIds`, errors);
  checkArray(evidence.sourceRefs, `${kind}.evidence.sourceRefs`, errors);
  if (!['current', 'provisional', 'stale', 'missing'].includes(evidence.status)) {
    add(errors, 'invalid-evidence-status', `${kind} evidence has an invalid status`, { status: evidence.status });
  }
  if (evidence.status === 'current') checkDate(evidence.lastEvaluatedAt, `${kind}.evidence.lastEvaluatedAt`, errors);
}

function validateRole(record, index, errors) {
  const kind = `role[${index}]`;
  if (!isObject(record)) {
    add(errors, 'invalid-record', `${kind} must be an object`, { kind });
    return;
  }
  requireFields(record, ROLE_REQUIRED, kind, errors);
  for (const key of Object.keys(record)) {
    if (!ROLE_ALLOWED.has(key)) add(errors, 'unknown-role-field', `${kind} contains unsupported field ${key}`, { kind, field: key });
  }
  checkId(record.profileId, `${kind}.profileId`, errors);
  checkId(record.revisionId, `${kind}.revisionId`, errors);
  if (record.schemaVersion !== 2) add(errors, 'unsupported-role-schema', `${kind} must use schemaVersion 2`, { kind });
  if (!LIFECYCLES.has(record.lifecycle)) add(errors, 'invalid-lifecycle', `${kind} has an invalid lifecycle`, { kind, lifecycle: record.lifecycle });
  for (const field of ['purpose', 'displayName', 'category']) {
    if (typeof record[field] !== 'string' || record[field].trim() === '') add(errors, 'invalid-text', `${kind}.${field} must be non-empty`, { kind, field });
  }
  checkArray(record.nonGoals, `${kind}.nonGoals`, errors, { min: 1 });
  checkArray(record.expertiseTags, `${kind}.expertiseTags`, errors, { min: 1 });
  for (const field of ['inputContract', 'outputContract', 'toolPolicy', 'budget', 'handoffContract', 'evaluation']) {
    if (!isObject(record[field])) add(errors, 'invalid-object', `${kind}.${field} must be an object`, { kind, field });
  }
  for (const field of ['failureModes', 'stopConditions', 'escalationRules', 'examples']) checkArray(record[field], `${kind}.${field}`, errors, { min: 1 });
  checkEvidence(record, kind, errors);
  checkDate(record.createdAt, `${kind}.createdAt`, errors);
  checkDate(record.updatedAt, `${kind}.updatedAt`, errors);
}

function findForbiddenKeys(value, location, found = []) {
  if (!isObject(value) && !Array.isArray(value)) return found;
  if (Array.isArray(value)) {
    value.forEach((item, index) => findForbiddenKeys(item, `${location}[${index}]`, found));
    return found;
  }
  for (const [key, child] of Object.entries(value)) {
    if (PERSONA_FORBIDDEN_KEYS.has(key)) found.push(`${location}.${key}`);
    findForbiddenKeys(child, `${location}.${key}`, found);
  }
  return found;
}

function validatePersona(record, index, errors) {
  const kind = `persona[${index}]`;
  if (!isObject(record)) {
    add(errors, 'invalid-record', `${kind} must be an object`, { kind });
    return;
  }
  requireFields(record, PERSONA_REQUIRED, kind, errors);
  for (const key of Object.keys(record)) {
    if (!PERSONA_ALLOWED.has(key)) add(errors, 'unknown-persona-field', `${kind} contains unsupported field ${key}`, { kind, field: key });
  }
  checkId(record.personaId, `${kind}.personaId`, errors);
  checkId(record.revisionId, `${kind}.revisionId`, errors);
  if (record.schemaVersion !== 1) add(errors, 'unsupported-persona-schema', `${kind} must use schemaVersion 1`, { kind });
  if (!LIFECYCLES.has(record.lifecycle)) add(errors, 'invalid-lifecycle', `${kind} has an invalid lifecycle`, { kind, lifecycle: record.lifecycle });
  for (const field of ['purpose', 'displayName', 'explanationDensity']) {
    if (typeof record[field] !== 'string' || record[field].trim() === '') add(errors, 'invalid-text', `${kind}.${field} must be non-empty`, { kind, field });
  }
  checkArray(record.nonGoals, `${kind}.nonGoals`, errors, { min: 1 });
  checkArray(record.pedagogyModes, `${kind}.pedagogyModes`, errors, { min: 1 });
  for (const field of ['language', 'voice', 'presentationDefaults', 'workflowDefaults']) {
    if (!isObject(record[field])) add(errors, 'invalid-object', `${kind}.${field} must be an object`, { kind, field });
  }
  checkArray(record.examples, `${kind}.examples`, errors, { min: 1 });
  checkEvidence(record, kind, errors);
  checkDate(record.createdAt, `${kind}.createdAt`, errors);
  checkDate(record.updatedAt, `${kind}.updatedAt`, errors);
  const forbidden = findForbiddenKeys(record, kind);
  for (const field of forbidden) add(errors, 'persona-authority-field', `${kind} contains authority-like field ${field}`, { kind, field });
}

function checkUnique(values, label, errors) {
  const seen = new Map();
  values.forEach((value, index) => {
    if (seen.has(value)) add(errors, 'duplicate-id', `${label} ${value} is duplicated`, { label, value, firstIndex: seen.get(value), duplicateIndex: index });
    else seen.set(value, index);
  });
}

function validateRef(ref, kind, records, expectedPath, errors, canonicalKeys, diffKeys) {
  if (!isObject(ref)) {
    add(errors, 'invalid-reference', `${kind} reference must be an object`, { kind });
    return null;
  }
  for (const key of Object.keys(ref)) {
    if (!ENTRY_REF_ALLOWED.has(key)) add(errors, 'unknown-reference-field', `${kind} contains unsupported field ${key}`, { kind, field: key });
  }
  for (const field of ['id', 'revisionId', 'path', 'lifecycle', 'alias', 'evidenceStatus', 'canonicalHash', 'differentiationHash']) {
    if (!(field in ref)) add(errors, 'missing-reference-field', `${kind} reference is missing ${field}`, { kind, field });
  }
  checkId(ref.id, `${kind}.id`, errors);
  checkId(ref.revisionId, `${kind}.revisionId`, errors);
  if (ref.path !== expectedPath) add(errors, 'reference-path-mismatch', `${kind} must reference ${expectedPath}`, { kind, path: ref.path });
  const record = records.get(ref.id);
  if (!record) {
    add(errors, 'dangling-reference', `${kind} points to unknown record ${ref.id}`, { kind, id: ref.id });
    return null;
  }
  if (record.revisionId !== ref.revisionId) add(errors, 'revision-mismatch', `${kind} revision does not match source record`, { kind, id: ref.id });
  if (record.lifecycle !== ref.lifecycle) add(errors, 'lifecycle-mismatch', `${kind} lifecycle does not match source record`, { kind, id: ref.id });
  const evidenceStatus = record.evidence?.status;
  if (evidenceStatus !== ref.evidenceStatus) add(errors, 'evidence-status-mismatch', `${kind} evidence status does not match source record`, { kind, id: ref.id });
  if (ref.alias !== false && ref.alias !== true) add(errors, 'invalid-alias-flag', `${kind}.alias must be boolean`, { kind });
  if (ref.alias === true && (typeof ref.aliasOf !== 'string' || ref.aliasOf.length === 0)) add(errors, 'alias-target-missing', `${kind} alias must specify aliasOf`, { kind, id: ref.id });
  if (typeof ref.canonicalHash !== 'string' || !HASH_RE.test(ref.canonicalHash)) add(errors, 'invalid-hash', `${kind}.canonicalHash must be SHA-256 hex`, { kind, id: ref.id });
  if (typeof ref.differentiationHash !== 'string' || !HASH_RE.test(ref.differentiationHash)) add(errors, 'invalid-hash', `${kind}.differentiationHash must be SHA-256 hex`, { kind, id: ref.id });
  const canonicalHash = sha256(pick(record, canonicalKeys));
  const diffHash = sha256(pick(record, diffKeys));
  if (ref.canonicalHash !== canonicalHash) add(errors, 'canonical-hash-mismatch', `${kind} canonical hash is stale`, { kind, id: ref.id, expected: canonicalHash, actual: ref.canonicalHash });
  if (ref.differentiationHash !== diffHash) add(errors, 'differentiation-hash-mismatch', `${kind} differentiation hash is stale`, { kind, id: ref.id, expected: diffHash, actual: ref.differentiationHash });
  return record;
}

function duplicateCount(refs, field) {
  const groups = new Map();
  refs.forEach((ref) => {
    const hash = ref?.[field];
    if (!groups.has(hash)) groups.set(hash, []);
    groups.get(hash).push(ref);
  });
  let duplicates = 0;
  for (const group of groups.values()) if (group.length > 1) duplicates += group.length - 1;
  return duplicates;
}

function countStatuses(refs) {
  return refs.reduce((counts, ref) => {
    if (isObject(ref)) counts[ref.lifecycle] = (counts[ref.lifecycle] ?? 0) + 1;
    return counts;
  }, {});
}

function validateBundleEnvelope(bundle, kind, expectedCatalogKind, entriesField, errors) {
  if (!isObject(bundle)) {
    add(errors, 'invalid-bundle', `${kind} bundle must be an object`, { kind });
    return;
  }
  requireFields(bundle, ['schemaVersion', 'catalogKind', entriesField], kind, errors);
  if (bundle.schemaVersion !== 1) add(errors, 'unsupported-bundle-schema', `${kind} bundle must use schemaVersion 1`, { kind });
  if (bundle.catalogKind !== expectedCatalogKind) add(errors, 'invalid-bundle-kind', `${kind} bundle catalogKind must be ${expectedCatalogKind}`, { kind, expected: expectedCatalogKind, actual: bundle.catalogKind });
  for (const key of Object.keys(bundle)) {
    if (!new Set(['schemaVersion', 'catalogKind', entriesField]).has(key)) add(errors, 'unknown-bundle-field', `${kind} bundle contains unsupported field ${key}`, { kind, field: key });
  }
}

function validateAliasTargets(refs, records, kind, errors) {
  refs.forEach((ref) => {
    if (!isObject(ref) || ref.alias !== true || typeof ref.aliasOf !== 'string') return;
    if (!records.has(ref.aliasOf)) add(errors, 'alias-target-dangling', `${kind} alias points to unknown target ${ref.aliasOf}`, { kind, id: ref.id, aliasOf: ref.aliasOf });
  });
}

function run() {
  const args = parseArgs(process.argv);
  const errors = [];
  const warnings = [];
  const files = filesForRoot(args.root);
  let catalog;
  let roleBundle;
  let personaBundle;
  try {
    catalog = readJson(files.catalog);
    roleBundle = readJson(files.roles);
    personaBundle = readJson(files.personas);
  } catch (error) {
    const report = { ok: false, errors: [{ code: 'io', message: error.message }], warnings: [], counts: {} };
    if (args.json) console.log(JSON.stringify(report, null, 2)); else console.error(`FAIL - ${error.message}`);
    process.exitCode = 1;
    return;
  }

  if (!isObject(catalog)) {
    add(errors, 'invalid-catalog', 'catalog must be an object');
  } else {
    requireFields(catalog, ['schemaVersion', 'catalogId', 'revisionId', 'lifecycle', 'profileRefs', 'personaRefs', 'countPolicy', 'milestoneTargets', 'derivedCounts', 'evidence', 'createdAt', 'updatedAt'], 'catalog', errors);
    for (const key of Object.keys(catalog)) {
      if (!CATALOG_ALLOWED.has(key)) add(errors, 'unknown-catalog-field', `catalog contains unsupported field ${key}`, { field: key });
    }
    if (catalog.schemaVersion !== 1) add(errors, 'unsupported-catalog-schema', 'catalog must use schemaVersion 1');
    checkId(catalog.catalogId, 'catalog.catalogId', errors);
    checkId(catalog.revisionId, 'catalog.revisionId', errors);
    if (!CATALOG_LIFECYCLES.has(catalog.lifecycle)) add(errors, 'invalid-catalog-lifecycle', 'catalog lifecycle is invalid', { lifecycle: catalog.lifecycle });
    checkDate(catalog.createdAt, 'catalog.createdAt', errors);
    checkDate(catalog.updatedAt, 'catalog.updatedAt', errors);
    checkEvidence(catalog, 'catalog', errors);
  }

  const roles = Array.isArray(roleBundle?.profiles) ? roleBundle.profiles : [];
  const personas = Array.isArray(personaBundle?.personas) ? personaBundle.personas : [];
  validateBundleEnvelope(roleBundle, 'role', 'role-profiles', 'profiles', errors);
  validateBundleEnvelope(personaBundle, 'persona', 'persona-packs', 'personas', errors);
  if (!Array.isArray(roleBundle?.profiles)) add(errors, 'invalid-role-bundle', 'role-profiles.json must contain a profiles array');
  if (!Array.isArray(personaBundle?.personas)) add(errors, 'invalid-persona-bundle', 'persona-packs.json must contain a personas array');
  roles.forEach((record, index) => validateRole(record, index, errors));
  personas.forEach((record, index) => validatePersona(record, index, errors));

  const roleById = new Map(roles.filter((record) => isObject(record)).map((record) => [record.profileId, record]));
  const personaById = new Map(personas.filter((record) => isObject(record)).map((record) => [record.personaId, record]));
  checkUnique(roles.map((record) => record?.profileId), 'role profile ID', errors);
  checkUnique(personas.map((record) => record?.personaId), 'persona ID', errors);
  checkUnique([...roles, ...personas].map((record) => record?.revisionId), 'revision ID', errors);

  const profileRefs = Array.isArray(catalog?.profileRefs) ? catalog.profileRefs : [];
  const personaRefs = Array.isArray(catalog?.personaRefs) ? catalog.personaRefs : [];
  if (!Array.isArray(catalog?.profileRefs)) add(errors, 'invalid-profile-refs', 'catalog.profileRefs must be an array');
  if (!Array.isArray(catalog?.personaRefs)) add(errors, 'invalid-persona-refs', 'catalog.personaRefs must be an array');
  checkUnique(profileRefs.map((ref) => ref?.id), 'role reference ID', errors);
  checkUnique(personaRefs.map((ref) => ref?.id), 'persona reference ID', errors);
  for (const ref of profileRefs) validateRef(ref, 'role reference', roleById, 'harness/catalog/role-profiles.json', errors, ROLE_CANONICAL_KEYS, ROLE_DIFF_KEYS);
  for (const ref of personaRefs) validateRef(ref, 'persona reference', personaById, 'harness/catalog/persona-packs.json', errors, PERSONA_CANONICAL_KEYS, PERSONA_DIFF_KEYS);
  validateAliasTargets(profileRefs, roleById, 'role reference', errors);
  validateAliasTargets(personaRefs, personaById, 'persona reference', errors);
  const refRoleIds = new Set(profileRefs.map((ref) => ref?.id));
  const refPersonaIds = new Set(personaRefs.map((ref) => ref?.id));
  for (const id of roleById.keys()) if (!refRoleIds.has(id)) add(errors, 'unregistered-role', `role ${id} is not registered in catalog`, { id });
  for (const id of personaById.keys()) if (!refPersonaIds.has(id)) add(errors, 'unregistered-persona', `persona ${id} is not registered in catalog`, { id });

  const countPolicy = catalog?.countPolicy;
  if (!isObject(countPolicy)) add(errors, 'invalid-count-policy', 'catalog.countPolicy must be an object');
  else {
    if (JSON.stringify(countPolicy.countedLifecycle) !== JSON.stringify(['enabled'])) add(errors, 'invalid-count-policy', 'countPolicy.countedLifecycle must be ["enabled"]');
    if (countPolicy.requireCurrentEvidence !== true) add(errors, 'invalid-count-policy', 'countPolicy.requireCurrentEvidence must be true');
    if (countPolicy.excludeAliases !== true) add(errors, 'invalid-count-policy', 'countPolicy.excludeAliases must be true');
    if (countPolicy.requireDifferentiation !== true) add(errors, 'invalid-count-policy', 'countPolicy.requireDifferentiation must be true');
  }

  const counted = (ref) => ref?.lifecycle === 'enabled' && ref?.evidenceStatus === 'current' && ref?.alias === false && HASH_RE.test(ref?.differentiationHash ?? '');
  const derivedCounts = {
    enabledRoleProfiles: profileRefs.filter(counted).length,
    enabledPersonaPacks: personaRefs.filter(counted).length,
    draftRoleProfiles: profileRefs.filter((ref) => ref?.lifecycle === 'draft').length,
    draftPersonaPacks: personaRefs.filter((ref) => ref?.lifecycle === 'draft').length,
    excludedRoleProfiles: profileRefs.filter((ref) => !counted(ref)).length,
    excludedPersonaPacks: personaRefs.filter((ref) => !counted(ref)).length,
    duplicateCanonicalProfiles: duplicateCount(profileRefs, 'canonicalHash'),
    duplicateCanonicalPersonas: duplicateCount(personaRefs, 'canonicalHash')
  };
  if (JSON.stringify(catalog?.derivedCounts) !== JSON.stringify(derivedCounts)) {
    add(errors, 'derived-count-mismatch', 'catalog.derivedCounts does not match the deterministic calculation', { expected: derivedCounts, actual: catalog?.derivedCounts });
  }
  if (derivedCounts.duplicateCanonicalProfiles > 0) add(errors, 'duplicate-canonical-role', 'duplicate canonical role content detected', { count: derivedCounts.duplicateCanonicalProfiles });
  if (derivedCounts.duplicateCanonicalPersonas > 0) add(errors, 'duplicate-canonical-persona', 'duplicate canonical persona content detected', { count: derivedCounts.duplicateCanonicalPersonas });

  const targets = catalog?.milestoneTargets ?? {};
  if (Number.isInteger(targets.minimumRoleProfiles) && derivedCounts.enabledRoleProfiles < targets.minimumRoleProfiles) warnings.push(`role profile milestone shortfall: ${derivedCounts.enabledRoleProfiles}/${targets.minimumRoleProfiles}`);
  if (Number.isInteger(targets.minimumPersonaPacks) && derivedCounts.enabledPersonaPacks < targets.minimumPersonaPacks) warnings.push(`persona pack milestone shortfall: ${derivedCounts.enabledPersonaPacks}/${targets.minimumPersonaPacks}`);

  const report = {
    ok: errors.length === 0,
    catalog: { id: catalog?.catalogId ?? null, revisionId: catalog?.revisionId ?? null, lifecycle: catalog?.lifecycle ?? null },
    counts: {
      sourceRoleProfiles: roles.length,
      sourcePersonaPacks: personas.length,
      ...derivedCounts,
      roleLifecycle: countStatuses(profileRefs),
      personaLifecycle: countStatuses(personaRefs),
      roleCategories: profileRefs.reduce((counts, ref) => { if (ref?.category) counts[ref.category] = (counts[ref.category] ?? 0) + 1; return counts; }, {}),
      targetRoleProfiles: targets.minimumRoleProfiles ?? null,
      targetPersonaPacks: targets.minimumPersonaPacks ?? null
    },
    hashes: {
      roleCanonical: Object.fromEntries(profileRefs.filter(isObject).map((ref) => [ref.id, ref.canonicalHash])),
      personaCanonical: Object.fromEntries(personaRefs.filter(isObject).map((ref) => [ref.id, ref.canonicalHash]))
    },
    errors,
    warnings: warnings.sort()
  };

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    const status = report.ok ? 'PASS' : 'FAIL';
    console.log(`${status} - agent catalog: ${report.counts.enabledRoleProfiles} enabled roles, ${report.counts.enabledPersonaPacks} enabled personas`);
    if (warnings.length) warnings.sort().forEach((warning) => console.log(`WARN - ${warning}`));
    errors.forEach((error) => console.log(`ERROR - ${error.code}: ${error.message}`));
  }
  if (args.check && !report.ok) process.exitCode = 1;
}

run();
