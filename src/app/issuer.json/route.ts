import { ISSUER_ID, publicKeyMultibase, VERIFICATION_METHOD_ID } from "@/lib/portable/record";

// The issuer's public key, in the shape of a DID document's verification method.
// An outside donor obtains this once, independently of any record, and uses it
// to check every record offline.
export function GET() {
  return Response.json({
    "@context": ["https://www.w3.org/ns/did/v1", "https://w3id.org/security/multikey/v1"],
    id: ISSUER_ID,
    verificationMethod: [
      { id: VERIFICATION_METHOD_ID, type: "Multikey", controller: ISSUER_ID, publicKeyMultibase: publicKeyMultibase() },
    ],
    assertionMethod: [VERIFICATION_METHOD_ID],
    note: "Prototype demonstration key. Its private half is public, so signatures made with it prove nothing.",
  });
}
