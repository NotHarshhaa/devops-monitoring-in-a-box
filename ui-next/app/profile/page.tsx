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
      case "EDITOR":
      case "VIEWER":
        return "border-border bg-muted text-foreground"
      default:
        return "border-border bg-muted text-muted-foreground"
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
      <div className="flex items-center justify-center">
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
    <div className="space-y-4 sm:space-y-6">
      <div className="px-2 sm:px-4 py-3 sm:py-6 max-w-7xl mx-auto space-y-3 sm:space-y-6">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border border-border dark:border-border bg-card dark:bg-card overflow-hidden">
            <CardHeader className="text-foreground p-4 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 bg-card">
                      <User className="h-5 w-5 sm:h-7 sm:w-7 text-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-xl sm:text-3xl lg:text-4xl font-bold">
                        Profile
                      </CardTitle>
                      <CardDescription className="mt-1 sm:mt-2 text-foreground text-sm sm:text-base">
                        Manage your account settings and preferences
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Badge className="bg-card text-foreground border-border px-3 py-1.5 font-semibold text-sm">
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
            <Card className="border border-border dark:border-border bg-card dark:bg-card h-full">
              <CardHeader className="text-center pb-4 p-4 sm:p-6">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-white dark:ring-gray-900">
                      <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                      <AvatarFallback className="text-xl sm:text-2xl text-foreground">
                        {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-muted rounded-full border-2 border-border dark:border-border"></div>
                  </div>
                </div>
                <CardTitle className="text-lg sm:text-xl break-words text-muted-foreground dark:text-foreground">{session.user.name || "User"}</CardTitle>
                <CardDescription className="text-xs sm:text-sm break-words mt-1 text-muted-foreground dark:text-muted-foreground">{session.user.email}</CardDescription>
                <div className="flex justify-center mt-3">
                  <Badge className="text-foreground border border-border">
                    {getRoleIcon((session.user as any).role || "VIEWER")}
                    <span className="ml-1 text-xs sm:text-sm">{(session.user as any).role || "VIEWER"}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground dark:text-muted-foreground">Member since</span>
                    <span className="font-medium text-muted-foreground dark:text-foreground">October 2023</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground dark:text-muted-foreground">Last login</span>
                    <span className="font-medium text-muted-foreground dark:text-foreground">Today</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground dark:text-muted-foreground">Status</span>
                    <Badge variant="outline" className="bg-muted text-foreground text-xs border-border">
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
              className="text-center p-3 sm:p-4 border border-border"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-foreground">3</div>
              <div className="text-xs sm:text-sm text-foreground">My Dashboards</div>
              <div className="text-xs text-foreground mt-1">Custom dashboards created</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="text-center p-3 sm:p-4 border border-border"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-foreground">5</div>
              <div className="text-xs sm:text-sm text-foreground">My Configurations</div>
              <div className="text-xs text-foreground mt-1">Saved configurations</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="text-center p-3 sm:p-4 border border-border"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-foreground">127</div>
              <div className="text-xs sm:text-sm text-foreground">Activity</div>
              <div className="text-xs text-foreground mt-1">Actions this month</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="text-center p-3 sm:p-4 border border-border"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
                <Database className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-foreground">2.4 GB</div>
              <div className="text-xs sm:text-sm text-foreground">Data Usage</div>
              <div className="text-xs text-foreground mt-1">Storage used</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border border-border dark:border-border bg-card dark:bg-card">
            <CardContent className="p-4 sm:p-6">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-10 sm:h-11 border border-border dark:border-border">
                  <TabsTrigger value="personal" className="text-xs sm:text-sm data-[state=active]:bg-foreground data-[state=active]:text-background">Personal Information</TabsTrigger>
                  <TabsTrigger value="preferences" className="text-xs sm:text-sm data-[state=active]:bg-foreground data-[state=active]:text-background">Preferences</TabsTrigger>
                  <TabsTrigger value="security" className="text-xs sm:text-sm data-[state=active]:bg-foreground data-[state=active]:text-background">Security</TabsTrigger>
                </TabsList>

          <TabsContent value="personal" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border border-border dark:border-border bg-card dark:bg-card">
                      <CardHeader className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-muted-foreground dark:text-foreground">
                              <div className="p-2">
                                <User className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                              </div>
                              Personal Information
                            </CardTitle>
                            <CardDescription className="mt-1 text-muted-foreground dark:text-muted-foreground">
                              Update your personal details and contact information
                            </CardDescription>
                          </div>
                          <Button
                            variant={isEditing ? "outline" : "default"}
                            onClick={() => setIsEditing(!isEditing)}
                            className={isEditing ? "bg-card dark:bg-card border-border dark:border-border hover:bg-muted dark:hover:bg-muted" : "    text-foreground"}
                          >
                            {isEditing ? "Cancel" : "Edit"}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Full Name</Label>
                            <Input
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="h-10 sm:h-11 bg-card dark:bg-card border-border dark:border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Email Address</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="h-10 sm:h-11 bg-card dark:bg-card border-border dark:border-border"
                            />
                          </div>
                        </div>

                        {isEditing && (
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                            <Button onClick={handleSave} className="h-10 sm:h-11 gap-2 text-foreground">
                              <Save className="h-4 w-4" />
                              Save Changes
                            </Button>
                            <Button variant="outline" onClick={handleCancel} className="h-10 sm:h-11 bg-card dark:bg-card border-border dark:border-border hover:bg-muted dark:hover:bg-muted">
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
                    <Card className="border border-border dark:border-border bg-card dark:bg-card">
                      <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-muted-foreground dark:text-foreground">
                          <div className="p-2">
                            <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                          </div>
                          Preferences
                        </CardTitle>
                        <CardDescription className="mt-1 text-muted-foreground dark:text-muted-foreground">
                          Customize your dashboard and application preferences
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        <div className="text-center py-8">
                          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2 text-muted-foreground dark:text-foreground">Preferences</h3>
                          <p className="text-muted-foreground dark:text-muted-foreground">
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
                    <Card className="border border-border dark:border-border bg-card dark:bg-card">
                      <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-muted-foreground dark:text-foreground">
                          <div className="p-2">
                            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                          </div>
                          Security
                        </CardTitle>
                        <CardDescription className="mt-1 text-muted-foreground dark:text-muted-foreground">
                          Manage your account security and authentication settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        <div className="text-center py-8">
                          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2 text-muted-foreground dark:text-foreground">Security Settings</h3>
                          <p className="text-muted-foreground dark:text-muted-foreground">
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
