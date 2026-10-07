import {
  ALL_FIELDS,
  APPLICATION_SECTIONS,
  type ApplicationField,
  type ApplicationSection,
  type EvidenceAvailability,
} from "@/data/application";
import { REVIEW_TRACKS, type ReviewTrack } from "@/data/methodology";
import type { VerificationCategoryId } from "@/data/types";
import { createLocalStore } from "./localStore";

export type DraftValue = string | number | string[] | boolean;
export type DraftValues = Record<string, DraftValue>;

export interface ApplicationDraft {
  values: DraftValues;
  /** Sections the applicant marked to come back to. */
  flagged: string[];
  updatedAt: string | null;
  /** Section the applicant was last working on, to resume there. */
  lastSection: string | null;
  submitted: { ref: string; date: string } | null;
}

export const EMPTY_DRAFT: ApplicationDraft = { values: {}, flagged: [], updatedAt: null, lastSection: null, submitted: null };

export const reasonKey = (fieldId: string) => `${fieldId}.reason`;

const FIELDS_BY_ID = new Map(ALL_FIELDS.map((f) => [f.id, f]));
const SECTION_IDS = new Set(APPLICATION_SECTIONS.map((s) => s.id));

function validValue(field: ApplicationField, value: unknown): boolean {
  switch (field.kind) {
    case "ack":
      return typeof value === "boolean";
    case "number":
      return typeof value === "number" && Number.isFinite(value);
    case "multi":
      return Array.isArray(value) && value.every((v) => field.options.some((o) => o.value === v));
    case "select":
      return field.options.some((o) => o.value === value);
    default:
      return typeof value === "string";
  }
}

/** Keeps only known fields with values of the right shape, so an old or edited draft cannot break the form. */
export function sanitizeDraft(raw: unknown): ApplicationDraft {
  if (typeof raw !== "object" || raw === null) return EMPTY_DRAFT;
  const r = raw as Record<string, unknown>;
  const values: DraftValues = {};
  if (typeof r.values === "object" && r.values !== null) {
    for (const [key, value] of Object.entries(r.values)) {
      const field = FIELDS_BY_ID.get(key);
      if (field && validValue(field, value)) values[key] = value as DraftValue;
      else if (key.endsWith(".reason") && FIELDS_BY_ID.get(key.slice(0, -7))?.kind === "evidence" && typeof value === "string")
        values[key] = value;
    }
  }
  const flagged = Array.isArray(r.flagged) ? r.flagged.filter((id): id is string => typeof id === "string" && SECTION_IDS.has(id)) : [];
  const updatedAt = typeof r.updatedAt === "string" ? r.updatedAt : null;
  const lastSection = typeof r.lastSection === "string" && (SECTION_IDS.has(r.lastSection) || r.lastSection === "review") ? r.lastSection : null;
  const s = r.submitted as Record<string, unknown> | null | undefined;
  const submitted = s && typeof s.ref === "string" && typeof s.date === "string" ? { ref: s.ref, date: s.date } : null;
  return { values, flagged, updatedAt, lastSection, submitted };
}

export const draftStore = createLocalStore("dar.applicationDraft.v1", sanitizeDraft, EMPTY_DRAFT);

export function isAnswered(field: ApplicationField, values: DraftValues): boolean {
  const value = values[field.id];
  if (field.kind === "ack") return value === true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim() !== "";
  return value !== undefined;
}

const BUDGET_TRACK: Record<string, ReviewTrack> = {
  "under-50k": "light",
  "50-150k": "light",
  "150k-1m": "standard",
  "over-1m": "full",
};

/** The applicant's chosen track, else the one their budget band suggests, else standard. */
export function draftTrack(values: DraftValues): ReviewTrack {
  const chosen = values.track;
  if (chosen === "light" || chosen === "standard" || chosen === "full") return chosen;
  return BUDGET_TRACK[String(values.budgetBand)] ?? "standard";
}

export const appliesTo = (field: ApplicationField, track: ReviewTrack) => !field.tracks || field.tracks.includes(track);

export function fieldsFor(section: ApplicationSection, track: ReviewTrack): ApplicationField[] {
  return section.fields.filter((f) => appliesTo(f, track));
}

export function sectionProgress(section: ApplicationSection, values: DraftValues) {
  const fields = fieldsFor(section, draftTrack(values));
  const answered = fields.filter((f) => isAnswered(f, values)).length;
  const missingRequired = fields.filter((f) => f.required && !isAnswered(f, values));
  return { answered, total: fields.length, missingRequired };
}

export function missingRequired(values: DraftValues): ApplicationField[] {
  return ALL_FIELDS.filter((f) => f.required && !isAnswered(f, values));
}

export function overallProgress(values: DraftValues) {
  const track = draftTrack(values);
  const fields = ALL_FIELDS.filter((f) => appliesTo(f, track));
  return { answered: fields.filter((f) => isAnswered(f, values)).length, total: fields.length, allTracksTotal: ALL_FIELDS.length };
}

// Readiness is the applicant's own view of their evidence. It is deliberately
// not a verification status and never uses the words of one.
export type Readiness = "not-required" | "not-started" | "gathering" | "ready-for-review" | "alternative-route";

export const READINESS_LABEL: Record<Readiness, string> = {
  "not-required": "Not asked on your track",
  "not-started": "Not started",
  gathering: "Evidence still to gather",
  "ready-for-review": "Evidence ready to share",
  "alternative-route": "Alternative evidence route",
};

export interface CategoryReadiness {
  category: VerificationCategoryId;
  readiness: Readiness;
  have: number;
  canObtain: number;
  cannotObtain: number;
  totalEvidence: number;
  /** Questions in this category answered "No" or "Not sure yet". */
  openQuestions: number;
}

export function categoryReadiness(category: VerificationCategoryId, values: DraftValues): CategoryReadiness {
  const track = draftTrack(values);
  const applicable = ALL_FIELDS.filter((f) => appliesTo(f, track));
  const evidence = applicable.filter((f) => f.kind === "evidence" && f.evidenceFor === category);
  const count = (v: EvidenceAvailability) => evidence.filter((f) => values[f.id] === v).length;
  const have = count("have");
  const canObtain = count("can-obtain");
  const cannotObtain = count("cannot-obtain");
  const openQuestions = applicable.filter(
    (f) => f.kind === "answer" && f.supports === category && (values[f.id] === "no" || values[f.id] === "not-sure"),
  ).length;

  let readiness: Readiness = "not-started";
  if (!REVIEW_TRACKS[track].categories.includes(category)) readiness = "not-required";
  else if (cannotObtain > 0) readiness = "alternative-route";
  else if (evidence.length > 0 && have === evidence.length) readiness = "ready-for-review";
  else if (have + canObtain > 0) readiness = "gathering";

  return { category, readiness, have, canObtain, cannotObtain, totalEvidence: evidence.length, openQuestions };
}

export function newApplicationRef(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}
