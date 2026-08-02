/**
 * Notification configuration.
 *
 * Both methods require a signed-in caller: the stored configuration contains
 * SMTP credentials and channel webhook URLs. Reads are additionally redacted so
 * secrets never leave the server, and writes merge masked values back onto the
 * stored secrets so saving the settings form cannot wipe them.
 */

import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/lib/notification-service'
import { requireAuth, WRITE_ROLES } from '@/lib/server/api-auth'
import {
  mergeNotificationSecrets,
  redactNotificationsConfig,
} from '@/lib/server/notifications-redact'

export const dynamic = 'force-dynamic'

const notificationService = new NotificationService()

const NO_STORE = { 'Cache-Control': 'no-store' } as const

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) {
    return auth.response
  }

  try {
    const config = await notificationService.getConfiguration()
    return NextResponse.json(redactNotificationsConfig(config), { headers: NO_STORE })
  } catch (error) {
    console.error('Failed to get notification configuration:', error)
    return NextResponse.json(
      { error: 'Failed to get configuration' },
      { status: 500, headers: NO_STORE }
    )
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request, WRITE_ROLES)
  if (!auth.ok) {
    return auth.response
  }

  try {
    const incoming = await request.json()

    if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
      return NextResponse.json(
        { error: 'Request body must be a notification configuration object' },
        { status: 400, headers: NO_STORE }
      )
    }

    const current = await notificationService.getConfiguration()
    const merged = mergeNotificationSecrets(incoming, current)

    await notificationService.updateConfiguration(merged)

    return NextResponse.json(
      { success: true, config: redactNotificationsConfig(merged) },
      { headers: NO_STORE }
    )
  } catch (error) {
    console.error('Failed to update notification configuration:', error)
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500, headers: NO_STORE }
    )
  }
}
