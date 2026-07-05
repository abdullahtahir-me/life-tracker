"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Card } from "@/components/ui/card";
import { BookOpen, CheckSquare, Wallet, Eye, EyeOff, Loader2 } from "lucide-react";

type DashboardStats = {
  activeProjects: number;
  pendingTasks: number;
  owedToMe: number;
};

function StatCardSkeleton() {
  return <Card className="p-4 h-24 animate-pulse bg-muted/50" />;
}

export function StatsCards() {
  const { data: stats, isLoading } = useSWR<DashboardStats>("/api/dashboard/stats", fetcher);
  
  // State to manage the privacy toggle for the finance card
  const [showFinance, setShowFinance] = useState(false);

  if (isLoading) {
    return (
      <>
        <StatCardSkeleton />
        <StatCardSkeleton />
        {/* Hide the third skeleton on mobile too */}
        <div className="hidden md:block"><StatCardSkeleton /></div>
      </>
    );
  }

  return (
    <>
      {/* --- CARD 1: ACTIVE PROJECTS --- */}
      <Card className="p-4 flex flex-col justify-center border-border/50 shadow-sm transition-colors hover:border-primary/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Projects</p>
            <p className="text-2xl md:text-3xl font-semibold tracking-tight">{stats?.activeProjects ?? 0}</p>
          </div>
          <div className="p-2 md:p-3 bg-warning/15 text-warning rounded-lg">
            <BookOpen className="size-5 md:size-6" />
          </div>
        </div>
      </Card>

      {/* --- CARD 2: PENDING TASKS --- */}
      <Card className="p-4 flex flex-col justify-center border-border/50 shadow-sm transition-colors hover:border-primary/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Tasks</p>
            <p className="text-2xl md:text-3xl font-semibold tracking-tight">{stats?.pendingTasks ?? 0}</p>
          </div>
          <div className="p-2 md:p-3 bg-primary/15 text-primary rounded-lg">
            <CheckSquare className="size-5 md:size-6" />
          </div>
        </div>
      </Card>

      {/* --- CARD 3: FINANCES (Privacy Mode + Hidden on Mobile) --- */}
      {/* The 'hidden md:flex' classes completely remove this card on phone screens */}
      <Card className="hidden md:flex p-4 flex-col justify-center border-border/50 shadow-sm transition-colors hover:border-primary/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Owed To Me</p>
              {/* Privacy Toggle Button */}
              <button 
                onClick={() => setShowFinance(!showFinance)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary"
                aria-label="Toggle finance visibility"
              >
                {showFinance ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
            
            <p className="text-2xl md:text-3xl font-semibold tracking-tight text-success font-mono">
              {/* Conditional rendering based on the showFinance state */}
              {showFinance ? `Rs. ${stats?.owedToMe?.toLocaleString() ?? 0}` : "Rs. ****"}
            </p>
          </div>
          <div className="p-2 md:p-3 bg-success/15 text-success rounded-lg">
            <Wallet className="size-5 md:size-6" />
          </div>
        </div>
      </Card>
    </>
  );
}