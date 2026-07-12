import { createClient } from "@/utils/supabase/server";
import { Domain } from "@/lib/types/database";

export async function getDomains(): Promise<Domain[]> {
  const supabase = await createClient();
  
  // 1. Get the user securely
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // 2. Fetch the domains. 
  // RLS (Row-Level Security) guarantees we only get YOUR domains.
  const { data, error } = await supabase
    .from('domains')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching domains:", error.message);
    return [];
  }

  return data as Domain[];
}
