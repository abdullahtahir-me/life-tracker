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
  const { data, error } = await supabase
    .from('tasks')
    .select('*, projects(name, color)')
    .eq('user_id', user.id)
    .eq('due_date', new Date().toISOString().split('T')[0]);

  if (error) {
    console.error("Error fetching schedule:", error.message);
    return [];
  }

  return [...data]
    .sort((a, b) => priorityRank[a.priority as TaskPriority] - priorityRank[b.priority as TaskPriority])
    .slice(0, 5);
}
