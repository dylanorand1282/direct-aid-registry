// Encoding helpers for the portable record. Pure functions, usable in the
// browser and on the server.

/**
 * JSON Canonicalization Scheme (RFC 8785) for the values this record uses:
 * objects with keys sorted by UTF-16 code units, arrays, strings, booleans,
 * null and finite numbers (serialized as JSON.stringify does, which matches
 * RFC 8785 for integers and ordinary decimals).
 */
export function canonicalize(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Non-finite numbers cannot be canonicalized");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalize(v)}`).join(",")}}`;
  }
  throw new Error(`Cannot canonicalize ${typeof value}`);
}

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function base58btcEncode(bytes: Uint8Array): string {
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++;
  const digits: number[] = [];
  for (const byte of bytes) {
    let carry = byte;
    for (let i = 0; i < digits.length; i++) {
      carry += digits[i] << 8;
      digits[i] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  return "1".repeat(zeros) + digits.reverse().map((d) => ALPHABET[d]).join("");
}

export function base58btcDecode(text: string): Uint8Array<ArrayBuffer> {
  let zeros = 0;
  while (zeros < text.length && text[zeros] === "1") zeros++;
  const bytes: number[] = [];
  for (const char of text) {
    let carry = ALPHABET.indexOf(char);
    if (carry < 0) throw new Error("Invalid base58 character");
    for (let i = 0; i < bytes.length; i++) {
      carry += bytes[i] * 58;
      bytes[i] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  const out = new Uint8Array(zeros + bytes.length);
  out.set(bytes.reverse(), zeros);
  return out;
}

/** Multikey encoding of an Ed25519 public key: "z" + base58btc(0xed 0x01 + key). */
export function ed25519PublicKeyMultibase(rawKey: Uint8Array): string {
  const prefixed = new Uint8Array(2 + rawKey.length);
  prefixed.set([0xed, 0x01]);
  prefixed.set(rawKey, 2);
  return `z${base58btcEncode(prefixed)}`;
}

export function ed25519PublicKeyFromMultibase(multibase: string): Uint8Array<ArrayBuffer> {
  if (!multibase.startsWith("z")) throw new Error("Expected a base58btc multibase value");
  const bytes = base58btcDecode(multibase.slice(1));
  if (bytes[0] !== 0xed || bytes[1] !== 0x01 || bytes.length !== 34) throw new Error("Not an Ed25519 Multikey");
  return bytes.slice(2);
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
