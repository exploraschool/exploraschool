import { NextResponse } from "next/server";
import { getSierraNevadaWeather } from "@/lib/sierra-nevada-weather";

export const runtime = "nodejs";
export const revalidate = 600;

export async function GET() {
  const weather = await getSierraNevadaWeather();
  if (!weather) {
    return NextResponse.json(
      { weather: null },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { weather },
    {
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=600, stale-while-revalidate=300",
      },
    },
  );
}
