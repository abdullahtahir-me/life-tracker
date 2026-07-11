import { createClient } from "@/utils/supabase/server";
import { Domain, Project, Task, TaskPriority } from "@/lib/types/database";

const priorityRank: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function sortByPriority<T extends { priority: TaskPriority }>(tasks: T[]): T[] {
  return [...tasks].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
}

export type TaskWithRelations = Task & {
  domains?: Pick<Domain, 'name' | 'color'> | null;
  projects?: Pick<Project, 'name'> | null;
};

export async function getTasks(): Promise<TaskWithRelations[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

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

  return (data ?? []) as TaskWithRelations[];
}

export async function getTodaysTasks() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

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
    .eq('is_completed', false);

  if (error) {
    console.error("Error fetching today's tasks:", error.message);
    return [];
  }

  return sortByPriority(data as TaskWithRelations[]);
}

export async function getActiveTasks(): Promise<TaskWithRelations[]> {
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
    .eq('is_completed', false)
    .order('due_date', { ascending: true, nullsFirst: false })
    .limit(10);

  if (error) {
    console.error("Error fetching active tasks:", error.message);
    return [];
  }

  return (data ?? []) as TaskWithRelations[];
}
