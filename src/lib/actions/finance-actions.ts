'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addTransaction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const entity_name = formData.get('entity_name') as string;
  const amount = Number(formData.get('amount'));
  const transaction_type = formData.get('transaction_type') as string; // 'lent' or 'borrowed'
  const description = formData.get('description') as string;

  if (!entity_name || !amount || !transaction_type) {
    throw new Error("Missing required fields");
  }

  const { error } = await supabase.from('finances').insert({
    user_id: user.id,
    entity_name,
    amount,
    transaction_type,
    description,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/finances');
  revalidatePath('/dashboard'); // Update the dashboard widget too
}

export async function markAsSettled(transactionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('finances')
    .update({ is_settled: true })
    .eq('id', transactionId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/finances');
  revalidatePath('/dashboard');
}

// ... existing addTransaction and markAsSettled functions ...

export async function undoSettled(transactionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Flip the boolean back to false
  const { error } = await supabase
    .from('finances')
    .update({ is_settled: false })
    .eq('id', transactionId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/finances');
  revalidatePath('/dashboard');
}