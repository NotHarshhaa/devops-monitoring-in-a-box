"use client"

import { useState, Suspense } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Github, Chrome, AlertCircle, Eye, EyeOff, Home, Copy, Check } from "lucide-react"
import Link from "next/link"

function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedPassword, setCopiedPassword] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("from") || "/dashboard"

  const copyToClipboard = async (text: string, type: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'email') {
        setCopiedEmail(true)
        setTimeout(() => setCopiedEmail(false), 2000)
      } else {
        setCopiedPassword(true)
        setTimeout(() => setCopiedPassword(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === "email") setEmail(value)
    if (field === "password") setPassword(value)
    
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }))
    }
  }
  
  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address"
    }
    
    if (!password) {
      errors.password = "Password is required"
    } else if (password.length < 1) {
      errors.password = "Password cannot be empty"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (!validateForm()) {
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        // Store remember me preference
        if (rememberMe) {
          localStorage.setItem('remember-email', email)
        } else {
          localStorage.removeItem('remember-email')
        }
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true)
    setError("")

    try {
      await signIn(provider, { callbackUrl })
    } catch (error) {
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
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
        className="w-full max-w-4xl relative z-10"
      >
        <Card className="bg-card dark:bg-card border border-border dark:border-border dark:shadow-black/20">
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Branding & Info */}
            <div className="lg:w-2/5 p-8 lg:p-12 text-foreground rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-center lg:text-left"
              >
                <div className="w-16 h-16 bg-card flex items-center justify-center mx-auto lg:mx-0 mb-6">
                  <Chrome className="h-8 w-8 text-foreground" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-4">
                  Welcome Back
                </h1>
                <p className="text-foreground text-lg mb-8">
                  Sign in to access your DevOps Monitoring Dashboard and manage your infrastructure.
                </p>
                
                {/* Demo credentials preview */}
                <div className="bg-card p-4 border border-border">
                  <h3 className="font-semibold mb-3 text-foreground">Demo Credentials</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground text-sm">Email:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-foreground">demo@example.com</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard('demo@example.com', 'email')}
                          className="h-8 w-8 p-0 hover:bg-card text-foreground hover:text-foreground transition-colors"
                          title="Copy email"
                        >
                          {copiedEmail ? (
                            <Check className="h-4 w-4 text-foreground" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground text-sm">Password:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-foreground">demo123</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard('demo123', 'password')}
                          className="h-8 w-8 p-0 hover:bg-card text-foreground hover:text-foreground transition-colors"
                          title="Copy password"
                        >
                          {copiedPassword ? (
                            <Check className="h-4 w-4 text-foreground" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    {copiedEmail && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-foreground text-xs text-center"
                      >
                        Email copied to clipboard!
                      </motion.div>
                    )}
                    {copiedPassword && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-foreground text-xs text-center"
                      >
                        Password copied to clipboard!
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Right Side - Form */}
            <div className="lg:w-3/5 p-8 lg:p-12">
              <CardHeader className="text-center pb-4 sm:pb-6 px-0">
                <CardTitle className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent">
                  Sign In
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-muted-foreground dark:text-muted-foreground">
                  Enter your credentials to continue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-0">
                {/* Back to Home Button */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="flex justify-start"
                >
                  <Link href="/">
                    <Button
                      variant="outline"
                      size="sm"
                      className="group relative overflow-hidden border-2 border-border dark:border-border dark: transition-all duration-300 px-4 py-2"
                    >
                      <div className="flex items-center space-x-2">
                        <Home className="h-4 w-4 text-muted-foreground dark:text-muted-foreground transition-colors duration-300" />
                        <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground transition-colors duration-300">
                          Back to Home
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

                {/* Form field errors */}
                {Object.values(formErrors).map((error, index) => (
                  error && (
                    <Alert key={index} variant="destructive" className="bg-muted border-border">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                  )
                ))}

                {/* OAuth Providers */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  <div className="relative">
                    <Button
                      variant="outline"
                      className="w-full h-11 bg-card hover:bg-muted dark:bg-muted dark:hover:bg-muted border-2 border-border dark:border-border dark:hover:border-border transition-all duration-200 dark: opacity-75 cursor-not-allowed"
                      disabled={true}
                    >
                      <Chrome className="h-4 w-4 mr-2 text-foreground" />
                      <span className="font-medium text-muted-foreground dark:text-muted-foreground">Google</span>
                      <span className="absolute -top-2 -right-2 bg-muted text-foreground text-xs px-2 py-1 rounded-full">Soon</span>
                    </Button>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1 text-center">OAuth coming soon</p>
                  </div>
                  
                  <div className="relative">
                    <Button
                      variant="outline"
                      className="w-full h-11 bg-card hover:bg-muted dark:bg-muted dark:hover:bg-muted border-2 border-border dark:border-border dark:hover:border-border transition-all duration-200 dark: opacity-75 cursor-not-allowed"
                      disabled={true}
                    >
                      <Github className="h-4 w-4 mr-2 text-muted-foreground dark:text-muted-foreground" />
                      <span className="font-medium text-muted-foreground dark:text-muted-foreground">GitHub</span>
                      <span className="absolute -top-2 -right-2 bg-muted text-foreground text-xs px-2 py-1 rounded-full">Soon</span>
                    </Button>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1 text-center">OAuth coming soon</p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="relative"
                >
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card dark:bg-muted px-3 py-1 text-muted-foreground dark:text-muted-foreground font-medium rounded-full border dark:border-border">
                      Or continue with
                    </span>
                  </div>
                </motion.div>

                {/* Credentials Form */}
                <motion.form 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  onSubmit={handleCredentialsSignIn} 
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                        disabled={isLoading}
                        className={`h-11 border-2 transition-colors bg-card dark:bg-muted dark:border-border dark:text-muted-foreground dark:placeholder:text-muted-foreground ${ formErrors.email ? 'border-border ' : '' }`}
                      />
                      {formErrors.email && (
                        <p className="text-xs text-foreground mt-1">{formErrors.email}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          required
                          disabled={isLoading}
                          className={`h-11 border-2 transition-colors pr-12 bg-card dark:bg-muted dark:border-border dark:text-muted-foreground dark:placeholder:text-muted-foreground ${ formErrors.password ? 'border-border ' : '' }`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-9 w-9 hover:bg-muted dark:hover:bg-muted rounded-lg"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      {formErrors.password && (
                        <p className="text-xs text-foreground mt-1">{formErrors.password}</p>
                      )}
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        disabled={isLoading}
                        className="rounded border-border dark:border-border"
                      />
                      <Label
                        htmlFor="remember"
                        className="text-sm font-medium text-muted-foreground dark:text-muted-foreground cursor-pointer"
                      >
                        Remember me
                      </Label>
                    </div>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-foreground hover:underline font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 dark: text-foreground font-medium transition-all duration-200" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </motion.form>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="text-center text-sm text-muted-foreground dark:text-muted-foreground"
                >
                  Don't have an account?{" "}
                  <Link href="/auth/signup" className="text-foreground hover:underline font-medium">
                    Sign up
                  </Link>
                </motion.div>
              </CardContent>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}
