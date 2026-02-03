"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Loader2, Github, Chrome, AlertCircle, Eye, EyeOff, CheckCircle, Home, Shield, Key } from "lucide-react"
import Link from "next/link"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }))
    }
    
    // Calculate password strength
    if (name === "password") {
      calculatePasswordStrength(value)
    }
  }
  
  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    
    // Length check
    if (password.length >= 8) strength += 25
    if (password.length >= 12) strength += 15
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength += 15
    if (/[A-Z]/.test(password)) strength += 15
    if (/[0-9]/.test(password)) strength += 15
    if (/[^a-zA-Z0-9]/.test(password)) strength += 15
    
    setPasswordStrength(Math.min(strength, 100))
  }
  
  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      errors.name = "Name is required"
    } else if (formData.name.length < 2) {
      errors.name = "Name must be at least 2 characters"
    }
    
    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }
    
    if (!formData.password) {
      errors.password = "Password is required"
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long"
    } else if (passwordStrength < 40) {
      errors.password = "Password is too weak. Please add more variety"
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (!validateForm()) {
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      setSuccess(true)
      
      // Auto sign in after successful registration
      setTimeout(async () => {
        await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })
        router.push("/dashboard")
        router.refresh()
      }, 2000)

    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true)
    setError("")

    try {
      await signIn(provider, { callbackUrl: "/dashboard" })
    } catch (error) {
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900 p-3 sm:p-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-400/20 dark:bg-green-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-400/10 dark:bg-green-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="shadow-2xl bg-white/90 dark:bg-gray-900/95 backdrop-blur-sm border-0 dark:border-gray-800/50 dark:shadow-black/20">
            <CardContent className="pt-6 text-center px-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25 dark:shadow-green-400/20"
              >
                <CheckCircle className="h-10 w-10 text-white" />
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-xl sm:text-2xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-green-900 dark:from-white dark:to-green-100 bg-clip-text text-transparent"
              >
                Registration Successful!
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-sm sm:text-base text-muted-foreground dark:text-gray-400 mb-6"
              >
                Your account has been created. You will be signed in automatically.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex items-center justify-center bg-green-50 dark:bg-green-900/20 dark:border-green-800/50 rounded-xl p-4 border"
              >
                <Loader2 className="h-5 w-5 animate-spin mr-3 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">Signing you in...</span>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900 p-3 sm:p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-400/20 dark:bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-400/10 dark:bg-green-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl relative z-10"
      >
        <Card className="shadow-2xl bg-white/90 dark:bg-gray-900/95 backdrop-blur-sm border-0 dark:border-gray-800/50 dark:shadow-black/20">
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Branding & Info */}
            <div className="lg:w-2/5 p-8 lg:p-12 bg-gradient-to-br from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 text-white rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-center lg:text-left"
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-6 shadow-lg">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-4">
                  Create Account
                </h1>
                <p className="text-green-100 text-lg mb-8">
                  Join the DevOps Monitoring Dashboard and start managing your infrastructure today.
                </p>
                
                {/* Features preview */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <h3 className="font-semibold mb-3 text-white">What You Get</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                      <span>Real-time monitoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                      <span>Advanced analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                      <span>Smart alerts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                      <span>Multi-service support</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Right Side - Form */}
            <div className="lg:w-3/5 p-8 lg:p-12">
              <CardHeader className="text-center pb-4 sm:pb-6 px-0">
                <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-green-900 dark:from-white dark:to-green-100 bg-clip-text text-transparent">
                  Sign Up
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Fill in your information to get started
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
                      className="group relative overflow-hidden bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-800 dark:to-green-900/20 border-2 border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500 hover:shadow-lg hover:shadow-green-500/10 dark:hover:shadow-green-400/20 transition-all duration-300 rounded-xl px-4 py-2"
                    >
                      <div className="flex items-center space-x-2">
                        <Home className="h-4 w-4 text-gray-600 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">
                          Back to Home
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 dark:from-green-400/0 dark:via-green-400/5 dark:to-green-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
                    <Alert key={index} variant="destructive" className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                  )
                ))}

                {/* OAuth Providers */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  <div className="relative">
                    <Button
                      variant="outline"
                      className="w-full h-11 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 dark:hover:border-gray-500 rounded-xl transition-all duration-200 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20 opacity-75 cursor-not-allowed"
                      disabled={true}
                    >
                      <Chrome className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">Google</span>
                      <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">Soon</span>
                    </Button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">OAuth coming soon</p>
                  </div>
                  
                  <div className="relative">
                    <Button
                      variant="outline"
                      className="w-full h-11 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 dark:hover:border-gray-500 rounded-xl transition-all duration-200 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20 opacity-75 cursor-not-allowed"
                      disabled={true}
                    >
                      <Github className="h-4 w-4 mr-2 text-gray-800 dark:text-gray-200" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">GitHub</span>
                      <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">Soon</span>
                    </Button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">OAuth coming soon</p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="relative"
                >
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white/90 dark:bg-gray-800/90 px-3 py-1 text-muted-foreground dark:text-gray-400 font-medium rounded-full border dark:border-gray-700">
                      Or continue with
                    </span>
                  </div>
                </motion.div>

                {/* Registration Form */}
                <motion.form 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  onSubmit={handleSubmit} 
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-900 dark:text-gray-100">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      className={`h-11 rounded-xl border-2 transition-colors bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 ${
                        formErrors.name ? 'border-red-500 focus:border-red-500' : 'focus:border-green-500 dark:focus:border-green-400'
                      }`}
                    />
                    {formErrors.name && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-gray-100">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        className={`h-11 rounded-xl border-2 transition-colors bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 ${
                          formErrors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-green-500 dark:focus:border-green-400'
                        }`}
                      />
                      {formErrors.email && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-900 dark:text-gray-100">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          disabled={isLoading}
                          className={`h-11 rounded-xl border-2 transition-colors pr-12 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 ${
                            formErrors.password ? 'border-red-500 focus:border-red-500' : 'focus:border-green-500 dark:focus:border-green-400'
                          }`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          )}
                        </Button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      {formData.password && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Password Strength</span>
                            <span className={`text-xs font-medium ${
                              passwordStrength < 40 ? 'text-red-600 dark:text-red-400' :
                              passwordStrength < 70 ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-green-600 dark:text-green-400'
                            }`}>
                              {passwordStrength < 40 ? 'Weak' : passwordStrength < 70 ? 'Fair' : 'Strong'}
                            </span>
                          </div>
                          <Progress 
                            value={passwordStrength} 
                            className={`h-2 ${
                              passwordStrength < 40 ? '[&>div]:bg-red-500' :
                              passwordStrength < 70 ? '[&>div]:bg-yellow-500' :
                              '[&>div]:bg-green-500'
                            }`}
                          />
                          <div className="flex flex-wrap gap-1">
                            {formData.password.length >= 8 && (
                              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                <Key className="h-3 w-3" />
                                <span>8+ chars</span>
                              </div>
                            )}
                            {/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) && (
                              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                <Shield className="h-3 w-3" />
                                <span>Mixed case</span>
                              </div>
                            )}
                            {/[0-9]/.test(formData.password) && (
                              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                <span className="font-bold">123</span>
                                <span>Numbers</span>
                              </div>
                            )}
                            {/[^a-zA-Z0-9]/.test(formData.password) && (
                              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                <span className="font-bold">!@#$</span>
                                <span>Symbols</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                      
                      {formErrors.password && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.password}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-900 dark:text-gray-100">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        className={`h-11 rounded-xl border-2 transition-colors pr-12 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 ${
                          formErrors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'focus:border-green-500 dark:focus:border-green-400'
                        }`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {formErrors.confirmPassword && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.confirmPassword}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 dark:from-green-500 dark:to-emerald-500 dark:hover:from-green-600 dark:hover:to-emerald-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl dark:shadow-green-500/25 dark:hover:shadow-green-500/40 transition-all duration-200" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </motion.form>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="text-center text-sm text-muted-foreground dark:text-gray-400"
                >
                  Already have an account?{" "}
                  <Link href="/auth/signin" className="text-green-600 dark:text-green-400 hover:underline font-medium">
                    Sign in
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
