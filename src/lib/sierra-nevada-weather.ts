import { site } from "@/data/site";

export type SierraNevadaDayForecast = {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  snowfallCm: number;
  precipitationMm: number;
};

export type SierraNevadaWeather = {
  temperature: number;
  feelsLike: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  updatedAt: string;
  days: SierraNevadaDayForecast[];
};

const WEATHER_REVALIDATE_SECONDS = 600;

const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast" +
  `?latitude=${site.meetingPoint.latitude}` +
  `&longitude=${site.meetingPoint.longitude}` +
  "&elevation=2500" +
  "&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m" +
  "&daily=temperature_2m_max,temperature_2m_min,snowfall_sum,precipitation_sum,weather_code" +
  "&timezone=Europe%2FMadrid" +
  "&forecast_days=3";

type OpenMeteoResponse = {
  current?: {
    time?: string;
    temperature_2m?: number;
    apparent_temperature?: number;
    weather_code?: number;
    wind_speed_10m?: number;
    relative_humidity_2m?: number;
  };
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    snowfall_sum?: number[];
    precipitation_sum?: number[];
    weather_code?: number[];
  };
};

/** WMO Weather interpretation codes → short labels */
export function weatherLabel(code: number, locale: string): string {
  const isEn = locale === "en";
  if (code === 0) return isEn ? "Clear" : "Despejado";
  if (code === 1) return isEn ? "Mostly clear" : "Mayormente despejado";
  if (code === 2) return isEn ? "Partly cloudy" : "Parcialmente nublado";
  if (code === 3) return isEn ? "Overcast" : "Cubierto";
  if (code === 45 || code === 48) return isEn ? "Fog" : "Niebla";
  if (code >= 51 && code <= 57) return isEn ? "Drizzle" : "Llovizna";
  if (code >= 61 && code <= 67) return isEn ? "Rain" : "Lluvia";
  if (code >= 71 && code <= 77) return isEn ? "Snow" : "Nieve";
  if (code >= 80 && code <= 82) return isEn ? "Showers" : "Chubascos";
  if (code >= 85 && code <= 86) return isEn ? "Snow showers" : "Chubascos de nieve";
  if (code >= 95) return isEn ? "Thunderstorm" : "Tormenta";
  return isEn ? "Variable" : "Variable";
}

export function weatherIconKind(
  code: number,
): "sun" | "cloud" | "fog" | "rain" | "snow" | "storm" {
  if (code === 0 || code === 1) return "sun";
  if (code === 2 || code === 3) return "cloud";
  if (code === 45 || code === 48) return "fog";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 85 && code <= 86) return "snow";
  if (code >= 95) return "storm";
  if (code >= 51) return "rain";
  return "cloud";
}

export function formatWeatherDayLabel(date: string, locale: string, index: number): string {
  if (index === 0) return locale === "en" ? "Today" : "Hoy";
  if (index === 1) return locale === "en" ? "Tomorrow" : "Mañana";
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString(locale === "en" ? "en-GB" : "es-ES", {
      weekday: "short",
    });
  } catch {
    return date;
  }
}

export function formatWeatherUpdatedAt(iso: string): string {
  const match = iso.match(/T(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : "";
}

export async function getSierraNevadaWeather(): Promise<SierraNevadaWeather | null> {
  try {
    const response = await fetch(WEATHER_URL, {
      next: { revalidate: WEATHER_REVALIDATE_SECONDS },
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as OpenMeteoResponse;
    const current = data.current;
    if (!current || typeof current.temperature_2m !== "number") return null;

    const currentTemp = current.temperature_2m;
    const dates = data.daily?.time ?? [];
    const days: SierraNevadaDayForecast[] = dates.slice(0, 3).map((date, index) => ({
      date,
      weatherCode: data.daily?.weather_code?.[index] ?? current.weather_code ?? 0,
      tempMax: Math.round(data.daily?.temperature_2m_max?.[index] ?? currentTemp),
      tempMin: Math.round(data.daily?.temperature_2m_min?.[index] ?? currentTemp),
      snowfallCm: Number(data.daily?.snowfall_sum?.[index] ?? 0),
      precipitationMm: Number(data.daily?.precipitation_sum?.[index] ?? 0),
    }));

    if (days.length === 0) return null;

    return {
      temperature: Math.round(currentTemp),
      feelsLike: Math.round(current.apparent_temperature ?? currentTemp),
      weatherCode: current.weather_code ?? days[0]?.weatherCode ?? 0,
      windSpeed: Math.round(current.wind_speed_10m ?? 0),
      humidity: Math.round(current.relative_humidity_2m ?? 0),
      updatedAt: current.time ?? new Date().toISOString(),
      days,
    };
  } catch (error) {
    console.error("[weather] Sierra Nevada fetch failed:", error);
    return null;
  }
}
