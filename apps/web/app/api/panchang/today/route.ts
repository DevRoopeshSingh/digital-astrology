import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAstrologyProvider, LocaleCode } from "@digital-astrology/lib";

const SUPPORTED_LOCALES = ["en", "hi", "ta"] as const satisfies readonly LocaleCode[];

const querySchema = z.object({
  date: z.string().optional(),
  timezone: z.string().default("Asia/Kolkata"),
  locale: z.enum(SUPPORTED_LOCALES).default("hi")
});

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsed = querySchema.safeParse(searchParams);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid_request",
        message: "Invalid Panchang query parameters",
        details: parsed.error.flatten().fieldErrors
      },
      { status: 400 }
    );
  }

  const { date, timezone, locale } = parsed.data;

  try {
    const provider = await getAstrologyProvider();
    const result = await provider.getPanchang({
      date,
      timezone,
      locale
    });

    return NextResponse.json({
      source: result.source,
      metadata: result.metadata,
      panchang: result.details
    });
  } catch (error) {
    console.error("[api/panchang/today] provider failure", error);
    return NextResponse.json(
      {
        error: "upstream_failure",
        message: "Unable to fetch Panchang data at this time."
      },
      { status: 502 }
    );
  }
}
