import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { OrgCard } from "@/components/org/OrgCard";
import { ProjectCard } from "@/components/project/ProjectCard";
import { getFeaturedOrganizations, getFeaturedProjects } from "@/lib/queries";

export function FeaturedWork() {
  const organizations = getFeaturedOrganizations();
  const projects = getFeaturedProjects();

  return (
    <section aria-labelledby="featured-heading" className="border-t border-rule bg-surface">
      <Container className="py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">Organizations</p>
            <h2 id="featured-heading" className="mt-2 font-serif text-3xl font-semibold text-ink">
              Organizations in the registry
            </h2>
            <p className="mt-2 text-sm text-ink-subtle">
              Fictional examples, shown in a daily rotation rather than ranked. Each card shows the finding in every
              verification category.
            </p>
          </div>
          <Link href="/organizations" className="text-sm font-medium text-accent hover:text-accent-strong">
            Full directory →
          </Link>
        </div>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {organizations.map((org) => (
            <li key={org.slug}>
              <OrgCard org={org} />
            </li>
          ))}
        </ul>

        <div className="mt-16 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">Current projects</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-ink">What these organizations are raising for</h2>
            <p className="mt-2 text-sm text-ink-subtle">
              One open project from each organization above. Unrestricted support to the organization is the default.
            </p>
          </div>
          <Link href="/needs" className="text-sm font-medium text-accent hover:text-accent-strong">
            All current projects →
          </Link>
        </div>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {projects.map((project) => (
            <li key={project.slug}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
