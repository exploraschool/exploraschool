export function BlogStarRating({
  score,
  size = "md",
}: {
  score: number;
  size?: "sm" | "md";
}) {
  const clamped = Math.min(5, Math.max(0, score));
  const dim = size === "sm" ? 16 : 22;
  return (
    <div className="flex items-center gap-0.5" aria-label={`${clamped.toFixed(1)} de 5`}>
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.min(1, Math.max(0, clamped - index));
        return (
          <span key={index} className="relative inline-block" style={{ width: dim, height: dim }}>
            <svg viewBox="0 0 24 24" width={dim} height={dim} className="text-hielo/20" aria-hidden>
              <path
                fill="currentColor"
                d="M12 2.6 14.7 8l6 .9-4.4 4.3 1 5.9L12 16.2 6.7 19.1l1-5.9L3.3 8.9 9.3 8z"
              />
            </svg>
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <svg viewBox="0 0 24 24" width={dim} height={dim} className="text-oro" aria-hidden>
                <path
                  fill="currentColor"
                  d="M12 2.6 14.7 8l6 .9-4.4 4.3 1 5.9L12 16.2 6.7 19.1l1-5.9L3.3 8.9 9.3 8z"
                />
              </svg>
            </span>
          </span>
        );
      })}
    </div>
  );
}
