import { createClient } from "@/utils/supabase/server";
import { unstable_noStore as noStore } from "next/cache";

export async function getDashboardMetrics() {
  noStore(); // Ensure we always fetch the freshest data
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { activeProjects: 0, pendingTasks: 0, owedToMe: 0 };
  }

  // 1. Get count of Active Projects
  const { count: activeProjects } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'active');

  // 2. Get count of Pending Tasks
  const { count: pendingTasks } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_completed', false);

  // 3. Get sum of Finances (Money owed to you)
  const { data: finances } = await supabase
    .from('finances')
    .select('amount')
    .eq('user_id', user.id)
    .eq('transaction_type', 'lent')
    .eq('is_settled', false);

  // Calculate the total money owed to you
  const owedToMe = finances?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;

  return {
    activeProjects: activeProjects ?? 0,
    pendingTasks: pendingTasks ?? 0,
    owedToMe: owedToMe,
  };
}