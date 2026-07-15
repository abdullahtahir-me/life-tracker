import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { PushSubscription } from 'web-push'
import { sendWebPush, type WebPushPayload } from '@/lib/notifications/web-push'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const reminderSecret = process.env.TASK_REMINDER_SECRET ?? process.env.CRON_SECRET
const timeZone = 'Asia/Karachi'

type ReminderType = 'due_soon' | 'missed_tasks'

type TaskReminder = {
  id: string
  user_id: string
  title: string
  due_date: string
  priority: string
}

type StoredSubscription = {
  id: string
  user_id: string
  subscription: PushSubscription
}

type ExistingDelivery = {
  user_id: string
  notification_type: ReminderType
}

function getPakistanDateString(date = new Date()) {
  return date.toLocaleDateString('en-CA', { timeZone })
}

function addDays(dateString: string, days: number) {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + days))
  return date.toISOString().slice(0, 10)
}

function isAuthorized(request: Request) {
  if (!reminderSecret && process.env.NODE_ENV !== 'production') return true
  if (!reminderSecret) return false

  const authorization = request.headers.get('authorization')
  const cronSecret = request.headers.get('x-cron-secret')

  return (
    authorization === `Bearer ${reminderSecret}` ||
    cronSecret === reminderSecret
  )
}

function groupByUser(tasks: TaskReminder[]) {
  return tasks.reduce<Record<string, TaskReminder[]>>((groups, task) => {
    groups[task.user_id] ??= []
    groups[task.user_id].push(task)
    return groups
  }, {})
}

function formatTaskCount(tasks: TaskReminder[]) {
  if (tasks.length === 1) return `"${tasks[0].title}"`
  return `${tasks.length} tasks`
}

function buildPayload(type: ReminderType, tasks: TaskReminder[]): WebPushPayload {
  if (type === 'due_soon') {
    return {
      title: 'Tasks due soon',
      body: `${formatTaskCount(tasks)} due today or tomorrow.`,
      url: '/tasks',
    }
  }

  return {
    title: 'Missed task reminder',
    body: `${formatTaskCount(tasks)} overdue and still incomplete.`,
    url: '/tasks',
  }
}

async function sendReminderToSubscriptions(
  subscriptions: StoredSubscription[],
  payload: WebPushPayload,
) {
  const results = await Promise.allSettled(
    subscriptions.map((item) => sendWebPush(item.subscription, payload)),
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

  const sent = results.filter((result) => result.status === 'fulfilled').length

  return { sent, staleSubscriptionIds }
}

export async function GET(request: Request) {
  return POST(request)
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Supabase service role is not configured' },
      { status: 500 },
    )
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const today = getPakistanDateString()
  const tomorrow = addDays(today, 1)

  const { data: tasks, error: taskError } = await supabase
    .from('tasks')
    .select('id, user_id, title, due_date, priority')
    .eq('is_completed', false)
    .not('due_date', 'is', null)
    .lte('due_date', tomorrow)

  if (taskError) {
    return NextResponse.json({ error: taskError.message }, { status: 500 })
  }

  const dueSoonTasks = ((tasks ?? []) as TaskReminder[]).filter(
    (task) => task.due_date >= today && task.due_date <= tomorrow,
  )
  const missedTasks = ((tasks ?? []) as TaskReminder[]).filter(
    (task) => task.due_date < today,
  )
  const userIds = Array.from(
    new Set([...dueSoonTasks, ...missedTasks].map((task) => task.user_id)),
  )

  if (userIds.length === 0) {
    return NextResponse.json({
      checkedDate: today,
      sent: 0,
      skipped: 0,
      staleSubscriptionsRemoved: 0,
    })
  }

  const { data: subscriptions, error: subscriptionError } = await supabase
    .from('push_subscriptions')
    .select('id, user_id, subscription')
    .in('user_id', userIds)

  if (subscriptionError) {
    return NextResponse.json(
      { error: subscriptionError.message },
      { status: 500 },
    )
  }

  const { data: existingDeliveries, error: deliveryError } = await supabase
    .from('push_notification_deliveries')
    .select('user_id, notification_type')
    .eq('notification_date', today)
    .in('notification_type', ['due_soon', 'missed_tasks'])
    .in('user_id', userIds)

  if (deliveryError) {
    return NextResponse.json({ error: deliveryError.message }, { status: 500 })
  }

  const deliveredKeys = new Set(
    ((existingDeliveries ?? []) as ExistingDelivery[]).map(
      (delivery) => `${delivery.user_id}:${delivery.notification_type}`,
    ),
  )
  const subscriptionsByUser = (subscriptions ?? []).reduce<
    Record<string, StoredSubscription[]>
  >((groups, subscription) => {
    const item = subscription as StoredSubscription
    groups[item.user_id] ??= []
    groups[item.user_id].push(item)
    return groups
  }, {})
  const reminders: Array<{
    type: ReminderType
    tasksByUser: Record<string, TaskReminder[]>
  }> = [
    { type: 'due_soon', tasksByUser: groupByUser(dueSoonTasks) },
    { type: 'missed_tasks', tasksByUser: groupByUser(missedTasks) },
  ]

  let sent = 0
  let skipped = 0
  const staleSubscriptionIds = new Set<string>()
  const deliveryRows: Array<{
    user_id: string
    notification_type: ReminderType
    notification_date: string
  }> = []

  for (const reminder of reminders) {
    for (const [userId, userTasks] of Object.entries(reminder.tasksByUser)) {
      const deliveryKey = `${userId}:${reminder.type}`
      const userSubscriptions = subscriptionsByUser[userId] ?? []

      if (deliveredKeys.has(deliveryKey) || userSubscriptions.length === 0) {
        skipped += 1
        continue
      }

      const result = await sendReminderToSubscriptions(
        userSubscriptions,
        buildPayload(reminder.type, userTasks),
      )

      sent += result.sent
      result.staleSubscriptionIds.forEach((id) => staleSubscriptionIds.add(id))

      if (result.sent > 0) {
        deliveryRows.push({
          user_id: userId,
          notification_type: reminder.type,
          notification_date: today,
        })
      }
    }
  }

  if (staleSubscriptionIds.size > 0) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .in('id', Array.from(staleSubscriptionIds))
  }

  if (deliveryRows.length > 0) {
    const { error } = await supabase
      .from('push_notification_deliveries')
      .upsert(deliveryRows, {
        onConflict: 'user_id,notification_type,notification_date',
        ignoreDuplicates: true,
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({
    checkedDate: today,
    dueSoonTasks: dueSoonTasks.length,
    missedTasks: missedTasks.length,
    sent,
    skipped,
    staleSubscriptionsRemoved: staleSubscriptionIds.size,
  })
}
