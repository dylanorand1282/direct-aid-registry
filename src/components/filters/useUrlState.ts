"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useOptimistic, useTransition } from "react";

export type HistoryMode = "push" | "replace";
type ParamReader = { get(name: string): string | null };

/**
 * Page state backed by the URL query string. Changes show immediately
 * (optimistic) while the navigation completes. Discrete changes push a
 * history entry so Back undoes them; typing in search should replace it.
 */
export function useUrlState<T>(parse: (params: ParamReader) => T, serialize: (state: T) => string) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const urlState = useMemo(() => parse(searchParams), [parse, searchParams]);
  const [state, setOptimisticState] = useOptimistic(urlState);

  const setState = useCallback(
    (next: T, mode: HistoryMode = "push") => {
      const qs = serialize(next);
      const href = qs ? `${pathname}?${qs}` : pathname;
      startTransition(() => {
        setOptimisticState(next);
        router[mode](href, { scroll: false });
      });
    },
    [pathname, router, serialize, setOptimisticState],
  );

  return { state, setState, isPending };
}
