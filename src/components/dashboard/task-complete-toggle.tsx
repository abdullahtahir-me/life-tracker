'use client'

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { mutate } from "swr";
import { Check } from "lucide-react";

import { toggleTaskComplete } from "@/lib/actions/task-actions";
import { cn } from "@/lib/utils";

type TaskCompleteToggleProps = {
  taskId: string;
  isCompleted?: boolean;
};

export function TaskCompleteToggle({
  taskId,
  isCompleted = false,
}: TaskCompleteToggleProps) {
  const router = useRouter();
  const [checked, setChecked] = useState(isCompleted);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const nextChecked = !checked;
    setChecked(nextChecked);

    startTransition(async () => {
      try {
        await toggleTaskComplete(taskId, checked);
        mutate("/api/data/tasks");
        mutate("/api/data/projects");
        router.refresh();
      } catch (error) {
        setChecked(checked);
        console.error("Failed to toggle dashboard task:", error);
      }
    });
  }

  return (
    <button
      type="button"
      aria-label={checked ? "Mark task incomplete" : "Mark task complete"}
      aria-pressed={checked}
      disabled={isPending}
      onClick={handleToggle}
      className={cn(
        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors disabled:opacity-60",
        checked
          ? "border-success bg-success text-success-foreground"
          : "border-input text-muted-foreground hover:border-ring hover:text-primary"
      )}
    >
      {checked && <Check className="size-3.5" strokeWidth={3} />}
    </button>
  );
}
