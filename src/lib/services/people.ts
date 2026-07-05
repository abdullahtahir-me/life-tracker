import { createClient } from "@/utils/supabase/server";
import { Person } from "@/lib/types/database";
import { unstable_noStore as noStore } from "next/cache";

export async function getRecentNetwork(): Promise<Person[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Fetch the 4 most recently added people
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(4);

  if (error) {
    console.error("Error fetching network:", error.message);
    return [];
  }

  return data as Person[];
}

// ... existing getRecentNetwork function ...

export async function getNetwork() {
  noStore();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Fetch all people, ordered by who you added most recently
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching network:", error.message);
    return [];
  }

  return data as Person[];
}