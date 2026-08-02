/**
 * Alertmanager webhook receiver.
 *
 * This is a machine-to-machine endpoint, so it cannot use a session cookie.
 * It is instead protected by the `ALERT_WEBHOOK_TOKEN` shared secret, which
 * Alertmanager sends as a bearer token (see alertmanager/config.yml).
 *
 * Without a token the endpoint is an open relay into every configured
 * notification channel, so a warning is logged when it is unset.
 */

import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/lib/notification-service'
import { verifyWebhookToken } from '@/lib/server/api-auth'

export const dynamic = 'force-dynamic'

const notificationService = new NotificationService()

/** Alertmanager batches alerts; refuse absurd payloads outright. */
const MAX_ALERTS = 500

export async function POST(request: NextRequest) {
  if (!verifyWebhookToken(request)) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Invalid or missing webhook token.' },
      { status: 401 }
    )
  }

  try {
    const alertData = await request.json()

    if (!alertData || typeof alertData !== 'object' || Array.isArray(alertData)) {
      return NextResponse.json(
        { error: 'Webhook payload must be an Alertmanager notification object' },
        { status: 400 }
      )
    }

    if (Array.isArray(alertData.alerts) && alertData.alerts.length > MAX_ALERTS) {
      return NextResponse.json(
        { error: `Payload contains more than ${MAX_ALERTS} alerts` },
        { status: 413 }
      )
    }

    const result = await notificationService.processAlertWebhook(alertData)
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Alert webhook processing failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
