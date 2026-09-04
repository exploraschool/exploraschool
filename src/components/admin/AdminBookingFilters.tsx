"use client";

import Link from "next/link";

const FILTERS = [
  { id: "all", label: "Todas" },
  { id: "pending", label: "Pendientes" },
  { id: "confirmed", label: "Confirmadas" },
  { id: "cancelled", label: "Rechazadas" },
] as const;

type AdminBookingFiltersProps = {
  active: string;
  counts: Record<string, number>;
};

export function AdminBookingFilters({ active, counts }: AdminBookingFiltersProps) {
  return (
    <div className="panel-scroller">
      {FILTERS.map((filter) => {
        const isActive = active === filter.id;
        const count = filter.id === "all" ? counts.all : (counts[filter.id] ?? 0);
        return (
          <Link
            key={filter.id}
            href={filter.id === "all" ? "/admin/reservas" : `/admin/reservas?status=${filter.id}`}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.8rem] font-semibold transition sm:gap-2 sm:px-3.5 sm:py-2 sm:text-sm ${
              isActive
                ? "bg-pizarra text-nieve"
                : "border border-hielo/15 bg-white text-pizarra hover:border-hielo/30"
            }`}
          >
            {filter.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[0.65rem] font-bold ${
                isActive ? "bg-white/15 text-nieve" : "bg-nieve text-muted"
              }`}
            >
              {count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
