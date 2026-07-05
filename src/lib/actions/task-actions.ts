'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTask(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const title = formData.get('title') as string;
  const domain_id = formData.get('domain_id') as string;
  const project_id = formData.get('project_id') as string | null; // Optional
  const due_date = formData.get('due_date') as string | null;

  if (!title || !domain_id) throw new Error("Title and Domain are required");

  const { error } = await supabase.from('tasks').insert({
    user_id: user.id,
    domain_id,
    project_id: project_id ? project_id : null, // Send null if empty
    title,
    due_date: due_date ? due_date : null,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/test'); 
}

// Special action just for checking off a task!
export async function toggleTaskComplete(id: string, currentStatus: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from('tasks')
    .update({ is_completed: !currentStatus })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/test');
}


// Inside src/lib/actions/task-actions.ts

export async function quickCreateTask(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const title = formData.get('title') as string;
  const domain_id = formData.get('domain_id') as string; 
  const input_date = formData.get('due_date') as string; // Catch the new date field

  if (!title || !domain_id) throw new Error("Title and Domain are required");

  // If a date is provided, use it. Otherwise, default to today in Pakistan time.
  const final_due_date = input_date || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });

  const { error } = await supabase.from('tasks').insert({
    user_id: user.id,
    domain_id: domain_id,
    title,
    due_date: final_due_date, 
  });

  if (error) throw new Error(error.message);
  revalidatePath('/', 'layout'); 
}
// ... existing createTask and toggleTaskComplete functions ...

export async function deleteTask(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  
  revalidatePath('/tasks');
  revalidatePath('/dashboard'); // Keep the dashboard in sync!
  revalidatePath('/projects');  // Keep the project progress bars in sync!
}