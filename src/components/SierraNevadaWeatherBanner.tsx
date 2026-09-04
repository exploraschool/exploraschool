"use client";

import { useEffect, useState } from "react";
import { pickLocale } from "@/lib/locale";
import {
  formatWeatherDayLabel,
  formatWeatherUpdatedAt,
  weatherIconKind,
  weatherLabel,
  type SierraNevadaWeather,
} from "@/lib/sierra-nevada-weather";

type SierraNevadaWeatherBannerProps = {
  locale: string;
  weather?: SierraNevadaWeather | null;
};

const REFRESH_MS = 10 * 60 * 1000;

function WeatherGlyph({
  kind,
  className = "h-7 w-7 sm:h-8 sm:w-8",
}: {
  kind: ReturnType<typeof weatherIconKind>;
  className?: string;
}) {
  switch (kind) {
    case "sun":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      );
    case "snow":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M5.6 6.5l12.8 11M5.6 17.5l12.8-11M4 12h16" />
        </svg>
      );
    case "rain":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 15v3M12 14v4M17 15v3M6 10a4 4 0 0 1 0-8 5.5 5.5 0 0 1 10.4 1.5A3.5 3.5 0 0 1 18 10H6Z" />
        </svg>
      );
    case "storm":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
        </svg>
      );
    case "fog":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" d="M4 9h16M4 13h16M6 17h12" />
        </svg>
      );
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.5 17a4 4 0 0 1 0-8 5.5 5.5 0 0 1 10.4 1.5A3.5 3.5 0 0 1 18.5 17H6.5Z"
          />
        </svg>
      );
  }
}

export function SierraNevadaWeatherBanner({ locale, weather: initialWeather = null }: SierraNevadaWeatherBannerProps) {
  const [weather, setWeather] = useState<SierraNevadaWeather | null>(initialWeather);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const bucket = Math.floor(Date.now() / REFRESH_MS);
        const response = await fetch(`/api/weather?t=${bucket}`, { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { weather?: SierraNevadaWeather | null };
        if (!cancelled && payload.weather) setWeather(payload.weather);
      } catch {
        /* keep last good reading */
      }
    }

    void load();

    function onVisible() {
      if (document.visibilityState === "visible") void load();
    }

    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted) void load();
    }

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onPageShow);
    const interval = window.setInterval(() => void load(), REFRESH_MS);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onPageShow);
      window.clearInterval(interval);
    };
  }, []);

  if (!weather) return null;

  const nowKind = weatherIconKind(weather.weatherCode);
  const nowCondition = weatherLabel(weather.weatherCode, locale);
  const updated = formatWeatherUpdatedAt(weather.updatedAt);

  return (
    <aside
      className="mb-8 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 backdrop-blur-sm sm:mb-10 sm:px-5 sm:py-5"
      aria-label={pickLocale(locale, "Tiempo en Sierra Nevada", "Weather in Sierra Nevada")}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-5">
        <div className="flex min-w-0 items-center gap-3.5 border-b border-white/10 pb-4 lg:w-[13.5rem] lg:shrink-0 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-oro-light/15 text-oro-light sm:h-14 sm:w-14">
            <WeatherGlyph kind={nowKind} className="h-8 w-8 sm:h-9 sm:w-9" />
          </div>
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-oro-light/90">
              {pickLocale(locale, "Ahora · Sierra Nevada", "Now · Sierra Nevada")}
            </p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <p className="font-display text-3xl font-semibold leading-none text-nieve sm:text-4xl">
                {weather.temperature}°
              </p>
              <p className="text-sm text-nieve/75">{nowCondition}</p>
            </div>
            <p className="mt-1.5 text-xs text-nieve/45">
              {pickLocale(locale, "Sensación", "Feels like")} {weather.feelsLike}° · {weather.windSpeed}{" "}
              km/h
            </p>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-nieve/45">
            {pickLocale(locale, "Próximos 3 días", "Next 3 days")}
          </p>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {weather.days.map((day, index) => {
              const kind = weatherIconKind(day.weatherCode);
              const label = formatWeatherDayLabel(day.date, locale, index);
              const snow = day.snowfallCm > 0;
              return (
                <div
                  key={day.date}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-3 text-center sm:px-3 sm:py-3.5"
                >
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-oro-light/85">
                    {label}
                  </p>
                  <div className="mx-auto mt-2 flex h-9 w-9 items-center justify-center text-nieve/85">
                    <WeatherGlyph kind={kind} className="h-7 w-7" />
                  </div>
                  <p className="mt-1.5 text-[0.7rem] leading-tight text-nieve/60 sm:text-xs">
                    {weatherLabel(day.weatherCode, locale)}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-nieve">
                    {day.tempMax}° <span className="font-normal text-nieve/45">/ {day.tempMin}°</span>
                  </p>
                  {snow ? (
                    <p className="mt-1 text-[0.65rem] font-medium text-oro-light">
                      {day.snowfallCm.toFixed(1)} cm
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <p className="mt-3 text-[0.65rem] text-nieve/35">
        {updated
          ? pickLocale(locale, `Actualizado ${updated} · Open-Meteo`, `Updated ${updated} · Open-Meteo`)
          : pickLocale(locale, "Datos orientativos · Open-Meteo", "Indicative data · Open-Meteo")}
      </p>
    </aside>
  );
}
