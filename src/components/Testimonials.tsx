import { getFeaturedReviews } from "@/data/reviews";
import { site } from "@/data/site";
import { pickLocale } from "@/lib/locale";

type TestimonialsProps = {
  locale: string;
};

export function Testimonials({ locale }: TestimonialsProps) {
  const reviews = getFeaturedReviews().slice(0, 6);

  return (
    <section className="section-padding bg-hielo text-nieve">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow text-oro/90">{pickLocale(locale, "Opiniones", "Reviews")}</p>
          <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
            {pickLocale(locale, "Nos respaldan más de…", "Backed by our guests")}
          </h2>
          <p className="mt-4 text-nieve/70">
            {pickLocale(locale, "Valoración", "Rating")} {site.tripAdvisor.rating} ·{" "}
            {site.tripAdvisor.reviewCount} {pickLocale(locale, "reseñas en TripAdvisor", "TripAdvisor reviews")}
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <blockquote
              key={review.id}
              className="rounded-xl border border-nieve/10 bg-pizarra/40 p-6 backdrop-blur-sm"
            >
              <p className="text-sm leading-relaxed text-nieve/90">
                &ldquo;{pickLocale(locale, review.textEs, review.textEn)}&rdquo;
              </p>
              <footer className="mt-4 flex items-center justify-between text-xs text-nieve/60">
                <cite className="not-italic font-semibold text-oro">{review.author}</cite>
                {review.instructor && <span>{review.instructor}</span>}
              </footer>
            </blockquote>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href={site.tripAdvisor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-oro hover:underline"
          >
            {pickLocale(locale, "Ver en TripAdvisor", "View on TripAdvisor")} →
          </a>
        </div>
      </div>
    </section>
  );
}
