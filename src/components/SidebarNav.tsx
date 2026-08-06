"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CONVERSIONS } from "@/lib/formats";

const ETL_PATH = "/etl";

export function SidebarNav() {
  const pathname = usePathname();
  const isEtlActive = pathname === ETL_PATH;

  return (
    <nav className="sticky top-8 space-y-6">
      <div className="space-y-1">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">ETL</p>
        <Link
          href={ETL_PATH}
          className={`block rounded-lg px-3 py-2 text-sm transition ${
            isEtlActive
              ? "bg-zinc-900 font-medium text-white"
              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
          }`}
        >
          Merge sources
        </Link>
      </div>

      <div className="space-y-1">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
          Conversions
        </p>
        {CONVERSIONS.map((conversion) => {
          const isActive = pathname === conversion.path;
          return (
            <Link
              key={conversion.path}
              href={conversion.path}
              className={`block rounded-lg px-3 py-2 text-sm transition ${
                isActive
                  ? "bg-zinc-900 font-medium text-white"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              {conversion.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
