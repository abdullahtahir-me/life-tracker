import { createClient } from "@/utils/supabase/server";
import { Project } from "@/lib/types/database";
import { unstable_noStore as noStore } from "next/cache";



// Extended type for our UI
export type ProjectWithStats = Project & {
  domain: { name: string, color: string };
  stats: {
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
  }
};

export async function getProjectsWithStats(): Promise<ProjectWithStats[]> {
  noStore();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Fetch projects, join the domain info, AND join the tasks to calculate progress!
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      domain:domains (name, color),
      tasks (id, is_completed)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error.message);
    return [];
  }

  // Calculate the progress stats in TypeScript
  const projectsWithStats = data.map((project: any) => {
    const totalTasks = project.tasks ? project.tasks.length : 0;
    const completedTasks = project.tasks ? project.tasks.filter((t: any) => t.is_completed).length : 0;
    const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return {
      ...project,
      stats: {
        totalTasks,
        completedTasks,
        progressPercentage
      }
    };
  });

  return projectsWithStats;
}

export async function getProjects(): Promise<Project[]> {
  noStore();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('projects')
    .select('*, domains(name, color)') // Joins the domain name/color for UI convenience later!
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error.message);
    return [];
  }

  return data as Project[];
}