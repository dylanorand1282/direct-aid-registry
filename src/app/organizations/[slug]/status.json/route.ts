import { getOrganization, getOrganizations } from "@/lib/queries";
import { currentStatus } from "@/lib/portable/status";

export function generateStaticParams() {
  return getOrganizations().map(({ slug }) => ({ slug }));
}

export async function GET(_request: Request, ctx: RouteContext<"/organizations/[slug]/status.json">) {
  const org = getOrganization((await ctx.params).slug);
  if (!org) return Response.json({ error: "No such record" }, { status: 404 });
  return Response.json(currentStatus(org));
}
