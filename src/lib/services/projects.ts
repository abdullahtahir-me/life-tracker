import { createClient } from "@/utils/supabase/server";
import { Project } from "@/lib/types/database";
import { unstable_noStore as noStore } from "next/cache";
type ProjectTaskStats = {
  id: string;
  is_completed: boolean;
};
type ProjectQueryResult = Project & {
  domain: { name: string; color: string | null } | null;
  tasks: ProjectTaskStats[] | null;
  status?: string | null;
};
export type ProjectWithStats = Project & {
  domain: { name: string; color: string | null } | null;
  status?: string | null;
  stats: {
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
  };
};
export async function getProjectsWithStats(): Promise<ProjectWithStats[]> {
  noStore();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('projects')
    .select('*, domain:domains (name, color), tasks (id, is_completed)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) {
    console.error("Error fetching projects:", error.message);
    return [];
  }
  return ((data ?? []) as ProjectQueryResult[]).map((project) => {
    const { tasks, ...projectFields } = project;
    const totalTasks = tasks?.length ?? 0;
    const completedTasks = tasks?.filter((task) => task.is_completed).length ?? 0;
    const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    return {
      ...projectFields,
      stats: {
        totalTasks,
        completedTasks,
        progressPercentage,
      },
    };
  });
}
export async function getProjects(): Promise<Project[]> {
  noStore();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('projects')
    .select('*, domains(name, color)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) {
    console.error("Error fetching projects:", error.message);
    return [];
  }
  return data as Project[];
}
