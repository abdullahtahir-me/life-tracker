import { NextResponse } from 'next/server'
import { getVapidPublicKey } from '@/lib/notifications/web-push'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const publicKey = getVapidPublicKey()

  if (!publicKey) {
    return NextResponse.json(
      { error: 'Web push is not configured' },
      { status: 503 },
    )
  }

  return NextResponse.json(
    { publicKey },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
