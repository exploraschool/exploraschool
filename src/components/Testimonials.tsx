import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { getFeaturedReviews } from "@/data/reviews";
import { site } from "@/data/site";
import { pickLocale } from "@/lib/locale";

type TestimonialsProps = {
  locale: string;
  limit?: number;
};

export function Testimonials({ locale, limit = 6 }: TestimonialsProps) {
  const reviews = getFeaturedReviews().slice(0, limit);

  return (
    <section className="section-padding-sm relative overflow-hidden bg-hielo text-nieve">
      <div className="container-page relative">
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeader
              dark
              eyebrow={pickLocale(locale, "Opiniones", "Reviews")}
              title={pickLocale(locale, "Lo que dicen nuestros clientes", "What our guests say")}
            />
            <span className="inline-flex shrink-0 cursor-default items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-semibold text-white pointer-events-none">
              {site.tripAdvisor.rating} ★ TripAdvisor
            </span>
          </div>
        </Reveal>

        <div className={`section-body grid gap-5 sm:gap-6 ${limit <= 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-3"}`}>
          {reviews.map((review, i) => (
            <Reveal key={review.id} delay={i * 80}>
              <blockquote className="flex h-full flex-col rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:p-5">
                <div className="mb-2 flex gap-0.5 text-oro text-xs" aria-hidden>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j}>★</span>
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-on-dark line-clamp-4">
                  &ldquo;{pickLocale(locale, review.textEs, review.textEn)}&rdquo;
                </p>
                <footer className="mt-3 border-t border-white/10 pt-3 text-xs text-nieve/85">
                  <cite className="not-italic font-semibold">{review.author}</cite>
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
