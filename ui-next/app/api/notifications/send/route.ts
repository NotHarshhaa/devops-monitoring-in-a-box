import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/lib/notification-service'

const notificationService = new NotificationService()

export async function POST(request: NextRequest) {
  try {
    const { channel, message, severity = 'info', metadata = {} } = await request.json()
    
    if (!channel || !message) {
      return NextResponse.json(
        { error: 'Channel and message are required' },
        { status: 400 }
      )
    }

    const result = await notificationService.sendNotification(channel, message, severity, metadata)
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Failed to send notification:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
