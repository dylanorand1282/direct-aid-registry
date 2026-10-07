// Signing and checking the portable record with the eddsa-jcs-2022 algorithm
// (W3C Data Integrity EdDSA Cryptosuites v1.0): canonicalize the proof options
// and the document with JCS, hash each with SHA-256, sign proofConfigHash
// followed by documentHash with Ed25519. Uses Web Crypto, so the same code
// runs on the server, in the browser and in any standard verifier.

import { base58btcDecode, base58btcEncode, canonicalize, ed25519PublicKeyFromMultibase, toHex } from "./canonical";
import { DEMO_PRIVATE_KEY_PKCS8_BASE64 } from "./demoKey";
import { publicKeyMultibase, VERIFICATION_METHOD_ID, type UnsignedRecord } from "./record";

const encoder = new TextEncoder();
const fromBase64 = (b64: string): Uint8Array<ArrayBuffer> => new Uint8Array(Array.from(atob(b64), (c) => c.charCodeAt(0)));

async function sha256(text: string): Promise<Uint8Array<ArrayBuffer>> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(text)));
}

async function hashData(document: Record<string, unknown>, proofOptions: Record<string, unknown>): Promise<Uint8Array<ArrayBuffer>> {
  const [configHash, documentHash] = await Promise.all([sha256(canonicalize(proofOptions)), sha256(canonicalize(document))]);
  const out = new Uint8Array(64);
  out.set(configHash, 0);
  out.set(documentHash, 32);
  return out;
}

export interface DataIntegrityProof {
  type: "DataIntegrityProof";
  cryptosuite: "eddsa-jcs-2022";
  created: string;
  verificationMethod: string;
  proofPurpose: "assertionMethod";
  "@context"?: unknown;
  proofValue: string;
}

export type SignedRecord = UnsignedRecord & { proof: DataIntegrityProof };

export async function signRecord(record: UnsignedRecord, created: string): Promise<SignedRecord> {
  const proofOptions = {
    type: "DataIntegrityProof" as const,
    cryptosuite: "eddsa-jcs-2022" as const,
    created,
    verificationMethod: VERIFICATION_METHOD_ID,
    proofPurpose: "assertionMethod" as const,
    "@context": record["@context"],
  };
  const key = await crypto.subtle.importKey("pkcs8", fromBase64(DEMO_PRIVATE_KEY_PKCS8_BASE64), { name: "Ed25519" }, false, ["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign({ name: "Ed25519" }, key, await hashData(record, proofOptions)));
  return { ...record, proof: { ...proofOptions, proofValue: `z${base58btcEncode(signature)}` } };
}

export type VerifyResult =
  | { ok: true; fingerprint: string; knownIssuerKey: boolean }
  | { ok: false; reason: string };

/**
 * Checks that a record is exactly what the key holder signed. `trustedKeyMultibase`
 * is the public key the checker already trusts, obtained independently of the record.
 */
export async function verifyRecord(input: unknown, trustedKeyMultibase = publicKeyMultibase()): Promise<VerifyResult> {
  if (typeof input !== "object" || input === null) return { ok: false, reason: "This is not a JSON record." };
  const { proof, ...document } = input as Record<string, unknown> & { proof?: Record<string, unknown> };
  if (!proof || typeof proof !== "object") return { ok: false, reason: "The record has no proof." };
  if (proof.type !== "DataIntegrityProof" || proof.cryptosuite !== "eddsa-jcs-2022")
    return { ok: false, reason: "The proof does not use the eddsa-jcs-2022 cryptosuite." };
  if (typeof proof.proofValue !== "string" || !proof.proofValue.startsWith("z"))
    return { ok: false, reason: "The proof value is missing or malformed." };
  if (proof.verificationMethod !== VERIFICATION_METHOD_ID)
    return { ok: false, reason: "The record was signed with a key from a different issuer." };

  const { proofValue, ...proofOptions } = proof;
  try {
    const signature = base58btcDecode((proofValue as string).slice(1));
    const rawKey = ed25519PublicKeyFromMultibase(trustedKeyMultibase);
    const key = await crypto.subtle.importKey("raw", rawKey, { name: "Ed25519" }, false, ["verify"]);
    const valid = await crypto.subtle.verify({ name: "Ed25519" }, key, signature, await hashData(document, proofOptions));
    if (!valid) return { ok: false, reason: "The signature does not match. The record has been altered since it was signed." };
    const fingerprint = toHex(await sha256(canonicalize(input))).slice(0, 16);
    return { ok: true, fingerprint, knownIssuerKey: trustedKeyMultibase === publicKeyMultibase() };
  } catch {
    return { ok: false, reason: "The signature could not be checked. This browser may not support Ed25519." };
  }
}

/** Short fingerprint of a signed record, printed on the human-readable copy. */
export async function recordFingerprint(record: SignedRecord): Promise<string> {
  return toHex(await sha256(canonicalize(record))).slice(0, 16);
}
