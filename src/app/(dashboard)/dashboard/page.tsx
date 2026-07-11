import { StatsCards } from "@/components/dashboard/StatsCards";
import { ActiveTasks } from "@/components/dashboard/active-tasks";
import { RecentNetwork } from "@/components/dashboard/recent-network";

export default async function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your day at a glance.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatsCards />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <ActiveTasks />
        
        <RecentNetwork />

      </div>

    </div>
  );
}
