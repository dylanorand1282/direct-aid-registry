# Direct Aid Registry: research prototype (MVP v0.1)

> **This is a research prototype. Every organization, project, person, funder and figure in it is fictional.**
>
> - **No donations are processed.** The pledge flow is a simulation. No money is collected, held, transferred or processed, no payment details are requested, and nothing is tax-deductible.
> - **No real verification.** No organization shown exists, and none has been verified. Category findings and statuses are illustrative and describe no real organization. A status is never an endorsement, an audit, or a guarantee against fraud or of outcomes.
> - **No documents are collected.** The NGO application form saves drafts only in your own browser.
> - **The signing key is a public demo key.** Records are signed with a key that is published in this repository (`src/lib/portable/demoKey.ts`), so a valid signature proves nothing about who made it.

The prototype explores how a registry could help international donors find and directly fund Ukrainian humanitarian organizations. It does not decide which organizations deserve funding. Instead, it tests how portable, organization-owned due-diligence evidence could let organizations and funders make their own decisions.

The only real-world figures are on the home page. They are cited to their source and labelled "Real-world context, not prototype data".

## What is in it

- **Organizations directory and profiles.** Each profile is a due-diligence record with a finding per category, and there is no overall score. "Unable to verify" (a check could not be done, often for security reasons) is kept distinct from "Does not meet standard".
- **Current needs.** Projects are grouped by organization, with budgets that include core costs, milestones, updates and reporting expectations.
- **Pledge simulator.** Unrestricted support is the default, and restriction is optional.
- **Verification methodology.** A draft standard, a proposal for governance by Ukrainian civil society, and proportional review tracks.
- **Portable records.** Each organization has a signed record as a printable page and as JSON, plus a checker that shows tampered, expired and out-of-date copies.
- **Funder records.** Organizations see how funders behave too.
- **NGO application and donor dashboard.** These are mock-ups whose state lives only in the browser (localStorage).
- **Withheld disclosures.** Organizations can withhold their locations and their funding gap. Withheld values are absent from the public data, not just hidden on the page.

`/styleguide` previews the design tokens and shared components.

## Stack

Next.js 16 (App Router, statically prerendered), React 19, TypeScript, Tailwind CSS v4, Zod (schemas are the source of the types), Vitest.

There is no backend, database, authentication, analytics or environment variable.

## Run it

Requires Node.js 20.9 or later.

```bash
npm install
npm run dev         # http://localhost:3000
npm test            # data-integrity and rule tests on the fictional data set
npm run typecheck
npm run lint
npm run build && npm start
```

## Layout

- `src/data/`: Zod schema and the fictional fixtures (organizations, projects, updates, funders, demo donor), plus methodology and pledge notice text.
- `src/lib/`: queries, filters, the disclosure rules, verification rules, and portable records (`portable/`).
- `src/components/`: UI grouped by area.
- `src/app/`: routes.

## Guardrails enforced in code and tests

- Every record carries `isFictional: true` as a literal type, and a non-dismissible prototype banner is on every page.
- The pledge notice text is tested against payment and tax wording.
- When an organization withholds a location or its funding gap, the value is absent from the data. Its projects then show funding only in quarters of the budget, so the gap cannot be worked out.

## Status

MVP v0.1 is frozen at tag `mvp-v0.1`. Questions that depend on interviews with Ukrainian organizations and funders are deliberately not built. These include the Ukrainian-language interface, multi-issuer signing, importing existing due-diligence passports, the business model, legal structure and the ratification of governance.
