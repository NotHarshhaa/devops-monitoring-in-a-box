"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Loading03Icon, 
  Mail01Icon, 
  ArrowLeft02Icon, 
  CheckmarkCircle01Icon, 
  Home01Icon, 
  AlertCircleIcon 
} from "@hugeicons/core-free-icons"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          typeof data?.message === "string" && data.message
            ? data.message
            : "Failed to process password reset request"
        )
      }

      setStatusMessage(
        typeof data?.message === "string" && data.message
          ? data.message
          : "If an account exists for that email, a reset link has been processed."
      )
      setSuccess(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
        <motion.div
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="bg-card border border-border">
            <CardContent className="pt-6 text-center px-6">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-16 h-16 bg-muted flex items-center justify-center mx-auto mb-6 border border-border"
              >
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-8 w-8 text-foreground" />
              </motion.div>
              <motion.h2 
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl sm:text-2xl font-bold mb-3 text-foreground"
              >
                Request Processed
              </motion.h2>
              <motion.p 
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm sm:text-base text-muted-foreground mb-6"
              >
                {statusMessage || "We\u0027ve handled your password reset request."}
              </motion.p>
              <motion.div 
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <Button asChild className="w-full h-11 font-medium transition-all duration-200 gap-2">
                  <Link href="/auth/signin">
                    <HugeiconsIcon icon={ArrowLeft02Icon} className="h-4 w-4" />
                    Back to Sign In
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full h-11 bg-card hover:bg-muted border border-border transition-all duration-200 gap-2">
                  <Link href="/">
                    <HugeiconsIcon icon={Home01Icon} className="h-4 w-4" />
                    Back to Home
                  </Link>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-card border border-border">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <motion.div
              initial={false}
              animate={{ opacity: 1, scale: 1 }}
              className="w-16 h-16 bg-muted flex items-center justify-center mx-auto mb-4 border border-border"
            >
              <HugeiconsIcon icon={Mail01Icon} className="h-8 w-8 text-foreground" />
            </motion.div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
              Forgot Password?
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground">
              Enter your email to receive a reset link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            {/* Back to Sign In */}
            <motion.div 
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start mb-2"
            >
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border border-border hover:bg-muted transition-all duration-200 px-4 py-2 gap-2"
              >
                <Link href="/auth/signin">
                  <HugeiconsIcon icon={ArrowLeft02Icon} className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Back to Sign In
                  </span>
                </Link>
              </Button>
            </motion.div>

            {error && (
              <Alert variant="destructive">
                <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Demo Notice */}
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert className="border-border bg-muted">
                <HugeiconsIcon icon={Mail01Icon} className="h-4 w-4 text-foreground" />
                <AlertDescription className="text-sm">
                  <div className="space-y-1 text-xs sm:text-sm">
                    <p className="text-muted-foreground">This is a demo environment. In production, password resets are handled via configured identity or email services.</p>
                    <p className="text-muted-foreground italic text-xs">In demo mode, submitting a valid email simulates the reset flow without sending an email.</p>
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>

            {/* Forgot Password Form */}
            <motion.form 
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError("")
                  }}
                  required
                  disabled={isLoading}
                  className="h-11 bg-card border-border"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 font-medium transition-all duration-200" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />
                    Sending reset link...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={Mail01Icon} className="h-4 w-4" />
                    Send Reset Link
                  </div>
                )}
              </Button>
            </motion.form>

            <motion.div 
              initial={false}
              animate={{ opacity: 1 }}
              className="text-center text-sm text-muted-foreground"
            >
              Remember your password?{" "}
              <Link href="/auth/signin" className="text-foreground hover:underline font-medium">
                Sign in
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
