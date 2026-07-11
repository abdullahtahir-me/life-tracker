'use client'

import useSWR, { mutate } from 'swr'
import { fetcher } from '@/lib/fetcher'
import { createProject, updateProjectStatus, deleteProject } from '@/lib/actions/project-actions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FolderGit2, Trash2, CheckCircle2, Play, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHighlightItem } from '@/hooks/use-highlight'
import type { Domain, Project } from '@/lib/types/database'

type ProjectWithStats = Project & {
  domain: { name: string; color: string | null } | null;
  status?: string | null;
  stats: {
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
  };
};

type ProjectsData = {
  projects: ProjectWithStats[];
  domains: Domain[];
};

export default function ProjectsPage() {
  const { data, isLoading } = useSWR<ProjectsData>('/api/data/projects', fetcher)
  useHighlightItem(isLoading);
  const handleCreate = async (formData: FormData) => {
    await createProject(formData);
    mutate('/api/data/projects'); 
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    await updateProjectStatus(id, status);
    mutate('/api/data/projects');
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this project? All tasks inside will be lost.")) {
      await deleteProject(id);
      mutate('/api/data/projects');
    }
  }

  if (isLoading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>

  const projects = data?.projects ?? [];
  const domains = data?.domains ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground">Manage your university courses, internships, and side projects.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        <div className="lg:col-span-1">
          <Card className="p-5 sticky top-24 shadow-sm border-border/50">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <FolderGit2 className="h-4 w-4 text-primary" />
              New Project
            </h2>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">Project Name</Label>
                <Input id="name" name="name" placeholder="E.g., CS101 Final" required className="bg-secondary/20" />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="domain_id" className="text-xs">Domain</Label>
                <select name="domain_id" required className="w-full rounded-md border border-input bg-secondary/20 px-3 py-2 text-sm shadow-sm outline-none focus:border-primary">
                  <option value="">Select Domain...</option>
                  {domains.map((domain) => <option key={domain.id} value={domain.id}>{domain.name}</option>)}
                </select>
              </div>

              <Button type="submit" className="w-full" disabled={domains.length === 0}>
                Create Project
              </Button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl text-muted-foreground">
              <FolderGit2 className="h-8 w-8 mb-2 opacity-20" />
              <p>No active projects.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => {
                const isCompleted = project.status === 'completed';

                return (
                  <Card key={project.id} id={project.id} className={cn("p-5 flex flex-col transition-all shadow-sm border-border/50", isCompleted ? "opacity-60 grayscale" : "hover:border-primary/50")}>
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ backgroundColor: `${project.domain?.color || '#555'}20`, color: project.domain?.color || '#555' }}>
                        {project.domain?.name || 'Unknown'}
                      </span>

                      <div className="flex gap-1">
                        {isCompleted ? (
                           <form action={() => handleStatusUpdate(project.id, 'active')}>
                             <Button type="submit" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary"><Play className="size-3" /></Button>
                           </form>
                        ) : (
                           <form action={() => handleStatusUpdate(project.id, 'completed')}>
                             <Button type="submit" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-success"><CheckCircle2 className="size-3" /></Button>
                           </form>
                        )}
                        <form action={() => handleDelete(project.id)}>
                           <Button type="submit" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive"><Trash2 className="size-3" /></Button>
                        </form>
                      </div>
                    </div>

                    <h2 className={cn("mt-3 text-lg font-semibold text-card-foreground", isCompleted && "line-through")}>
                      {project.name}
                    </h2>

                    <div className="mt-4 flex-1">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-mono font-medium">{project.stats?.progressPercentage || 0}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div className={cn("h-full rounded-full transition-all duration-500", isCompleted ? "bg-success" : "bg-primary")} style={{ width: `${project.stats?.progressPercentage || 0}%` }} />
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
