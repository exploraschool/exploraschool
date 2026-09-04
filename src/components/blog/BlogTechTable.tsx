export function BlogTechTable({
  rows,
}: {
  rows: Array<{ label: string; value: string }>;
}) {
  if (!rows.length) return null;
  return (
    <div className="overflow-hidden rounded-2xl border border-hielo/12">
      <table className="w-full text-left text-sm">
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.label} className={index % 2 === 0 ? "bg-white" : "bg-nieve/80"}>
              <th className="w-[42%] px-4 py-3 font-semibold text-pizarra">{row.label}</th>
              <td className="px-4 py-3 leading-relaxed text-muted">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BlogComparisonTable({
  columns,
  rows,
  winnerIndex,
}: {
  columns: string[];
  rows: Array<{ label: string; values: string[] }>;
  winnerIndex?: number;
}) {
  if (!columns.length || !rows.length) return null;
  return (
    <div className="overflow-x-auto rounded-2xl border border-hielo/12">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="bg-hielo/5">
            <th className="px-4 py-3 font-semibold text-pizarra"> </th>
            {columns.map((column, index) => (
              <th
                key={`${column}-${index}`}
                className={`px-4 py-3 font-semibold ${
                  index === winnerIndex ? "bg-hielo/10 text-hielo" : "text-hielo"
                }`}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.label} className={index % 2 === 0 ? "bg-white" : "bg-nieve/80"}>
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-pizarra">{row.label}</th>
              {columns.map((_, colIndex) => (
                <td
                  key={`${row.label}-${colIndex}`}
                  className={`px-4 py-3 leading-relaxed ${
                    colIndex === winnerIndex ? "bg-hielo/5 font-medium text-pizarra" : "text-muted"
                  }`}
                >
                  {row.values[colIndex] || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
