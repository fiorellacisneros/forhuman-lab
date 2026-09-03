import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");

  if (!latitude || !longitude) {
    return NextResponse.json({ error: "Faltan latitude o longitude" }, { status: 400 });
  }

  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=es&count=1`
  );
  const data = await res.json();

  return NextResponse.json({ city: data?.results?.[0]?.name ?? null });
}
