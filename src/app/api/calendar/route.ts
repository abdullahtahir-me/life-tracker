import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as ics from 'ics';

// IMPORTANT: We use the standard supabase-js client here, NOT the server/cookie one, 
// because Apple/Google servers don't have your login cookies.
// We are bypassing RLS using the Service Role Key just for this specific, token-protected route.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // You need to add this to your .env from Supabase!

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  // 1. SECURITY CHECK: Verify the token in the URL matches your env variable
  if (token !== process.env.CALENDAR_SYNC_TOKEN) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const events: ics.EventAttributes[] = [];

  // 2. FETCH UPCOMING TASKS
  // Get today's date in YYYY-MM-DD format (Pakistan Time)
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });

  // Fetch tasks that are incomplete AND due today or in the future
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("id, title, due_date") // Add 'description' if you added that column to your DB
    .eq("is_completed", false)
    .gte("due_date", today);   // 'gte' means Greater Than or Equal To today

  if (tasksError) {
    console.error("Error fetching tasks for calendar:", tasksError);
  }

  if (tasks) {
    tasks.forEach((task) => {
      // Split "YYYY-MM-DD" into an array of numbers: [YYYY, MM, DD]
      const [year, month, day] = task.due_date.split("-").map(Number);
      
      events.push({
        uid: task.id, // 1. CRITICAL: Tells Google/Apple this is the same specific task
        title: `[Task] ${task.title}`,
        start: [year, month, day],
        // 2. THE FIX: Remove the 'end' array and use a specific 'duration'
        duration: { days: 1 }, 
        status: 'CONFIRMED',
      });
    });
  }

  // 3. FETCH SCHEDULES
  // Note: To make schedules recurring weekly, we would add recurrence rules (RRULE).
  // For simplicity, we can fetch all class schedules and map them to their next occurrence.
  // (You would add your class_schedules fetching logic here).

  // 4. GENERATE THE .ICS FILE
  const { error, value } = ics.createEvents(events);

  if (error || !value) {
    console.error(error);
    return new NextResponse("Error generating calendar", { status: 500 });
  }

  // 5. RETURN THE FILE WITH CORRECT HEADERS
  // The 'text/calendar' content type tells the phone/browser "This is a calendar subscription!"
  return new NextResponse(value, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="life_os.ics"',
    },
  });
}