"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, ArrowLeft, CheckCircle, Home, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset email")
      }

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
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
</div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="bg-card dark:bg-card border border-border dark:border-border dark:shadow-black/20">
            <CardContent className="pt-6 text-center px-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="h-10 w-10 text-foreground" />
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-xl sm:text-2xl font-bold mb-3 bg-clip-text text-transparent"
              >
                Reset Email Sent!
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-sm sm:text-base text-muted-foreground dark:text-muted-foreground mb-6"
              >
                We've sent a password reset link to your email address.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="space-y-3"
              >
                <Link href="/auth/signin">
                  <Button className="w-full h-11 dark: text-foreground font-medium transition-all duration-200">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sign In
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full h-11 bg-card hover:bg-muted dark:bg-muted dark:hover:bg-muted border-2 border-border dark:border-border dark:hover:border-border transition-all duration-200 dark:">
                    <Home className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
</div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-card dark:bg-card border border-border dark:border-border dark:shadow-black/20">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-16 h-16 flex items-center justify-center mx-auto mb-4"
            >
              <Mail className="h-8 w-8 text-foreground" />
            </motion.div>
            <CardTitle className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent">
              Forgot Password?
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground dark:text-muted-foreground">
              Enter your email to receive a reset link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            {/* Back to Sign In */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex justify-start mb-2"
            >
              <Link href="/auth/signin">
                <Button
                  variant="outline"
                  size="sm"
                  className="group relative overflow-hidden border-2 border-border dark:border-border dark: transition-all duration-300 px-4 py-2"
                >
                  <div className="flex items-center space-x-2">
                    <ArrowLeft className="h-4 w-4 text-muted-foreground dark:text-muted-foreground transition-colors duration-300" />
                    <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground transition-colors duration-300">
                      Back to Sign In
                    </span>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </Link>
            </motion.div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Demo Notice */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Alert className="border-border">
                <Mail className="h-4 w-4 text-foreground" />
                <AlertDescription className="text-sm">
                  <div className="space-y-1 text-xs sm:text-sm">
                    <p className="text-muted-foreground dark:text-muted-foreground">This is a demo. In production, you'll receive an actual reset email.</p>
                    <p className="text-muted-foreground dark:text-muted-foreground italic text-xs">For demo purposes, any email will work.</p>
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>

            {/* Forgot Password Form */}
            <motion.form 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              onSubmit={handleSubmit} 
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 border-2 transition-colors bg-card dark:bg-muted dark:border-border dark:text-muted-foreground dark:placeholder-gray-400"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 dark: text-foreground font-medium transition-all duration-200" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </motion.form>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center text-sm text-muted-foreground dark:text-muted-foreground"
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
