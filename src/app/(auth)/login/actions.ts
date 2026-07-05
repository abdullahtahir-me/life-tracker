'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // --- THIS IS THE FIX ---
  // We added 'await' and removed the cookieStore argument
  // because your server.ts handles it automatically now!
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Login error:", error.message)
    // Redirect back to login with the error in the URL so we can show it
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // If successful, the cookie is set! Redirect to your private dashboard.
  return redirect('/dashboard')
}