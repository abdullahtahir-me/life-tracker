import { NextResponse } from 'next/server'
import type { PushSubscription } from 'web-push'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

type SubscriptionBody = {
  subscription?: PushSubscription
}

function isPushSubscription(value: unknown): value is PushSubscription {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Partial<PushSubscription>
  return (
    typeof candidate.endpoint === 'string' &&
    !!candidate.keys &&
    typeof candidate.keys.p256dh === 'string' &&
    typeof candidate.keys.auth === 'string'
  )
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { count, error } = await supabase
    .from('push_subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ count: count ?? 0 })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as SubscriptionBody

  if (!isPushSubscription(body.subscription)) {
    return NextResponse.json(
      { error: 'Invalid push subscription' },
      { status: 400 },
    )
  }

  const subscription = body.subscription
  const userAgent = request.headers.get('user-agent')
  const now = new Date().toISOString()

  const { data: existing, error: lookupError } = await supabase
    .from('push_subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('endpoint', subscription.endpoint)
    .maybeSingle()

  if (lookupError) {
    return NextResponse.json({ error: lookupError.message }, { status: 500 })
  }

  const query = existing
    ? supabase
        .from('push_subscriptions')
        .update({
          subscription,
          user_agent: userAgent,
          updated_at: now,
        })
        .eq('id', existing.id)
    : supabase.from('push_subscriptions').insert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        subscription,
        user_agent: userAgent,
        created_at: now,
        updated_at: now,
      })

  const { error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { endpoint } = (await request.json()) as { endpoint?: unknown }

  if (typeof endpoint !== 'string') {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', endpoint)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
