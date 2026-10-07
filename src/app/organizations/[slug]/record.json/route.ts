import { getOrganization, getOrganizations } from "@/lib/queries";
import { issueRecord } from "@/lib/portable/signed";

export function generateStaticParams() {
  return getOrganizations().map(({ slug }) => ({ slug }));
}

export async function GET(_request: Request, ctx: RouteContext<"/organizations/[slug]/record.json">) {
  const org = getOrganization((await ctx.params).slug);
  if (!org) return Response.json({ error: "No such record" }, { status: 404 });
  return new Response(JSON.stringify(await issueRecord(org), null, 2), {
    headers: { "Content-Type": "application/vc+json; charset=utf-8" },
  });
}
