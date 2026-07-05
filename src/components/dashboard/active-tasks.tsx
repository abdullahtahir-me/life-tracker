import { getActiveTasks } from "@/lib/services/tasks";
import { Card } from "@/components/ui/card";
import { CheckCircle2, ListChecks, Circle } from "lucide-react";
import { format, isToday, isTomorrow, isPast, parseISO, startOfDay } from "date-fns";

// Helper function to make dates look human-readable
function formatTaskDate(dateString: string | null) {
  if (!dateString) return "No date";
  
  // Parse the date safely
  const date = parseISO(dateString);
  const today = startOfDay(new Date());

  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  if (isPast(date) && !isToday(date)) return "Overdue";
  
  // If it's further out, just show the date (e.g., "Jul 10")
  return format(date, "MMM d");
}

export async function ActiveTasks() {
  const tasks = await getActiveTasks();

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

      {tasks.length === 0 ? (
        <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground">
          <CheckCircle2 className="mb-2 h-6 w-6 text-success" />
          <p className="text-sm">You're all caught up!</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => {
            const dateLabel = formatTaskDate(task.due_date);
            const isOverdue = dateLabel === "Overdue";

            return (
              <li
                key={task.id}
                className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/40"
              >
                <button className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary">
                  <Circle className="size-4" />
                </button>
                
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <p className="truncate text-sm font-medium text-card-foreground">
                      {task.title}
                    </p>
                    {/* The Date Badge */}
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
                        style={{ backgroundColor: `${task.domains.color}20`, color: task.domains.color }}
                      >
                        {task.domains.name}
                      </span>
                    )}
                    {task.projects && (
                      <span className="truncate text-muted-foreground">
                        • {task.projects.name}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}