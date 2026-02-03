"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  Shield, 
  Settings, 
  Save,
  Edit,
  Crown,
  Eye,
  Activity,
  Database,
  BarChart3
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
  })

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Crown className="h-4 w-4" />
      case "EDITOR":
        return <Edit className="h-4 w-4" />
      case "VIEWER":
        return <Eye className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "EDITOR":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "VIEWER":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSave = async () => {
    // In a real app, you would update the user profile here
    await update({
      ...session,
      user: {
        ...session?.user,
        name: formData.name,
        email: formData.email,
      }
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: session?.user?.name || "",
      email: session?.user?.email || "",
    })
    setIsEditing(false)
  }

  if (!session?.user) {
    // Use useEffect to handle client-side navigation
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">Please sign in to access your profile.</p>
          <Button onClick={() => router.push("/auth/signin")}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20">
      <div className="px-2 sm:px-4 py-3 sm:py-6 max-w-7xl mx-auto space-y-3 sm:space-y-6">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-900 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-700 text-white p-4 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                      <User className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl sm:text-3xl lg:text-4xl font-bold">
                        Profile
                      </CardTitle>
                      <CardDescription className="mt-1 sm:mt-2 text-blue-100 text-sm sm:text-base">
                        Manage your account settings and preferences
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Badge className="bg-white/20 text-white border-white/30 px-3 py-1.5 font-semibold text-sm">
                    <Shield className="h-3 w-3 mr-1" />
                    Account
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Enhanced Profile Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4"
        >
          {/* Enhanced Profile Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900 h-full">
              <CardHeader className="text-center pb-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-4 sm:p-6">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-white dark:ring-gray-900">
                      <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                      <AvatarFallback className="text-xl sm:text-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                  </div>
                </div>
                <CardTitle className="text-lg sm:text-xl break-words text-gray-900 dark:text-white">{session.user.name || "User"}</CardTitle>
                <CardDescription className="text-xs sm:text-sm break-words mt-1 text-gray-600 dark:text-gray-400">{session.user.email}</CardDescription>
                <div className="flex justify-center mt-3">
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
                    {getRoleIcon((session.user as any).role || "VIEWER")}
                    <span className="ml-1 text-xs sm:text-sm">{(session.user as any).role || "VIEWER"}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Member since</span>
                    <span className="font-medium text-gray-900 dark:text-white">October 2023</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Last login</span>
                    <span className="font-medium text-gray-900 dark:text-white">Today</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Status</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs border-green-200 dark:border-green-800">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Stats Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">3</div>
              <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">My Dashboards</div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Custom dashboards created</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400">5</div>
              <div className="text-xs sm:text-sm text-purple-700 dark:text-purple-300">My Configurations</div>
              <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Saved configurations</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">127</div>
              <div className="text-xs sm:text-sm text-green-700 dark:text-green-300">Activity</div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">Actions this month</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="text-center p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Database className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400">2.4 GB</div>
              <div className="text-xs sm:text-sm text-orange-700 dark:text-orange-300">Data Usage</div>
              <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">Storage used</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900">
            <CardContent className="p-4 sm:p-6">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-10 sm:h-11 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 border border-gray-200 dark:border-gray-700">
                  <TabsTrigger value="personal" className="text-xs sm:text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white">Personal Information</TabsTrigger>
                  <TabsTrigger value="preferences" className="text-xs sm:text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white">Preferences</TabsTrigger>
                  <TabsTrigger value="security" className="text-xs sm:text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white">Security</TabsTrigger>
                </TabsList>

          <TabsContent value="personal" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900">
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                                <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                              </div>
                              Personal Information
                            </CardTitle>
                            <CardDescription className="mt-1 text-gray-600 dark:text-gray-400">
                              Update your personal details and contact information
                            </CardDescription>
                          </div>
                          <Button
                            variant={isEditing ? "outline" : "default"}
                            onClick={() => setIsEditing(!isEditing)}
                            className={isEditing ? "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"}
                          >
                            {isEditing ? "Cancel" : "Edit"}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</Label>
                            <Input
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="h-10 sm:h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="h-10 sm:h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                            />
                          </div>
                        </div>

                        {isEditing && (
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                            <Button onClick={handleSave} className="h-10 sm:h-11 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                              <Save className="h-4 w-4" />
                              Save Changes
                            </Button>
                            <Button variant="outline" onClick={handleCancel} className="h-10 sm:h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800">
                              Cancel
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="preferences" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900">
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 p-4 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                            <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          Preferences
                        </CardTitle>
                        <CardDescription className="mt-1 text-gray-600 dark:text-gray-400">
                          Customize your dashboard and application preferences
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        <div className="text-center py-8">
                          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Preferences</h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            Customize your dashboard and application preferences here.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="security" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900">
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-800 dark:to-green-900/20 p-4 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          Security
                        </CardTitle>
                        <CardDescription className="mt-1 text-gray-600 dark:text-gray-400">
                          Manage your account security and authentication settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        <div className="text-center py-8">
                          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Security Settings</h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            Manage your account security and authentication settings here.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
