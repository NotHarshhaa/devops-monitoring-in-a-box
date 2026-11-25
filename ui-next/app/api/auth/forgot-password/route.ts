import { NextRequest, NextResponse } from "next/server"
import { isDemoAuthEnabled } from "@/lib/auth-simple"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { message: "Invalid request payload" },
        { status: 400 }
      )
    }

    const email =
      typeof (body as { email?: unknown })?.email === "string"
        ? (body as { email: string }).email.trim()
        : ""

    if (!email || !EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address" },
        { status: 400 }
      )
    }

    if (!isDemoAuthEnabled()) {
      return NextResponse.json(
        {
          message:
            "Self-service password resets are disabled. Contact your administrator to update credentials.",
        },
        { status: 501 }
      )
    }

    return NextResponse.json({
      ok: true,
      demo: true,
      message:
        "Demo mode active: no email is dispatched. Use the configured demo credentials on the sign-in page.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
