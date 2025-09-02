import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/lib/notification-service'

const notificationService = new NotificationService()

export async function POST(
  request: NextRequest,
  { params }: { params: { channel: string } }
) {
  try {
    const { channel } = params
    const result = await notificationService.testNotification(channel)
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error(`Failed to test ${params.channel} notification:`, error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
