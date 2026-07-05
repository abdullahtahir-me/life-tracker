'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get('name') as string;
  const domain_id = formData.get('domain_id') as string; // Projects MUST belong to a domain

  if (!name || !domain_id) throw new Error("Name and Domain are required");

  const { error } = await supabase.from('projects').insert({
    user_id: user.id,
    domain_id,
    name,
    status: 'active'
  });

  if (error) throw new Error(error.message);
  revalidatePath('/test'); // We will test this on a /test page
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from('projects').delete().eq('id', id).eq('user_id', user.id);
  if (error) throw new Error(error.message);
  
  revalidatePath('/test');
}

// ... keep your existing createProject and deleteProject functions ...

export async function updateProjectStatus(projectId: string, newStatus: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('projects')
    .update({ status: newStatus })
    .eq('id', projectId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/projects');
  revalidatePath('/dashboard');
}