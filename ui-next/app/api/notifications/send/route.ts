/**
 * Send an ad-hoc notification.
 *
 * Gated behind a write role: an open endpoint here lets anyone use the
 * deployment as a relay to spam the configured Slack/Teams/Discord/email
 * destinations.
 */

import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/lib/notification-service'
import { requireAuth, WRITE_ROLES } from '@/lib/server/api-auth'

export const dynamic = 'force-dynamic'

const notificationService = new NotificationService()

const MAX_MESSAGE_LENGTH = 4000

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, WRITE_ROLES)
  if (!auth.ok) {
    return auth.response
  }

  try {
    const { channel, message, severity = 'info', metadata = {} } = await request.json()

    if (!channel || !message) {
      return NextResponse.json(
        { error: 'Channel and message are required' },
        { status: 400 }
      )
    }

    if (typeof message === 'string' && message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message exceeds ${MAX_MESSAGE_LENGTH} characters` },
        { status: 413 }
      )
    }

    const result = await notificationService.sendNotification(channel, message, severity, {
      ...metadata,
      // Attribution makes it possible to trace who triggered a send.
      triggered_by: auth.identity.email ?? auth.identity.subject,
    })

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Failed to send notification:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
