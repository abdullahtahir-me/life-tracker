import { createClient } from "@/utils/supabase/server";
import { Task } from "@/lib/types/database";

// --- Function 1: Get ALL tasks (Used by the /test playground) ---
export async function getTasks(): Promise<Task[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Fetch tasks and join project & domain info
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      domains(name, color),
      projects(name)
    `)
    .order('due_date', { ascending: true });

  if (error) {
    console.error("Error fetching all tasks:", error.message);
    return [];
  }

  return data as any[]; 
}

// --- Function 2: Get ONLY tasks due today (Used by the Dashboard) ---
export async function getTodaysTasks() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get today's date in YYYY-MM-DD format based on Pakistan Standard Time
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });

  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      domains (name, color),
      projects (name)
    `)
    .eq('user_id', user.id)
    .eq('due_date', today)
    .eq('is_completed', false) // Only show things we haven't done yet!
    .order('priority', { ascending: true }); 

  if (error) {
    console.error("Error fetching today's tasks:", error.message);
    return [];
  }

  return data as any[]; 
}
// ... keep your existing getTasks and getTodaysTasks functions ...

// --- Function 3: Get Active Tasks (Overdue, Today, and Upcoming) ---
export async function getActiveTasks() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      domains (name, color),
      projects (name)
    `)
    .eq('user_id', user.id)
    .eq('is_completed', false) // Only show unfinished tasks
    .order('due_date', { ascending: true, nullsFirst: false }) // Earliest due dates first!
    .limit(10); // Show up to 10 tasks on the dashboard

  if (error) {
    console.error("Error fetching active tasks:", error.message);
    return [];
  }

  return data as any[]; 
}