'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createDomain(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Extract data from the form
  const name = formData.get('name') as string;
  const color = formData.get('color') as string || '#3b82f6'; // Default blue
  const icon = formData.get('icon') as string || 'folder';

  if (!name) throw new Error("Domain name is required");

  // Insert securely
  const { error } = await supabase.from('domains').insert({
    user_id: user.id,
    name,
    color,
    icon
  });

  if (error) {
    console.error("Failed to create domain:", error.message);
    throw new Error("Failed to create domain");
  }

  // Tell Next.js to refresh the page so the new domain shows up instantly
  revalidatePath('/'); 
}


export async function deleteDomain(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Because we set ON DELETE CASCADE in SQL, deleting a domain here 
  // will automatically delete all Projects and Tasks inside it!
  const { error } = await supabase
    .from('domains')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error("Failed to delete domain:", error.message);
    throw new Error("Failed to delete domain");
  }

  revalidatePath('/');
}