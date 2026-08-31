import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { allGuideEntries } from "@/lib/guide-nav";

export function GuideNextPage({ currentSlug }: { currentSlug: string }) {
  const entries = allGuideEntries();
  const index = entries.findIndex((entry) => entry.slug === currentSlug);
  const next = index >= 0 ? entries[index + 1] : undefined;

  if (!next) return null;

  return (
    <Link href={`/guide/${next.slug}`} className="guide-next">
      <span className="guide-next-label">Next Page</span>
      <span className="guide-next-title">
        {next.title}
        <ArrowRight className="guide-next-arrow" aria-hidden />
      </span>
    </Link>
  );
}
