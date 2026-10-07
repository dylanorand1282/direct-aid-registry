import type { Program } from "@/data/types";
import { formatNumber } from "@/lib/format";
import { WITHHELD_LOCATION } from "@/lib/disclosure";
import { oblastLabel, sectorLabel } from "@/lib/labels";

export function ProgramsTable({ programs, locationsWithheld = false }: { programs: Program[]; locationsWithheld?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-md border border-rule">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-surface text-xs uppercase tracking-wider text-ink-subtle">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Program</th>
            <th scope="col" className="px-4 py-3 font-medium">Sector</th>
            <th scope="col" className="px-4 py-3 font-medium">Oblasts</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">People per year</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-rule">
          {programs.map((program) => (
            <tr key={program.id} className="align-top">
              <th scope="row" className="px-4 py-3 font-normal">
                <span className="font-medium text-ink">{program.name}</span>
                <p className="mt-1 max-w-md text-ink-muted">{program.description}</p>
              </th>
              <td className="px-4 py-3 text-ink-muted">{sectorLabel[program.sector]}</td>
              <td className="px-4 py-3 text-ink-muted">{locationsWithheld ? WITHHELD_LOCATION : program.regions.map((r) => oblastLabel[r]).join(", ")}</td>
              <td className="px-4 py-3 text-right text-ink">{formatNumber(program.beneficiariesPerYear)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
