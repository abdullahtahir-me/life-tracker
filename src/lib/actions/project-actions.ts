'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

async function assertDomainBelongsToUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  domainId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from('domains')
    .select('id')
    .eq('id', domainId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Invalid domain");
}

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get('name') as string;
  const domain_id = formData.get('domain_id') as string; // Projects MUST belong to a domain

  if (!name || !domain_id) throw new Error("Name and Domain are required");
  await assertDomainBelongsToUser(supabase, domain_id, user.id);

  const { error } = await supabase.from('projects').insert({
    user_id: user.id,
    domain_id,
    name,
    status: 'active'
  });

  if (error) throw new Error(error.message);
  revalidatePath('/projects');
  revalidatePath('/dashboard');
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from('projects').delete().eq('id', id).eq('user_id', user.id);
  if (error) throw new Error(error.message);

  revalidatePath('/projects');
  revalidatePath('/dashboard');
}


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
