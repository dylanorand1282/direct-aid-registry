import {
  ACCOUNTABILITY_MEASURES,
  COUNCIL_RULES,
  DECISION_RIGHTS,
  GOVERNANCE_STATUS,
  STANDARDS_COUNCIL,
} from "@/data/methodology";
import { Badge } from "@/components/ui/Badge";

export function GovernanceSection() {
  const votingSeats = STANDARDS_COUNCIL.filter((s) => s.votes).reduce((n, s) => n + s.seats, 0);
  return (
    <div className="space-y-8">
      <div role="note" className="rounded-md border-2 border-notice-rule bg-notice p-4 text-sm text-ink">
        <p className="font-semibold">Proposal only</p>
        <p className="mt-1">{GOVERNANCE_STATUS}</p>
      </div>

      <div>
        <h3 className="font-semibold text-ink">Standards Council</h3>
        <p className="mt-1 max-w-3xl text-sm text-ink-muted">
          {votingSeats} voting seats, all held by Ukrainian civil society, the people it serves and Ukrainian experts.
          Funders and the platform operator take part without a vote.
        </p>
        <div className="mt-3 overflow-x-auto rounded-md border border-rule">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-ink-subtle">
              <tr>
                <th className="px-4 py-2 font-medium">Seats</th>
                <th className="px-4 py-2 font-medium">Held by</th>
                <th className="px-4 py-2 font-medium">How they are chosen</th>
                <th className="px-4 py-2 font-medium">Vote</th>
              </tr>
            </thead>
            <tbody>
              {STANDARDS_COUNCIL.map((s) => (
                <tr key={s.holder} className="border-t border-rule align-top">
                  <td className="px-4 py-2.5 font-medium text-ink">{s.seats}</td>
                  <td className="px-4 py-2.5 text-ink">{s.holder}</td>
                  <td className="px-4 py-2.5 text-ink-muted">{s.chosenBy}</td>
                  <td className="px-4 py-2.5">
                    {s.votes ? <Badge tone="accent">Votes</Badge> : <Badge tone="neutral">Observer</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-muted">
          {COUNCIL_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-ink">Who decides what</h3>
        <div className="mt-3 overflow-x-auto rounded-md border border-rule">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-ink-subtle">
              <tr>
                <th className="px-4 py-2 font-medium">Decision</th>
                <th className="px-4 py-2 font-medium">Decided by</th>
                <th className="px-4 py-2 font-medium">How</th>
                <th className="px-4 py-2 font-medium">Limit</th>
              </tr>
            </thead>
            <tbody>
              {DECISION_RIGHTS.map((d) => (
                <tr key={d.decision} className="border-t border-rule align-top">
                  <td className="px-4 py-2.5 font-medium text-ink">{d.decision}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-ink">{d.decidedBy}</td>
                  <td className="px-4 py-2.5 text-ink-muted">{d.how}</td>
                  <td className="px-4 py-2.5 text-ink-muted">{d.limit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <dl className="grid gap-4 md:grid-cols-2">
        {ACCOUNTABILITY_MEASURES.map((m) => (
          <div key={m.title} className="rounded-md border border-rule p-4">
            <dt className="font-semibold text-ink">{m.title}</dt>
            <dd className="mt-1 text-sm text-ink-muted">{m.body}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
