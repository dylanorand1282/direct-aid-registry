export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

export function FilterGroup({
  legend,
  name,
  options,
  selected,
  onToggle,
  note,
}: {
  legend: string;
  name: string;
  options: FilterOption[];
  selected: string[];
  onToggle: (value: string) => void;
  note?: string;
}) {
  return (
    <fieldset className="border-t border-rule pt-4">
      <legend className="float-left w-full text-xs font-semibold uppercase tracking-wider text-ink-subtle">
        {legend}
      </legend>
      {note && <p className="clear-both pt-1 text-xs text-ink-subtle">{note}</p>}
      <ul className="clear-both space-y-1 pt-2">
        {options.map((option) => {
          const checked = selected.includes(option.value);
          const disabled = option.count === 0 && !checked;
          const id = `${name}-${option.value}`;
          return (
            <li key={option.value}>
              <label
                htmlFor={id}
                className={`flex cursor-pointer items-center gap-2.5 rounded px-1 py-1 text-sm ${
                  disabled ? "cursor-default text-ink-subtle/60" : "text-ink hover:bg-surface"
                }`}
              >
                <input
                  id={id}
                  type="checkbox"
                  name={name}
                  value={option.value}
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onToggle(option.value)}
                  className="h-4 w-4 rounded border-rule-strong accent-accent"
                />
                <span className="flex-1">{option.label}</span>
                <span className="text-xs text-ink-subtle">{option.count}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
