"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TAB_LABELS = ["Overview", "Claims", "Ledger", "Evidence", "Documents", "Jurisdiction", "Recovery", "Timeline"] as const;
const TAB_SLUGS = ["", "claims", "ledger", "evidence", "documents", "jurisdiction", "recovery", "timeline"] as const;

export default function MatterTabs({ matterId }: { matterId: string }) {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 mb-8 border-b border-[rgba(201,168,76,0.1)] overflow-x-auto">
      {TAB_LABELS.map((label, i) => {
        const slug = TAB_SLUGS[i];
        const href = slug ? `/law/matters/${matterId}/${slug}` : `/law/matters/${matterId}`;
        const isActive = slug
          ? pathname === href
          : pathname === href || pathname === `/law/matters/${matterId}/`;
        return (
          <Link
            key={label}
            href={href}
            className={`px-4 py-3 text-sm font-serif tracking-wider uppercase no-underline transition-colors whitespace-nowrap ${
              isActive
                ? "text-[var(--gold)] border-b-2 border-[var(--gold)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
