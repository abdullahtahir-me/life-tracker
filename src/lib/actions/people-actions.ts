'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Inside src/lib/actions/people-actions.ts

export async function quickCreatePerson(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get('name') as string;
  const role_company = formData.get('role_company') as string;
  const context_notes = formData.get('context_notes') as string; // Catch the new notes field
  
  if (!name) throw new Error("Name is required");

  const { error } = await supabase.from('people').insert({
    user_id: user.id,
    name,
    role_company: role_company || null,
    context_notes: context_notes || null, // Insert the notes
  });

  if (error) throw new Error(error.message);
  revalidatePath('/', 'layout');
}


export async function addPerson(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get('name') as string;
  const role_company = formData.get('role_company') as string;
  const context_notes = formData.get('context_notes') as string;

  if (!name) throw new Error("Name is required");

  const { error } = await supabase.from('people').insert({
    user_id: user.id,
    name,
    role_company,
    context_notes,
    last_contacted: new Date().toISOString().split('T')[0] // Default to today
  });

  if (error) throw new Error(error.message);
  revalidatePath('/network');
  revalidatePath('/dashboard');
}

export async function updateLastContacted(personId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const today = new Date().toISOString().split('T')[0];

  const { error } = await supabase
    .from('people')
    .update({ last_contacted: today })
    .eq('id', personId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/network');
}


// ... keep your existing addPerson and updateLastContacted ...

export async function deletePerson(personId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('people')
    .delete()
    .eq('id', personId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
}