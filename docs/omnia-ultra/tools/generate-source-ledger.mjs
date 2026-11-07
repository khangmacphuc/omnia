#!/usr/bin/env node
/**
 * Generate the machine-readable source ledger from the reviewed prose
 * register. The prose register remains the human-facing index; this command
 * gives every entry a stable ID, typed locator, review state, and (for local
 * files) a content hash.
 *
 * This generator intentionally does not fetch URLs. A recorded URL is not
 * treated as reachable, current, or implementation evidence until a separate
 * review records that fact with a retrieval date and revision.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "../../..");
const REGISTER_PATH = path.join(REPO_ROOT, "docs", "omnia-ultra", "delivery", "source-ledger.md");
const OUTPUT_PATH = path.join(REPO_ROOT, "docs", "omnia-ultra", "delivery", "source-ledger.json");
const REVIEWED_AT = "2026-09-14T00:00:00Z";
const REGISTER_REVISION = "2026-09-14.1";

const SECTION_CLASS = new Map([
  ["Existing Omnia primary-source research", "internal-research"],
  ["Normative Omnia contract sources (not external research evidence)", "normative-contract"],
  ["Related informative source registers", "informative-register"],
  ["Pinned official repositories already reviewed", "pinned-repository"],
  ["Date-stamped official revisions", "pinned-repository"],
  ["Official public docs", "official-documentation"],
]);

const SOURCE_CLASS_BOUNDARY = {
  "internal-research": {
    classification: "design-input",
    limitations: [
      "Research notes inform design decisions but do not prove that the described capability ships.",
      "The cited research snapshot may be historical even when the local file is present.",
    ],
    freshness: "historical",
  },
  "normative-contract": {
    classification: "normative-contract",
    limitations: [
      "A contract defines intended behavior and does not prove implementation, compilation, packaging, or native runtime behavior.",
    ],
    freshness: "current",
  },
  "informative-register": {
    classification: "informative-reference",
    limitations: [
      "The register is design input and does not authorize unsafe capabilities or prove shipped runtime behavior.",
    ],
    freshness: "historical",
  },
  "pinned-repository": {
    classification: "historical-provenance",
    limitations: [
      "A pinned repository revision is historical design provenance, not a license to copy assets or a proof of current upstream behavior.",
    ],
    freshness: "historical",
  },
  "official-documentation": {
    classification: "official-documentation",
    limitations: [
      "The URL is recorded for review; this ledger does not perform reachability or freshness checks.",
      "Provider documentation may drift and must be re-reviewed before a current-product claim.",
    ],
    freshness: "unknown",
  },
};

function slug(value) {
  return value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "")
    .slice(0, 120);
}

function hashFile(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function localSource(section, sourceClass, relativePath, title, notes = undefined) {
  const normalizedPath = relativePath.replaceAll("\\", "/");
  const absolutePath = path.resolve(REPO_ROOT, normalizedPath);
  const boundary = SOURCE_CLASS_BOUNDARY[sourceClass];
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`source-ledger local source is missing: ${normalizedPath}`);
  }
  return {
    sourceId: `src.${sourceClass}.${slug(normalizedPath)}`,
    title: title || normalizedPath,
    sourceClass,
    locator: {
      kind: "local-file",
      path: normalizedPath,
      section,
    },
    review: {
      reviewedAt: REVIEWED_AT,
      freshness: boundary.freshness,
      retrievalStatus: "verified",
      notes: notes || "Local path and SHA-256 content hash were checked by the generator.",
    },
    integrity: {
      algorithm: "sha256",
      contentHash: hashFile(absolutePath),
    },
    evidenceBoundary: {
      classification: boundary.classification,
      limitations: boundary.limitations,
    },
    crosswalk: {
      status: "unmapped",
      claimIds: [],
      requirementIds: [],
      capabilityIds: [],
      evidenceIds: [],
    },
  };
}

function urlSource(section, title, url) {
  const boundary = SOURCE_CLASS_BOUNDARY["official-documentation"];
  return {
    sourceId: `src.official-documentation.${slug(url)}`,
    title,
    sourceClass: "official-documentation",
    locator: {
      kind: "url",
      url,
      section,
    },
    review: {
      reviewedAt: REVIEWED_AT,
      freshness: boundary.freshness,
      retrievalStatus: "documented-only",
      notes: "URL was transcribed from the prose register; reachability and current content were not checked by this generator.",
    },
    evidenceBoundary: {
      classification: boundary.classification,
      limitations: boundary.limitations,
    },
    crosswalk: {
      status: "unmapped",
      claimIds: [],
      requirementIds: [],
      capabilityIds: [],
      evidenceIds: [],
    },
  };
}

function repositorySource(section, title, revision, notes = undefined) {
  const boundary = SOURCE_CLASS_BOUNDARY["pinned-repository"];
  const repositoryKey = `${title}@${revision}`;
  return {
    sourceId: `src.pinned-repository.${slug(repositoryKey)}`,
    title,
    sourceClass: "pinned-repository",
    locator: {
      kind: "repository",
      repository: title,
      revision: {
        type: "git-commit",
        value: revision,
      },
      section,
    },
    review: {
      reviewedAt: REVIEWED_AT,
      freshness: boundary.freshness,
      retrievalStatus: "verified",
      notes: notes || "Repository revision is pinned in the prose research register.",
    },
    evidenceBoundary: {
      classification: boundary.classification,
      limitations: boundary.limitations,
    },
    crosswalk: {
      status: "unmapped",
      claimIds: [],
      requirementIds: [],
      capabilityIds: [],
      evidenceIds: [],
    },
  };
}

function parseRegister() {
  const text = fs.readFileSync(REGISTER_PATH, "utf8");
  const lines = text.split(/\r?\n/);
  const sources = [];
  let section = "";

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      section = heading[1].trim();
      continue;
    }
    const sourceClass = SECTION_CLASS.get(section);
    if (!sourceClass || !line.startsWith("- ")) continue;
    const body = line.slice(2).trim();

    if (sourceClass === "pinned-repository") {
      const pinned = body.match(/^(.+?)\s+at\s+([a-f0-9]{40})\b/i);
      if (pinned) {
        const captured = body.match(/(?:captured|reviewed|retrieved)\s+on\s+(\d{4}-\d{2}-\d{2})/i);
        const note = captured
          ? `Captured on ${captured[1]} from the reviewed official repository revision.`
          : "Reviewed at the 2026-08-14 research snapshot.";
        sources.push(repositorySource(section, pinned[1].trim(), pinned[2].toLowerCase(), note));
        continue;
      }
      if (body.startsWith("OpenTelemetry GenAI Semantic Conventions repository")) {
        const revisionLine = lines.slice(index, index + 4).join(" ");
        const revision = revisionLine.match(/at\s+`([a-f0-9]{40})`/i);
        if (!revision) throw new Error("date-stamped OpenTelemetry repository revision is missing");
        sources.push(repositorySource(
          section,
          "open-telemetry/semantic-conventions-genai",
          revision[1].toLowerCase(),
          "Captured on 2026-08-14; treated as an optional interoperability projection.",
        ));
      }
      continue;
    }

    if (sourceClass === "official-documentation") {
      const official = body.match(/^(.+?):\s+(https:\/\/\S+)$/);
      if (!official) throw new Error(`official documentation entry is malformed on line ${index + 1}`);
      sources.push(urlSource(section, official[1].trim(), official[2]));
      continue;
    }

    const local = body.match(/^(\S+?)(?:\s+—\s+.*)?$/);
    if (!local) throw new Error(`local source entry is malformed on line ${index + 1}`);
    const relativePath = local[1];
    if (!relativePath.includes("/")) throw new Error(`local source entry has no repository-relative path on line ${index + 1}`);
    const title = body.includes("—") ? body.slice(body.indexOf("—") + 1).trim().replaceAll(/\s+/g, " ") : relativePath;
    sources.push(localSource(section, sourceClass, relativePath, title));
  }

  const ids = new Set();
  for (const source of sources) {
    if (ids.has(source.sourceId)) throw new Error(`duplicate generated source ID: ${source.sourceId}`);
    ids.add(source.sourceId);
  }
  if (sources.length < 80) throw new Error(`source register unexpectedly produced only ${sources.length} entries`);
  return sources;
}

function buildLedger() {
  return {
    $schema: "../schemas/source-ledger.schema.json",
    schemaVersion: 1,
    ledgerId: "OMNIA-ULTRA-DELIVERY-SOURCES",
    ledgerRevision: REGISTER_REVISION,
    title: "Omnia Ultra research and source ledger",
    status: "research-ledger",
    lastReviewedAt: REVIEWED_AT,
    scope: {
      purpose: "Record the provenance, review state, and evidence boundary of design and contract sources used by Omnia Ultra.",
      authority: "design-input-and-contract-discovery",
      notEvidenceOf: [
        "implementation",
        "compilation",
        "packaging",
        "native-runtime",
        "provider-health",
        "url-reachability",
      ],
    },
    policy: {
      sourceClasses: [
        "internal-research",
        "normative-contract",
        "informative-register",
        "pinned-repository",
        "official-documentation",
      ],
      hashAlgorithm: "sha256",
      localFileHashMode: "current-content",
      urlReachability: "not-checked",
      crosswalk: "requirement-and-capability-mappings-are-not-yet-complete",
    },
    crosswalk: {
      status: "not-started",
      requirementToSourceMappings: [],
      note: "Stable source IDs and typed locators are present; requirement, capability, test, evidence, and Project Twin mappings remain an explicit follow-up workstream.",
    },
    sources: parseRegister(),
  };
}

function parseArgs(argv) {
  const values = argv.slice(2);
  return {
    check: values.includes("--check"),
    output: values.includes("--output") ? path.resolve(values[values.indexOf("--output") + 1]) : OUTPUT_PATH,
  };
}

const args = parseArgs(process.argv);
const ledger = buildLedger();
const serialized = `${JSON.stringify(ledger, null, 2)}\n`;

if (args.check) {
  if (!fs.existsSync(args.output)) {
    console.error(`SOURCE_LEDGER_GENERATE: missing generated file ${args.output}`);
    process.exit(1);
  }
  const current = fs.readFileSync(args.output, "utf8");
  if (current !== serialized) {
    console.error("SOURCE_LEDGER_GENERATE: generated source-ledger.json is stale; run the generator");
    process.exit(1);
  }
  console.log(`SOURCE_LEDGER_GENERATE: PASS (${ledger.sources.length} sources)`);
} else {
  fs.writeFileSync(args.output, serialized, "utf8");
  console.log(`SOURCE_LEDGER_GENERATE: wrote ${args.output} (${ledger.sources.length} sources)`);
}
