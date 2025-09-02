import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/lib/notification-service'

const notificationService = new NotificationService()

export async function GET() {
  try {
    const config = await notificationService.getConfiguration()
    return NextResponse.json(config)
  } catch (error) {
    console.error('Failed to get notification configuration:', error)
    return NextResponse.json(
      { error: 'Failed to get configuration' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const config = await request.json()
    await notificationService.updateConfiguration(config)
    return NextResponse.json({ success: true, config })
  } catch (error) {
    console.error('Failed to update notification configuration:', error)
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    )
  }
}
