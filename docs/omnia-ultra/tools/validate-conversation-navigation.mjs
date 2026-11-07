#!/usr/bin/env node
/**
 * Dependency-free structural and semantic checker for conversation navigation.
 *
 * JSON Schema protects shape. This checker protects the small set of
 * cross-field invariants that JSON Schema alone cannot express conveniently:
 * queue-like operation kinds must carry a matching queue mode, scheduled work
 * must have a trigger time, and an item cannot depend on itself. This tool is
 * a contract gate only; it does not execute queue work or grant authority.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SPEC_ROOT = path.resolve(SCRIPT_DIR, '..');
const SCHEMA_PATH = path.join(SPEC_ROOT, 'schemas', 'conversation-navigation.schema.json');

const QUEUE_MODE_BY_KIND = new Map([
  ['queue', 'queue'],
  ['steer', 'steer'],
  ['btw', 'btw'],
  ['parallel', 'parallel'],
  ['scheduled', 'scheduled']
]);

const OPERATION_KINDS = new Set([
  'jump', 'copy', 'duplicate_prompt', 'branch', 'fork', 'retry',
  'regenerate', 'replay', 'compare', 'promote', 'merge', 'rebase',
  ...QUEUE_MODE_BY_KIND.keys()
]);

const OPERATION_FIELDS = new Set([
  'schemaVersion', 'operationId', 'kind', 'source', 'target', 'createdAt',
  'createdBy', 'reason', 'idempotencyKey', 'expectedConversationVersion',
  'activeProducerPolicy', 'activate', 'authorityInheritance', 'queue'
]);

const ANCHOR_FIELDS = new Set([
  'conversationId', 'branchId', 'messageId', 'messageRevisionId', 'runId',
  'attemptId', 'selectionId', 'eventCursor', 'timestampMs',
  'semanticFingerprint', 'stale'
]);

const QUEUE_FIELDS = new Set([
  'itemId', 'mode', 'orderKey', 'priority', 'dependencyIds', 'scheduledAt',
  'deadlineAt', 'modelProfileId', 'effort', 'machineMode'
]);

const QUEUE_MODES = new Set([
  'interrupt', 'steer', 'queue', 'btw', 'parallel', 'scheduled', 'draft'
]);

const QUEUE_EFFORTS = new Set(['fast', 'balanced', 'deep', 'ultra', 'custom']);
const MACHINE_MODES = new Set([
  'none', 'local_interactive', 'local_background', 'isolated', 'persistent',
  'remote', 'hybrid', 'auto'
]);

const ISO_TIMESTAMP = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?(?:Z|[+-](?:0\d|1[0-4]):[0-5]\d)$/;

function parseArgs(argv) {
  const values = argv.slice(2);
  const flags = new Set(values);
  return { check: flags.has('--check') || !flags.has('--report'), json: flags.has('--json') };
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function add(errors, code, message, details = {}) {
  errors.push({ code, message, ...details });
}

function unknownFields(value, allowed, errors, location, code) {
  if (!isObject(value)) return;
  for (const field of Object.keys(value)) {
    if (!allowed.has(field)) {
      add(errors, code, `${location}.${field} is not part of the contract`, { location, field });
    }
  }
}

function validTimestamp(value) {
  return typeof value === 'string' && ISO_TIMESTAMP.test(value) && Number.isFinite(Date.parse(value));
}

function validateAnchor(anchor, errors, location) {
  if (!isObject(anchor)) {
    add(errors, 'anchor-not-object', `${location} must be an object`, { location });
    return;
  }
  unknownFields(anchor, ANCHOR_FIELDS, errors, location, 'anchor-unknown-field');
  for (const field of ['conversationId', 'branchId']) {
    if (typeof anchor[field] !== 'string' || anchor[field].trim() === '') {
      add(errors, 'anchor-field-invalid', `${location}.${field} must be non-empty`, { location, field });
    }
  }
  if (!Number.isInteger(anchor.eventCursor) || anchor.eventCursor < 0) {
    add(errors, 'anchor-cursor-invalid', `${location}.eventCursor must be a non-negative integer`, { location });
  }
  for (const field of ['messageId', 'messageRevisionId', 'runId', 'attemptId', 'selectionId']) {
    if (anchor[field] !== undefined && typeof anchor[field] !== 'string') {
      add(errors, 'anchor-optional-field-invalid', `${location}.${field} must be a string`, { location, field });
    }
  }
  if (anchor.timestampMs !== undefined && (!Number.isInteger(anchor.timestampMs) || anchor.timestampMs < 0)) {
    add(errors, 'anchor-timestamp-invalid', `${location}.timestampMs must be a non-negative integer`, { location });
  }
  if (anchor.semanticFingerprint !== undefined && (typeof anchor.semanticFingerprint !== 'string' || anchor.semanticFingerprint.length > 256)) {
    add(errors, 'anchor-fingerprint-invalid', `${location}.semanticFingerprint must be a string of at most 256 characters`, { location });
  }
  if (anchor.stale !== undefined && typeof anchor.stale !== 'boolean') {
    add(errors, 'anchor-stale-invalid', `${location}.stale must be a boolean`, { location });
  }
}

function readSchema() {
  try {
    return JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  } catch (error) {
    throw new Error(`cannot read ${path.relative(SPEC_ROOT, SCHEMA_PATH)}: ${error.message}`);
  }
}

function requiredFields(schema, location, errors) {
  const fields = schema?.[location];
  if (!Array.isArray(fields)) add(errors, 'schema-required-list-missing', `${location} must be an array`);
  return Array.isArray(fields) ? fields : [];
}

function findConditional(schema, predicate) {
  return Array.isArray(schema?.allOf) && schema.allOf.some(predicate);
}

function validateSchemaContract(schema, errors) {
  if (!isObject(schema)) {
    add(errors, 'schema-not-object', 'conversation-navigation schema must be a JSON object');
    return;
  }
  if (schema.$schema !== 'https://json-schema.org/draft/2020-12/schema') {
    add(errors, 'schema-draft-drift', 'conversation-navigation schema must use JSON Schema draft 2020-12');
  }
  if (schema.properties?.schemaVersion?.const !== 1) {
    add(errors, 'schema-version-drift', 'conversation-navigation schemaVersion must remain const 1');
  }
  const topRequired = new Set(requiredFields(schema, 'required', errors));
  for (const field of ['schemaVersion', 'operationId', 'kind', 'source', 'createdAt']) {
    if (!topRequired.has(field)) add(errors, 'missing-top-level-required', `top-level required field ${field} is missing`, { field });
  }
  const kinds = schema.properties?.kind?.enum;
  if (!Array.isArray(kinds)) add(errors, 'kind-enum-missing', 'kind must define an enum');
  else {
    for (const kind of [...QUEUE_MODE_BY_KIND.keys()]) {
      if (!kinds.includes(kind)) add(errors, 'kind-missing', `kind enum is missing ${kind}`, { kind });
    }
  }
  const queueItem = schema.$defs?.queueItem;
  if (!isObject(queueItem)) {
    add(errors, 'queue-item-missing', '$defs.queueItem must be an object');
    return;
  }
  const queueRequired = new Set(requiredFields(queueItem, 'required', errors));
  for (const field of ['itemId', 'mode', 'orderKey', 'priority']) {
    if (!queueRequired.has(field)) add(errors, 'missing-queue-required', `queueItem required field ${field} is missing`, { field });
  }
  const queueModes = queueItem.properties?.mode?.enum;
  if (!Array.isArray(queueModes)) add(errors, 'queue-mode-enum-missing', 'queueItem.mode must define an enum');
  else for (const mode of ['steer', 'queue', 'btw', 'parallel', 'scheduled']) {
    if (!queueModes.includes(mode)) add(errors, 'queue-mode-missing', `queueItem.mode enum is missing ${mode}`, { mode });
  }

  for (const [kind, mode] of QUEUE_MODE_BY_KIND) {
    const hasQueueRequirement = findConditional(schema, (entry) => {
      const values = entry?.if?.properties?.kind?.enum;
      return Array.isArray(values) && values.includes(kind) && entry?.then?.required?.includes('queue');
    });
    if (!hasQueueRequirement) add(errors, 'queue-required-conditional-missing', `${kind} must require queue`, { kind });

    const hasModeParity = findConditional(schema, (entry) => {
      const condition = entry?.if?.properties?.kind?.const;
      const modeConst = entry?.then?.properties?.queue?.properties?.mode?.const;
      return condition === kind && modeConst === mode;
    });
    if (!hasModeParity) add(errors, 'queue-mode-parity-missing', `${kind} must require queue.mode=${mode}`, { kind, mode });
  }
  const hasScheduledTrigger = findConditional(queueItem, (entry) => (
    entry?.if?.properties?.mode?.const === 'scheduled' && entry?.then?.required?.includes('scheduledAt')
  ));
  if (!hasScheduledTrigger) add(errors, 'scheduled-trigger-conditional-missing', 'scheduled queue items must require scheduledAt');
}

function validateQueueItem(item, errors, location = 'queue') {
  if (!isObject(item)) {
    add(errors, 'queue-not-object', `${location} must be an object`, { location });
    return;
  }
  unknownFields(item, QUEUE_FIELDS, errors, location, 'queue-unknown-field');
  for (const field of ['itemId', 'mode', 'orderKey', 'priority']) {
    if (!(field in item)) add(errors, 'queue-field-missing', `${location}.${field} is required`, { location, field });
  }
  if (typeof item.itemId !== 'string' || item.itemId.trim() === '') add(errors, 'queue-item-id-invalid', `${location}.itemId must be non-empty`, { location });
  if (typeof item.orderKey !== 'string' || item.orderKey.trim() === '') add(errors, 'queue-order-key-invalid', `${location}.orderKey must be non-empty`, { location });
  if (typeof item.mode !== 'string' || !QUEUE_MODES.has(item.mode)) add(errors, 'queue-mode-invalid', `${location}.mode is unsupported`, { location, mode: item.mode });
  if (!Number.isInteger(item.priority) || item.priority < -1000 || item.priority > 1000) add(errors, 'queue-priority-invalid', `${location}.priority must be an integer in [-1000,1000]`, { location });
  if (item.dependencyIds !== undefined && !Array.isArray(item.dependencyIds)) {
    add(errors, 'dependency-list-invalid', `${location}.dependencyIds must be an array`, { location });
  }
  if (Array.isArray(item.dependencyIds)) {
    const seen = new Set();
    item.dependencyIds.forEach((dependencyId, index) => {
      if (typeof dependencyId !== 'string' || dependencyId.trim() === '') add(errors, 'dependency-id-invalid', `${location}.dependencyIds[${index}] must be non-empty`, { location, index });
      if (seen.has(dependencyId)) add(errors, 'dependency-duplicate', `${location}.dependencyIds contains a duplicate`, { location, dependencyId });
      seen.add(dependencyId);
      if (dependencyId === item.itemId) add(errors, 'dependency-self-cycle', `${location}.itemId cannot depend on itself`, { location, dependencyId });
    });
  }
  if (item.scheduledAt !== undefined && !validTimestamp(item.scheduledAt)) {
    add(errors, 'scheduled-at-invalid', `${location}.scheduledAt must be an ISO date-time`, { location });
  }
  if (item.deadlineAt !== undefined && !validTimestamp(item.deadlineAt)) {
    add(errors, 'deadline-at-invalid', `${location}.deadlineAt must be an ISO date-time`, { location });
  }
  if (item.mode === 'scheduled') {
    if (item.scheduledAt === undefined) add(errors, 'scheduled-at-missing', `${location}.scheduledAt is required for scheduled queue items`, { location });
  } else if (item.scheduledAt !== undefined) {
    add(errors, 'scheduled-at-mode-mismatch', `${location}.scheduledAt is only allowed for scheduled queue items`, { location, mode: item.mode });
  }
  if (item.modelProfileId !== undefined && (typeof item.modelProfileId !== 'string' || item.modelProfileId.trim() === '')) {
    add(errors, 'model-profile-invalid', `${location}.modelProfileId must be non-empty`, { location });
  }
  if (item.effort !== undefined && (typeof item.effort !== 'string' || !QUEUE_EFFORTS.has(item.effort))) {
    add(errors, 'effort-invalid', `${location}.effort is unsupported`, { location, effort: item.effort });
  }
  if (item.machineMode !== undefined && (typeof item.machineMode !== 'string' || !MACHINE_MODES.has(item.machineMode))) {
    add(errors, 'machine-mode-invalid', `${location}.machineMode is unsupported`, { location, machineMode: item.machineMode });
  }
  if (item.scheduledAt && item.deadlineAt) {
    const scheduledAt = Date.parse(item.scheduledAt);
    const deadlineAt = Date.parse(item.deadlineAt);
    if (!Number.isNaN(scheduledAt) && !Number.isNaN(deadlineAt) && deadlineAt < scheduledAt) add(errors, 'deadline-before-schedule', `${location}.deadlineAt cannot precede scheduledAt`, { location });
  }
}

/**
 * Validate the dependency graph for a batch of queue items. The JSON Schema
 * validates one operation at a time; this batch pass protects the invariants
 * that require the complete set of item IDs, namely unknown dependencies and
 * dependency cycles. It is still a contract gate and does not acquire leases,
 * reorder persisted rows or execute any work.
 */
function validateQueueBatch(items, errors, location = 'queueBatch') {
  if (!Array.isArray(items) || items.length === 0) {
    add(errors, 'queue-batch-empty', `${location} must contain at least one item`, { location });
    return;
  }

  const itemsById = new Map();
  items.forEach((item, index) => {
    const itemLocation = `${location}[${index}]`;
    validateQueueItem(item, errors, itemLocation);
    if (!isObject(item) || typeof item.itemId !== 'string' || item.itemId.trim() === '') return;
    if (itemsById.has(item.itemId)) {
      add(errors, 'queue-item-duplicate', `${location} contains duplicate itemId=${item.itemId}`, {
        location,
        itemId: item.itemId
      });
      return;
    }
    itemsById.set(item.itemId, item);
  });

  for (const [itemId, item] of itemsById) {
    for (const dependencyId of Array.isArray(item.dependencyIds) ? item.dependencyIds : []) {
      if (typeof dependencyId === 'string' && !itemsById.has(dependencyId)) {
        add(errors, 'dependency-unknown', `${location}.${itemId} depends on unknown itemId=${dependencyId}`, {
          location,
          itemId,
          dependencyId
        });
      }
    }
  }

  const visitState = new Map();
  const stack = [];
  const visit = (itemId) => {
    const state = visitState.get(itemId);
    if (state === 'done') return;
    if (state === 'visiting') {
      const cycleStart = stack.indexOf(itemId);
      const cycle = [...stack.slice(cycleStart), itemId];
      add(errors, 'dependency-cycle', `${location} contains a dependency cycle: ${cycle.join(' -> ')}`, {
        location,
        cycle
      });
      return;
    }
    visitState.set(itemId, 'visiting');
    stack.push(itemId);
    const item = itemsById.get(itemId);
    for (const dependencyId of Array.isArray(item?.dependencyIds) ? item.dependencyIds : []) {
      if (itemsById.has(dependencyId)) visit(dependencyId);
    }
    stack.pop();
    visitState.set(itemId, 'done');
  };

  for (const itemId of itemsById.keys()) visit(itemId);
}

function validateOperation(operation, errors, index = 0) {
  const location = `operation[${index}]`;
  if (!isObject(operation)) {
    add(errors, 'operation-not-object', `${location} must be an object`, { location });
    return;
  }
  unknownFields(operation, OPERATION_FIELDS, errors, location, 'operation-unknown-field');
  if (operation.schemaVersion !== 1) add(errors, 'operation-schema-version-invalid', `${location}.schemaVersion must be 1`, { location });
  if (typeof operation.operationId !== 'string' || operation.operationId.trim() === '' || operation.operationId.length > 128) {
    add(errors, 'operation-id-invalid', `${location}.operationId must be a non-empty string of at most 128 characters`, { location });
  }
  if (typeof operation.kind !== 'string' || !OPERATION_KINDS.has(operation.kind)) {
    add(errors, 'operation-kind-invalid', `${location}.kind is unsupported`, { location, kind: operation.kind });
  }
  if (!validTimestamp(operation.createdAt)) add(errors, 'operation-created-at-invalid', `${location}.createdAt must be an ISO date-time`, { location });
  if (operation.source === undefined) add(errors, 'operation-source-missing', `${location}.source is required`, { location });
  else validateAnchor(operation.source, errors, `${location}.source`);
  if (operation.target !== undefined) validateAnchor(operation.target, errors, `${location}.target`);
  if (!QUEUE_MODE_BY_KIND.has(operation.kind)) return;
  if (!isObject(operation.queue)) {
    add(errors, 'queue-required', `${location} kind=${operation.kind} requires queue`, { location, kind: operation.kind });
    return;
  }
  const expectedMode = QUEUE_MODE_BY_KIND.get(operation.kind);
  if (operation.queue.mode !== expectedMode) add(errors, 'queue-mode-mismatch', `${location} kind=${operation.kind} requires queue.mode=${expectedMode}`, { location, kind: operation.kind, expectedMode, actualMode: operation.queue.mode });
  validateQueueItem(operation.queue, errors, `${location}.queue`);
}

function fixtures() {
  const anchor = { conversationId: 'c1', branchId: 'b1', eventCursor: 0 };
  const queue = { itemId: 'q1', mode: 'queue', orderKey: '0001', priority: 0, dependencyIds: [] };
  return [
    { schemaVersion: 1, operationId: 'op-queue', kind: 'queue', source: anchor, createdAt: '2026-09-14T00:00:00Z', queue },
    { schemaVersion: 1, operationId: 'op-steer', kind: 'steer', source: anchor, createdAt: '2026-09-14T00:00:00Z', queue: { ...queue, itemId: 'q-steer', mode: 'steer' } },
    { schemaVersion: 1, operationId: 'op-btw', kind: 'btw', source: anchor, createdAt: '2026-09-14T00:00:00Z', queue: { ...queue, itemId: 'q-btw', mode: 'btw' } },
    { schemaVersion: 1, operationId: 'op-parallel', kind: 'parallel', source: anchor, createdAt: '2026-09-14T00:00:00Z', queue: { ...queue, itemId: 'q-parallel', mode: 'parallel' } },
    { schemaVersion: 1, operationId: 'op-scheduled', kind: 'scheduled', source: anchor, createdAt: '2026-09-14T00:00:00Z', queue: { ...queue, itemId: 'q2', mode: 'scheduled', scheduledAt: '2026-09-14T01:00:00Z' } }
  ];
}

function invalidOperationFixtures() {
  const anchor = { conversationId: 'c1', branchId: 'b1', eventCursor: 0 };
  const queue = { itemId: 'q1', mode: 'queue', orderKey: '0001', priority: 0, dependencyIds: [] };
  return [
    {
      name: 'missing-queue-payload',
      operation: { schemaVersion: 1, operationId: 'invalid-missing-queue', kind: 'queue', source: anchor, createdAt: '2026-09-14T00:00:00Z' },
      expectedCodes: ['queue-required']
    },
    {
      name: 'queue-mode-mismatch',
      operation: { schemaVersion: 1, operationId: 'invalid-mode-mismatch', kind: 'steer', source: anchor, createdAt: '2026-09-14T00:00:00Z', queue },
      expectedCodes: ['queue-mode-mismatch']
    },
    {
      name: 'invalid-queue-mode',
      operation: { schemaVersion: 1, operationId: 'invalid-mode', kind: 'queue', source: anchor, createdAt: '2026-09-14T00:00:00Z', queue: { ...queue, mode: 'not-a-mode' } },
      expectedCodes: ['queue-mode-invalid']
    },
    {
      name: 'invalid-optional-timestamp',
      operation: { schemaVersion: 1, operationId: 'invalid-time', kind: 'queue', source: anchor, createdAt: '2026-09-14T00:00:00Z', queue: { ...queue, deadlineAt: 'tomorrow' } },
      expectedCodes: ['deadline-at-invalid']
    },
    {
      name: 'invalid-priority',
      operation: { schemaVersion: 1, operationId: 'invalid-priority', kind: 'queue', source: anchor, createdAt: '2026-09-14T00:00:00Z', queue: { ...queue, priority: 1001 } },
      expectedCodes: ['queue-priority-invalid']
    },
    {
      name: 'malformed-dependency-list',
      operation: { schemaVersion: 1, operationId: 'invalid-dependencies', kind: 'queue', source: anchor, createdAt: '2026-09-14T00:00:00Z', queue: { ...queue, dependencyIds: 'q0' } },
      expectedCodes: ['dependency-list-invalid']
    },
    {
      name: 'unknown-queue-field',
      operation: { schemaVersion: 1, operationId: 'invalid-unknown-field', kind: 'queue', source: anchor, createdAt: '2026-09-14T00:00:00Z', queue: { ...queue, unexpected: true } },
      expectedCodes: ['queue-unknown-field']
    },
    {
      name: 'malformed-operation-envelope',
      operation: { schemaVersion: 2, operationId: '', kind: 'queue', source: { conversationId: '', branchId: 'b1', eventCursor: -1 }, createdAt: 'invalid', queue },
      expectedCodes: ['operation-schema-version-invalid', 'operation-id-invalid', 'operation-created-at-invalid', 'anchor-field-invalid', 'anchor-cursor-invalid']
    }
  ];
}

function validateOperationFixtures(errors) {
  const fixturesToCheck = invalidOperationFixtures();
  fixturesToCheck.forEach((fixture) => {
    const fixtureErrors = [];
    validateOperation(fixture.operation, fixtureErrors, `invalidFixture.${fixture.name}`);
    const actualCodes = new Set(fixtureErrors.map((error) => error.code));
    for (const expectedCode of fixture.expectedCodes) {
      if (!actualCodes.has(expectedCode)) {
        add(errors, 'operation-fixture-assertion', `${fixture.name} did not emit ${expectedCode}`, {
          fixture: fixture.name,
          expectedCode,
          actualCodes: [...actualCodes]
        });
      }
    }
    if (fixtureErrors.length === 0) {
      add(errors, 'operation-fixture-unexpected-pass', `${fixture.name} unexpectedly passed`, { fixture: fixture.name });
    }
  });
  return fixturesToCheck.length;
}

function batchFixtures() {
  return [
    {
      name: 'ordered-dependency-chain',
      items: [
        { itemId: 'q1', mode: 'queue', orderKey: '0001', priority: 0, dependencyIds: [] },
        { itemId: 'q2', mode: 'queue', orderKey: '0002', priority: 0, dependencyIds: ['q1'] },
        { itemId: 'q3', mode: 'parallel', orderKey: '0003', priority: 1, dependencyIds: ['q1'] }
      ],
      expectedCodes: []
    },
    {
      name: 'cycle-is-rejected',
      items: [
        { itemId: 'cycle-a', mode: 'queue', orderKey: '0001', priority: 0, dependencyIds: ['cycle-b'] },
        { itemId: 'cycle-b', mode: 'queue', orderKey: '0002', priority: 0, dependencyIds: ['cycle-a'] }
      ],
      expectedCodes: ['dependency-cycle']
    },
    {
      name: 'unknown-dependency-is-rejected',
      items: [
        { itemId: 'orphan', mode: 'queue', orderKey: '0001', priority: 0, dependencyIds: ['missing'] }
      ],
      expectedCodes: ['dependency-unknown']
    }
  ];
}

function validateBatchFixtures(errors) {
  const fixturesToCheck = batchFixtures();
  fixturesToCheck.forEach((fixture) => {
    const fixtureErrors = [];
    validateQueueBatch(fixture.items, fixtureErrors, `batchFixture.${fixture.name}`);
    const actualCodes = new Set(fixtureErrors.map((error) => error.code));
    for (const expectedCode of fixture.expectedCodes) {
      if (!actualCodes.has(expectedCode)) {
        add(errors, 'batch-fixture-assertion', `${fixture.name} did not emit ${expectedCode}`, {
          fixture: fixture.name,
          expectedCode,
          actualCodes: [...actualCodes]
        });
      }
    }
    if (fixture.expectedCodes.length === 0 && fixtureErrors.length > 0) {
      add(errors, 'batch-fixture-unexpected-error', `${fixture.name} emitted unexpected errors`, {
        fixture: fixture.name,
        actualCodes: [...actualCodes]
      });
    }
  });
  return fixturesToCheck.length;
}

function run() {
  const args = parseArgs(process.argv);
  const errors = [];
  let schema;
  try {
    schema = readSchema();
  } catch (error) {
    add(errors, 'io', error.message);
  }
  if (schema) validateSchemaContract(schema, errors);
  const operationFixtures = fixtures();
  operationFixtures.forEach((fixture, index) => validateOperation(fixture, errors, index));
  const invalidFixtureCount = validateOperationFixtures(errors);
  const batchFixtureCount = validateBatchFixtures(errors);

  const report = {
    ok: errors.length === 0,
    schema: path.relative(SPEC_ROOT, SCHEMA_PATH).replaceAll(path.sep, '/'),
    queueKinds: Object.fromEntries(QUEUE_MODE_BY_KIND),
    fixtures: operationFixtures.length,
    invalidFixtures: invalidFixtureCount,
    batchFixtures: batchFixtureCount,
    errors
  };
  if (args.json) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`${report.ok ? 'PASS' : 'FAIL'} - conversation navigation contract: ${report.fixtures} operation fixtures, ${report.batchFixtures} batch fixtures`);
    errors.forEach((error) => console.log(`ERROR - ${error.code}: ${error.message}`));
  }
  if (args.check && !report.ok) process.exitCode = 1;
}

run();
