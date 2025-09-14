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
import { Loader2, Github, Chrome, AlertCircle, Eye, EyeOff, Home } from "lucide-react"
import Link from "next/link"

function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("from") || "/dashboard"

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900 p-3 sm:p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="shadow-2xl bg-white/90 dark:bg-gray-900/95 backdrop-blur-sm border-0 dark:border-gray-800/50 dark:shadow-black/20">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25 dark:shadow-blue-400/20"
            >
              <Chrome className="h-8 w-8 text-white" />
            </motion.div>
            <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Sign in to your DevOps Monitoring Dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            {/* Back to Home Button */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex justify-start mb-2"
            >
              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="group relative overflow-hidden bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-400/20 transition-all duration-300 rounded-xl px-4 py-2"
                >
                  <div className="flex items-center space-x-2">
                    <Home className="h-4 w-4 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
                      Back to Home
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 dark:from-blue-400/0 dark:via-blue-400/5 dark:to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-700/50 dark:shadow-lg dark:shadow-blue-500/10">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🚀</span>
                    <strong className="text-blue-800 dark:text-blue-200">Demo Preview</strong>
                  </div>
                  <div className="space-y-1 text-xs sm:text-sm">
                    <p className="text-gray-700 dark:text-gray-300">This is a preview version. Use these demo credentials:</p>
                    <div className="bg-white/70 dark:bg-gray-800/70 dark:border-gray-700/50 p-3 rounded-lg border dark:shadow-inner">
                      <p className="text-gray-800 dark:text-gray-200"><strong className="text-gray-900 dark:text-white">Email:</strong> demo@example.com</p>
                      <p className="text-gray-800 dark:text-gray-200"><strong className="text-gray-900 dark:text-white">Password:</strong> demo123</p>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 italic text-xs">For production use, configure your own environment variables.</p>
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>

            {/* OAuth Providers */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-3"
            >
              <Button
                variant="outline"
                className="w-full h-11 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 dark:hover:border-gray-500 rounded-xl transition-all duration-200 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20"
                onClick={() => handleOAuthSignIn("google")}
                disabled={isLoading}
              >
                <Chrome className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Continue with Google</span>
              </Button>
              
              <Button
                variant="outline"
                className="w-full h-11 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 dark:hover:border-gray-500 rounded-xl transition-all duration-200 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20"
                onClick={() => handleOAuthSignIn("github")}
                disabled={isLoading}
              >
                <Github className="h-4 w-4 mr-2 text-gray-800 dark:text-gray-200" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Continue with GitHub</span>
              </Button>
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
                <span className="bg-white/90 dark:bg-gray-800/90 px-3 py-1 text-muted-foreground dark:text-gray-400 font-medium rounded-full border dark:border-gray-700">
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
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-gray-100">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 rounded-xl border-2 focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-900 dark:text-gray-100">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11 rounded-xl border-2 focus:border-blue-500 dark:focus:border-blue-400 transition-colors pr-12 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
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
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl dark:shadow-blue-500/25 dark:hover:shadow-blue-500/40 transition-all duration-200" 
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
              className="text-center text-sm text-muted-foreground dark:text-gray-400"
            >
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Sign up
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="shadow-xl">
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
