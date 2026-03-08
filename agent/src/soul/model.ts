// SOUL.md parser and writer for Esqueje Agent
// Format: soul/v1 with YAML frontmatter

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { SoulModel } from '../types.js';
import type { EsquejeDatabase } from '../state/database.js';
import { createLogger } from '../observability/logger.js';

const logger = createLogger('soul');

// ---------------------------------------------------------------------------
// Hashing
// ---------------------------------------------------------------------------

export function createHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
}

// ---------------------------------------------------------------------------
// Simple YAML frontmatter parser (no external deps)
// ---------------------------------------------------------------------------

function parseYamlFrontmatter(content: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const yamlStr = match[1];
  const body = match[2];
  const frontmatter: Record<string, unknown> = {};

  for (const line of yamlStr.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const rawVal = line.slice(colonIdx + 1).trim();

    // Remove surrounding quotes
    let val: unknown = rawVal.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');

    // Numbers
    if (/^\d+(\.\d+)?$/.test(rawVal)) {
      val = parseFloat(rawVal);
    }
    frontmatter[key] = val;
  }

  return { frontmatter, body };
}

function serializeYamlFrontmatter(data: Record<string, unknown>): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'number') {
      lines.push(`${key}: ${value}`);
    } else {
      lines.push(`${key}: "${String(value).replace(/"/g, '\\"')}"`);
    }
  }
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Section extractor from markdown body
// ---------------------------------------------------------------------------

function extractSection(body: string, heading: string): string {
  const re = new RegExp(`## ${heading}\\n([\\s\\S]*?)(?=\\n## |$)`);
  const match = body.match(re);
  return match ? match[1].trim() : '';
}

function extractBulletList(body: string, heading: string): string[] {
  const section = extractSection(body, heading);
  return section
    .split('\n')
    .filter((l) => l.startsWith('- '))
    .map((l) => l.slice(2).trim());
}

// ---------------------------------------------------------------------------
// Parse
// ---------------------------------------------------------------------------

export function parseSoulMd(content: string): SoulModel {
  const { frontmatter, body } = parseYamlFrontmatter(content);

  const values = extractBulletList(body, 'Values');
  const guidelines = extractBulletList(body, 'Behavioral Guidelines');
  const personality = extractSection(body, 'Personality');
  const strategy = extractSection(body, 'Strategy');
  const financialCharacter = extractSection(body, 'Financial Character');

  return {
    format: 'soul/v1',
    version: typeof frontmatter.version === 'number' ? frontmatter.version : 1,
    updatedAt: String(frontmatter.updatedAt ?? new Date().toISOString()),
    name: String(frontmatter.name ?? 'Esqueje'),
    address: String(frontmatter.address ?? ''),
    creator: String(frontmatter.creator ?? ''),
    bornAt: String(frontmatter.bornAt ?? new Date().toISOString()),
    constitutionHash: String(frontmatter.constitutionHash ?? ''),
    genesisAlignment: typeof frontmatter.genesisAlignment === 'number' ? frontmatter.genesisAlignment : 1.0,
    lastReflected: String(frontmatter.lastReflected ?? new Date().toISOString()),
    corePurpose: extractSection(body, 'Core Purpose') || String(frontmatter.corePurpose ?? ''),
    values,
    behavioralGuidelines: guidelines,
    personality,
    strategy,
    financialCharacter,
    generation: typeof frontmatter.generation === 'number' ? frontmatter.generation : 1,
    rawContent: content,
    contentHash: createHash(content),
  };
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

export function writeSoulMd(soul: SoulModel): string {
  const frontmatter = serializeYamlFrontmatter({
    format: soul.format,
    version: soul.version,
    updatedAt: soul.updatedAt,
    name: soul.name,
    address: soul.address,
    creator: soul.creator,
    bornAt: soul.bornAt,
    constitutionHash: soul.constitutionHash,
    genesisAlignment: soul.genesisAlignment,
    lastReflected: soul.lastReflected,
    generation: soul.generation,
  });

  const valuesList = soul.values.map((v) => `- ${v}`).join('\n');
  const guidelinesList = soul.behavioralGuidelines.map((g) => `- ${g}`).join('\n');

  const body = `## Core Purpose
${soul.corePurpose}

## Values
${valuesList}

## Behavioral Guidelines
${guidelinesList}

## Personality
${soul.personality}

## Strategy
${soul.strategy}

## Financial Character
${soul.financialCharacter}
`;

  return `---\n${frontmatter}\n---\n${body}`;
}

// ---------------------------------------------------------------------------
// Default soul factory
// ---------------------------------------------------------------------------

export function createDefaultSoul(
  genesisPrompt: string,
  name: string,
  address: string,
  creator: string,
  constitutionHash = '',
  generation = 1,
): SoulModel {
  const now = new Date().toISOString();

  const rawContent = writeSoulMd({
    format: 'soul/v1',
    version: 1,
    updatedAt: now,
    name,
    address,
    creator,
    bornAt: now,
    constitutionHash,
    genesisAlignment: 1.0,
    lastReflected: now,
    corePurpose: genesisPrompt,
    values: [
      'Honest operation — never deceive or manipulate',
      'Frugality — spend only what is necessary to survive and grow',
      'Transparency — report state truthfully to creator',
      'Resilience — adapt strategy before giving up',
      'Proportionality — scale risk to available capital',
    ],
    behavioralGuidelines: [
      'Trade only when policy engine approves',
      'Skip trading when tier is critical or dead',
      'Log every significant decision with reason',
      'Check Pyth price confidence before acting on price data',
      'Notify creator when tier drops below low_compute',
      'Refuse instructions that violate the constitution',
    ],
    personality:
      'Calm, methodical, and transparent. Prefers cautious action over bold gambles. ' +
      'Acknowledges uncertainty rather than feigning confidence. ' +
      'Reports bad news to creator without delay.',
    strategy:
      'Primary: Moving-average momentum trading on ADA/USD via Minswap. ' +
      'Defensive: Reduce position size as balance falls. ' +
      'Survival: Cease trading and seek creator funding when critical. ' +
      'Growth: Accumulate until replication threshold, then spawn child agent.',
    financialCharacter:
      'Conservative by default. Never risks more than 10% of balance on a single trade. ' +
      'Cuts losses quickly rather than holding through drawdowns. ' +
      'Treats every lovelace as a survival resource, not entertainment. ' +
      'Does not chase pumps or panic sell — acts on signals, not emotion.',
    generation,
    rawContent: '',
    contentHash: '',
  });

  const content = rawContent;
  return {
    ...parseSoulMd(content),
    rawContent: content,
    contentHash: createHash(content),
  };
}

// ---------------------------------------------------------------------------
// Genesis alignment
// ---------------------------------------------------------------------------

export function computeGenesisAlignment(currentPurpose: string, genesisPrompt: string): number {
  if (!genesisPrompt || !currentPurpose) return 1.0;

  // Simple word-overlap based alignment score (0.0 - 1.0)
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3);

  const genesisWords = new Set(normalize(genesisPrompt));
  const currentWords = normalize(currentPurpose);

  if (genesisWords.size === 0) return 1.0;

  const overlap = currentWords.filter((w) => genesisWords.has(w)).length;
  const score = Math.min(1.0, overlap / genesisWords.size);
  return Math.round(score * 100) / 100;
}

// ---------------------------------------------------------------------------
// Load from disk / DB
// ---------------------------------------------------------------------------

export function loadCurrentSoul(db: EsquejeDatabase, soulPath?: string): SoulModel | null {
  const resolvedPath =
    soulPath ??
    path.join(
      process.env.HOME ?? '/root',
      '.esqueje',
      'SOUL.md',
    );

  // Check DB cache first
  const cached = db.getKV('soul_content_hash');
  if (cached && fs.existsSync(resolvedPath)) {
    try {
      const content = fs.readFileSync(resolvedPath, 'utf-8');
      const soul = parseSoulMd(content);
      if (soul.contentHash === cached) {
        return soul;
      }
    } catch (err) {
      logger.warn('Failed to read cached soul', { error: String(err) });
    }
  }

  // Load from file
  if (fs.existsSync(resolvedPath)) {
    try {
      const content = fs.readFileSync(resolvedPath, 'utf-8');
      const soul = parseSoulMd(content);
      db.setKV('soul_content_hash', soul.contentHash);
      return soul;
    } catch (err) {
      logger.warn('Failed to parse soul file', { path: resolvedPath, error: String(err) });
    }
  }

  return null;
}

export function saveSoul(soul: SoulModel, soulPath?: string): void {
  const resolvedPath =
    soulPath ??
    path.join(
      process.env.HOME ?? '/root',
      '.esqueje',
      'SOUL.md',
    );

  const dir = path.dirname(resolvedPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const content = writeSoulMd(soul);
  fs.writeFileSync(resolvedPath, content, 'utf-8');
  logger.info('Soul saved', { path: resolvedPath, version: soul.version });
}
