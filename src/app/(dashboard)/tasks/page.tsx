'use client'

import useSWR, { mutate } from 'swr'
import { fetcher } from '@/lib/fetcher'
import { createTask, toggleTaskComplete, deleteTask } from '@/lib/actions/task-actions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ListChecks, Check, Trash2, CalendarClock, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHighlightItem } from '@/hooks/use-highlight' // <-- 1. Import the hook

export default function TasksPage() {
  const { data, isLoading } = useSWR('/api/data/tasks', fetcher)
  useHighlightItem(isLoading);
  if (isLoading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>

  const tasks = data?.tasks || [];
  const projects = data?.projects || [];
  const domains = data?.domains || [];

  const handleCreate = async (formData: FormData) => {
    await createTask(formData);
    mutate('/api/data/tasks');
    mutate('/api/data/projects'); // Also update projects in background to fix progress bars!
  }

  const handleToggle = async (id: string, status: boolean) => {
    const previousData = data;

    mutate(
      '/api/data/tasks',
      previousData
        ? {
            ...previousData,
            tasks: previousData.tasks.map((task: any) =>
              task.id === id ? { ...task, is_completed: !status } : task
            ),
          }
        : previousData,
      false
    );

    try {
      await toggleTaskComplete(id, status);
      mutate('/api/data/tasks');
      mutate('/api/data/projects');
    } catch (error) {
      mutate('/api/data/tasks', previousData, false);
      console.error('Failed to toggle task:', error);
    }
  }

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    mutate('/api/data/tasks');
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Master Task List</h1>
        <p className="text-sm text-muted-foreground">Everything on your plate across all domains.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Task Form */}
        <div className="lg:col-span-1">
          <Card className="p-5 sticky top-24">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-primary" /> New Task
            </h2>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Task Title</Label>
                <Input name="title" placeholder="E.g., Read Chapter 5" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Domain</Label>
                <select name="domain_id" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm">
                  <option value="">Select Domain...</option>
                  {domains.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Project (Optional)</Label>
                <select name="project_id" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm">
                  <option value="">No Project</option>
                  {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Due Date</Label>
                  <Input name="due_date" type="date" className="[color-scheme:dark]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Priority</Label>
                  <select name="priority" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={domains.length === 0}>Create Task</Button>
            </form>
          </Card>
        </div>

        {/* Task List */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <ul className="divide-y divide-border">
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-muted-foreground"><p>Your task list is empty.</p></div>
              ) : (
                tasks.map((task: any) => (
                  <li key={task.id} id={task.id}  className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-accent/40">
                    <button onClick={() => handleToggle(task.id, task.is_completed)} className={cn('flex size-5 shrink-0 items-center justify-center rounded-md border', task.is_completed ? 'border-success bg-success text-success-foreground' : 'border-input hover:border-ring')}>
                      {task.is_completed && <Check className="size-3.5" strokeWidth={3} />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={cn('truncate text-sm font-medium', task.is_completed ? 'text-muted-foreground line-through' : 'text-card-foreground')}>{task.title}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px]">
                        {task.domains && <span className="rounded-full px-2 py-0.5" style={{ backgroundColor: `${task.domains.color}20`, color: task.domains.color }}>{task.domains.name}</span>}
                        {task.projects && <span className="text-muted-foreground">â€¢ {task.projects.name}</span>}
                        {task.due_date && <span className="flex items-center gap-1 text-muted-foreground"><CalendarClock className="size-3" /> {new Date(task.due_date).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    {task.priority === 'high' && !task.is_completed && <AlertCircle className="size-4 text-destructive shrink-0" />}
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-50 hover:opacity-100"><Trash2 className="size-4" /></Button>
                  </li>
                ))
              )}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
