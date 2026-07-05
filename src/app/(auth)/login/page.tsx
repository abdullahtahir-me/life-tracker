'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { login } from './actions'
import { Orbit, Loader2, LockKeyhole } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

// A smart button that automatically shows a loading state during server actions
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
      {pending ? 'Decrypting...' : 'Unlock System'}
    </button>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* The Bento-box style card */}
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-2xl">
        
        {/* Header / Logo */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Orbit className="size-7" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-card-foreground">
              Orbit OS
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Authorized access only.
            </p>
          </div>
        </div>

        {/* The Form */}
        <form action={login} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-card-foreground">
              Identity (Email)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="commander@orbit.os"
              required
              className="w-full rounded-lg border border-input bg-secondary/40 px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-medium text-card-foreground">
              Passphrase
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-input bg-secondary/40 px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring"
            />
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="mt-2 rounded-lg bg-destructive/15 p-3 text-center text-xs font-medium text-destructive">
              {error}
            </div>
          )}

          <SubmitButton />
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    // We wrap the form in Suspense because we are using useSearchParams()
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="size-6 animate-spin text-primary" /></div>}>
      <LoginForm />
    </Suspense>
  )
}