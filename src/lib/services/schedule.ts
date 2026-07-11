import { createClient } from "@/utils/supabase/server";
import type { TaskPriority } from "@/lib/types/database";

const priorityRank: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export async function getTodaysSchedule() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get the current day name (e.g., 'Monday')
  const todayDayName = new Date().toLocaleString('en-US', { weekday: 'long' });

  // Note: Since we are using the simple schema, we just get tasks that have a specific tag,
  // OR if you added the class_schedules table back, we query that.
  // Let's assume we are using the 'tasks' table for everything for simplicity,
  // OR we can create the specific schedule query.

  // To keep it perfectly aligned with V2, let's fetch projects and their related tasks for today
  const { data, error } = await supabase
    .from('tasks')
    .select('*, projects(name, color)')
    .eq('user_id', user.id)
    .eq('due_date', new Date().toISOString().split('T')[0]); // Due today

  if (error) {
    console.error("Error fetching schedule:", error.message);
    return [];
  }

  return [...data]
    .sort((a, b) => priorityRank[a.priority as TaskPriority] - priorityRank[b.priority as TaskPriority])
    .slice(0, 5);
}
