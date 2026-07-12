import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyCalendarToken } from "@/lib/calendar-token";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Helper to get the current time in the exact format calendars require
const getIcsTimestamp = () => new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const userId = verifyCalendarToken(token);

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // 1. FETCH UPCOMING TASKS
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("id, title, due_date")
    .eq("user_id", userId)
    .eq("is_completed", false)
    .gte("due_date", today);

  if (tasksError) {
    console.error("Error fetching tasks:", tasksError);
    return new NextResponse("Error fetching tasks", { status: 500 });
  }

  // 2. MANUALLY BUILD THE .ICS STRING (No 3rd party bugs!)
  let icsString = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Orbit OS//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-PUBLISHED-TTL:PT1H'
  ].join('\r\n') + '\r\n';

  if (tasks) {
    tasks.forEach((task) => {
      // Format start date (remove hyphens)
      const startStr = task.due_date.replace(/-/g, '');
      
      // Calculate exactly 1 day later for the exclusive end date
      const [year, month, day] = task.due_date.split("-").map(Number);
      const endDate = new Date(year, month - 1, day + 1);
      const endStr = endDate.toISOString().split('T')[0].replace(/-/g, '');

      // Append the event text
      icsString += [
        'BEGIN:VEVENT',
        `UID:${task.id}`,
        `SUMMARY:${escapeIcsText(`[Task] ${task.title}`)}`,
        `DTSTAMP:${getIcsTimestamp()}`,
        `DTSTART;VALUE=DATE:${startStr}`,    // E.g., 20260711
        `DTEND;VALUE=DATE:${endStr}`,        // E.g., 20260712
        'STATUS:CONFIRMED',
        'END:VEVENT'
      ].join('\r\n') + '\r\n';
    });
  }

  icsString += 'END:VCALENDAR';

  // 3. RETURN THE FILE
  return new NextResponse(icsString, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="orbit_schedule.ics"',
      "Cache-Control": "private, no-store",
    },
  });
}
