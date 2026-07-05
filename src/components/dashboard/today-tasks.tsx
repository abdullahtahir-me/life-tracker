import { getTodaysTasks } from "@/lib/services/tasks";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Clock, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export async function TodayTasks() {
  const tasks = await getTodaysTasks();

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Today's Focus
        </h3>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
          {tasks.length} pending
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground">
          <CheckCircle2 className="mb-2 h-6 w-6 text-success" />
          <p className="text-sm">You're all caught up for today!</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/40"
            >
              {/* Fake Checkbox for now - we will add Server Actions to this later */}
              <button className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary">
                <Circle className="size-4" />
              </button>
              
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-card-foreground">
                  {task.title}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  {/* Show Domain Badge */}
                  {task.domains && (
                    <span 
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      // Example inline styling to use the domain's color if stored in DB
                      style={{ backgroundColor: `${task.domains.color}20`, color: task.domains.color }}
                    >
                      {task.domains.name}
                    </span>
                  )}
                  {/* Show Project Name if it exists */}
                  {task.projects && (
                    <span className="truncate text-muted-foreground">
                      • {task.projects.name}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}