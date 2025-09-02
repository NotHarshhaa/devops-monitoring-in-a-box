import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/lib/notification-service'

const notificationService = new NotificationService()

export async function POST(request: NextRequest) {
  try {
    const alertData = await request.json()
    console.log('Received alert webhook:', alertData)

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
