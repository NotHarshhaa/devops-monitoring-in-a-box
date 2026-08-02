/**
 * Send a test notification to a single channel.
 *
 * Gated behind a write role for the same reason as /api/notifications/send, and
 * the channel name is validated against the known set so it cannot be used to
 * probe arbitrary service internals.
 */

import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/lib/notification-service'
import { requireAuth, WRITE_ROLES } from '@/lib/server/api-auth'

export const dynamic = 'force-dynamic'

const notificationService = new NotificationService()

const SUPPORTED_CHANNELS = ['slack', 'teams', 'discord', 'email', 'webhook'] as const

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channel: string }> }
) {
  const auth = await requireAuth(request, WRITE_ROLES)
  if (!auth.ok) {
    return auth.response
  }

  try {
    const { channel } = await params

    if (!(SUPPORTED_CHANNELS as readonly string[]).includes(channel)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported channel '${channel}'. Expected one of: ${SUPPORTED_CHANNELS.join(', ')}.`,
        },
        { status: 400 }
      )
    }

    const result = await notificationService.testNotification(channel)
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error(`Failed to test notification:`, error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
