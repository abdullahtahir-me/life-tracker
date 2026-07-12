import { NextRequest, NextResponse } from "next/server";
import { createCalendarToken } from "@/lib/calendar-token";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = createCalendarToken(user.id);
  const feedUrl = new URL("/api/calendar", request.nextUrl.origin);
  feedUrl.searchParams.set("token", token);

  const webcalUrl = feedUrl.toString().replace(/^https?:\/\//, "webcal://");
  const googleCalendarUrl = new URL("https://calendar.google.com/calendar/r");
  googleCalendarUrl.searchParams.set("cid", webcalUrl);

  return NextResponse.json(
    {
      feedUrl: feedUrl.toString(),
      webcalUrl,
      googleCalendarUrl: googleCalendarUrl.toString(),
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}
