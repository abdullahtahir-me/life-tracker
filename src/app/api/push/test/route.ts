import { NextResponse } from 'next/server'
import type { PushSubscription } from 'web-push'
import { sendWebPush } from '@/lib/notifications/web-push'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

type StoredSubscription = {
  id: string
  subscription: PushSubscription
}

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('id, subscription')
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const subscriptions = (data ?? []) as StoredSubscription[]

  if (subscriptions.length === 0) {
    return NextResponse.json(
      { error: 'No push subscriptions found' },
      { status: 404 },
    )
  }

  const results = await Promise.allSettled(
    subscriptions.map((item) =>
      sendWebPush(item.subscription, {
        title: 'Orbit OS',
        body: 'Web push notifications are enabled for this browser.',
        url: '/settings',
      }),
    ),
  )

  const staleSubscriptionIds = results
    .map((result, index) => {
      if (result.status === 'fulfilled') return null

      const statusCode = result.reason?.statusCode
      return statusCode === 404 || statusCode === 410
        ? subscriptions[index].id
        : null
    })
    .filter((id): id is string => Boolean(id))

  if (staleSubscriptionIds.length > 0) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .in('id', staleSubscriptionIds)
  }

  const sent = results.filter((result) => result.status === 'fulfilled').length

  if (sent === 0) {
    return NextResponse.json(
      { error: 'No test notifications were sent' },
      { status: 502 },
    )
  }

  return NextResponse.json({ sent })
}
