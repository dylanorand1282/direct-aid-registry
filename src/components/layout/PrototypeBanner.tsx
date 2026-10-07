import Link from "next/link";

// Always rendered by the root layout and deliberately not dismissible.
export function PrototypeBanner() {
  return (
    <div role="note" className="border-b border-notice-rule bg-notice text-ink">
      <p className="mx-auto max-w-[1200px] px-4 py-2 text-center text-sm sm:px-6 lg:px-8">
        <strong className="font-semibold">Prototype.</strong> All organizations, people and figures on this site are
        fictional. No organization has been verified and no payments are processed.{" "}
        <Link href="/methodology" className="underline underline-offset-2 hover:text-accent">
          About the methodology
        </Link>
      </p>
    </div>
  );
}
