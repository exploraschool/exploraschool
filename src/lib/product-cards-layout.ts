export function productCardsClass(count: number, extra = "") {
  const cols =
    count <= 1 ? "sm:grid-cols-1" : count === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
  return `x-scroller x-scroller--bleed x-scroller--cards ${cols} ${extra}`.trim();
}
