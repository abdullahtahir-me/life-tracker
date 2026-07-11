'use client'

import useSWR from 'swr'
import { Card } from '@/components/ui/card'
import { CheckCircle2, ListChecks, Loader2 } from 'lucide-react'
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns'

import { TaskCompleteToggle } from '@/components/dashboard/task-complete-toggle'
import { fetcher } from '@/lib/fetcher'
import type { Domain, Project, Task } from '@/lib/types/database'

type TaskWithRelations = Task & {
  domains?: Pick<Domain, 'name' | 'color'> | null;
  projects?: Pick<Project, 'name'> | null;
};

type TasksData = {
  tasks: TaskWithRelations[];
};

function formatTaskDate(dateString: string | null) {
  if (!dateString) return 'No date'

  const date = parseISO(dateString)
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  if (isPast(date) && !isToday(date)) return 'Overdue'

  return format(date, 'MMM d')
}

export function ActiveTasks() {
  const { data, isLoading } = useSWR<TasksData>('/api/data/tasks', fetcher)
  const tasks = (data?.tasks ?? []).filter((task) => !task.is_completed).slice(0, 10)

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold">
          <ListChecks className="h-4 w-4 text-muted-foreground" />
          Action Items
        </h3>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
          {tasks.length} pending
        </span>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground">
          <CheckCircle2 className="mb-2 h-6 w-6 text-success" />
          <p className="text-sm">You&apos;re all caught up!</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => {
            const dateLabel = formatTaskDate(task.due_date)
            const isOverdue = dateLabel === 'Overdue'

            return (
              <li
                key={task.id}
                className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/40"
              >
                <TaskCompleteToggle taskId={task.id} isCompleted={task.is_completed} />

                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <p className="truncate text-sm font-medium text-card-foreground">
                      {task.title}
                    </p>
                    <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-sm ${
                      isOverdue ? 'bg-destructive/15 text-destructive' :
                      dateLabel === 'Today' ? 'bg-warning/15 text-warning' :
                      'text-muted-foreground bg-secondary'
                    }`}>
                      {dateLabel}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-xs">
                    {task.domains && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ backgroundColor: `${task.domains.color ?? '#64748b'}20`, color: task.domains.color ?? '#64748b' }}
                      >
                        {task.domains.name}
                      </span>
                    )}
                    {task.projects && (
                      <span className="truncate text-muted-foreground">
                        - {task.projects.name}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
