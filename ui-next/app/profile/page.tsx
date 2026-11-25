"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  UserIcon, 
  Shield01Icon, 
  Settings01Icon, 
  FloppyDiskIcon,
  Edit02Icon,
  StarIcon,
  EyeIcon,
  Activity01Icon,
  DatabaseIcon,
  Analytics01Icon,
  LockIcon,
  CheckmarkCircle01Icon,
  DashboardSquare01Icon
} from "@hugeicons/core-free-icons"
import { useRouter } from "next/navigation"
import { PageConnections } from "@/components/page-connections"
import { ThemeToggle } from "@/components/theme-toggle"
import { toast } from "@/hooks/use-toast"

const PREFERENCES_STORAGE_KEY = "monitoring-user-preferences"

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
  })
  const [preferences, setPreferences] = useState({
    defaultTimeRange: "24h",
    autoRefresh: true,
    compactCards: false,
  })
  const [workspaceCounts, setWorkspaceCounts] = useState({
    templates: 0,
    plugins: 0,
  })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!isEditing && session?.user) {
        setFormData({
          name: session.user.name || "",
          email: session.user.email || "",
        })
      }
      try {
        const savedPrefs = localStorage.getItem(PREFERENCES_STORAGE_KEY)
        if (savedPrefs) {
          const parsed = JSON.parse(savedPrefs)
          if (parsed && typeof parsed === "object") {
            setPreferences(prev => ({ ...prev, ...parsed }))
          }
        }
        const savedTemplates = localStorage.getItem("monitoring-imported-templates")
        const savedPlugins = localStorage.getItem("monitoring-plugin-instances")
        setWorkspaceCounts({
          templates: savedTemplates ? JSON.parse(savedTemplates).length || 0 : 0,
          plugins: savedPlugins ? JSON.parse(savedPlugins).length || 0 : 0,
        })
      } catch {
        // Ignore storage read errors
      }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [session?.user, isEditing])

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <HugeiconsIcon icon={StarIcon} className="h-4 w-4" />
      case "EDITOR":
        return <HugeiconsIcon icon={Edit02Icon} className="h-4 w-4" />
      case "VIEWER":
        return <HugeiconsIcon icon={EyeIcon} className="h-4 w-4" />
      default:
        return <HugeiconsIcon icon={UserIcon} className="h-4 w-4" />
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
    const trimmedName = formData.name.trim()
    const trimmedEmail = formData.email.trim()
    if (!trimmedName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast({
        title: "Invalid profile details",
        description: "Please provide a display name and valid email address.",
        variant: "destructive",
      })
      return
    }
    setIsSaving(true)
    try {
      await update({
        name: trimmedName,
        email: trimmedEmail,
      })
      setFormData({ name: trimmedName, email: trimmedEmail })
      setIsEditing(false)
      toast({
        title: "Profile updated",
        description: "Your session profile details have been saved.",
      })
    } catch {
      toast({
        title: "Update failed",
        description: "Could not update session profile.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePreferences = () => {
    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
      toast({
        title: "Preferences saved",
        description: "Your monitoring workspace preferences were updated.",
      })
    } catch {
      toast({
        title: "Save failed",
        description: "Unable to persist preferences in this browser.",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setFormData({
      name: session?.user?.name || "",
      email: session?.user?.email || "",
    })
    setIsEditing(false)
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-foreground">Authentication Required</h2>
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
          <Card className="border border-border bg-card overflow-hidden">
            <CardHeader className="text-foreground p-4 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 bg-muted">
                      <HugeiconsIcon icon={UserIcon} className="h-5 w-5 sm:h-7 sm:w-7 text-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                        Profile
                      </CardTitle>
                      <CardDescription className="mt-1 sm:mt-2 text-muted-foreground text-sm sm:text-base">
                        Manage your account settings and preferences
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Badge className="bg-muted text-foreground border-border px-3 py-1.5 font-semibold text-sm">
                    <HugeiconsIcon icon={Shield01Icon} className="h-3.5 w-3.5 mr-1" />
                    Account
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Cross-page navigation */}
        <PageConnections
          links={[
            { href: '/dashboard', label: 'Dashboard', icon: DashboardSquare01Icon },
            { href: '/settings', label: 'Settings', icon: Settings01Icon },
          ]}
        />

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
            <Card className="border border-border bg-card h-full">
              <CardHeader className="text-center pb-4 p-4 sm:p-6">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-border">
                      <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                      <AvatarFallback className="text-xl sm:text-2xl text-foreground bg-muted">
                        {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <CardTitle className="text-lg sm:text-xl break-words text-foreground">{session.user.name || "User"}</CardTitle>
                <CardDescription className="text-xs sm:text-sm break-words mt-1 text-muted-foreground">{session.user.email}</CardDescription>
                <div className="flex justify-center mt-3">
                  <Badge className="text-foreground border border-border bg-muted">
                    {getRoleIcon((session.user as any).role || "VIEWER")}
                    <span className="ml-1 text-xs sm:text-sm">{(session.user as any).role || "VIEWER"}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Authentication</span>
                    <span className="font-medium text-foreground">Session JWT</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Account Role</span>
                    <span className="font-medium text-foreground">{(session.user as any).role || "VIEWER"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="outline" className="px-2 py-0.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs border-emerald-500/40">
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
              className="text-center p-3 sm:p-4 border border-border bg-card"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted flex items-center justify-center mx-auto mb-2">
                <HugeiconsIcon icon={Analytics01Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-foreground">{workspaceCounts.templates}</div>
              <div className="text-xs sm:text-sm text-foreground">Saved Templates</div>
              <div className="text-xs text-muted-foreground mt-1">In local collection</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="text-center p-3 sm:p-4 border border-border bg-card"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted flex items-center justify-center mx-auto mb-2">
                <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-foreground">{workspaceCounts.plugins}</div>
              <div className="text-xs sm:text-sm text-foreground">Configured Plugins</div>
              <div className="text-xs text-muted-foreground mt-1">Saved instances</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="text-center p-3 sm:p-4 border border-border bg-card"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted flex items-center justify-center mx-auto mb-2">
                <HugeiconsIcon icon={Activity01Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-foreground">{preferences.defaultTimeRange}</div>
              <div className="text-xs sm:text-sm text-foreground">Default Range</div>
              <div className="text-xs text-muted-foreground mt-1">Preferred time window</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="text-center p-3 sm:p-4 border border-border bg-card"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted flex items-center justify-center mx-auto mb-2">
                <HugeiconsIcon icon={DatabaseIcon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
              </div>
              <div className="text-lg sm:text-xl font-bold text-foreground">{(session.user as any).role || "VIEWER"}</div>
              <div className="text-xs sm:text-sm text-foreground">Access Tier</div>
              <div className="text-xs text-muted-foreground mt-1">Role-based permissions</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border border-border bg-card">
            <CardContent className="p-4 sm:p-6">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-10 sm:h-11 bg-muted p-1">
                  <TabsTrigger value="personal" className="text-xs sm:text-sm">Personal Information</TabsTrigger>
                  <TabsTrigger value="preferences" className="text-xs sm:text-sm">Preferences</TabsTrigger>
                  <TabsTrigger value="security" className="text-xs sm:text-sm">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border border-border bg-card">
                      <CardHeader className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                              <HugeiconsIcon icon={UserIcon} className="h-5 w-5 text-foreground" />
                              Personal Information
                            </CardTitle>
                            <CardDescription className="mt-1 text-muted-foreground">
                              Update your personal details and contact information
                            </CardDescription>
                          </div>
                          <Button
                            variant={isEditing ? "outline" : "default"}
                            onClick={() => setIsEditing(!isEditing)}
                            className={isEditing ? "bg-card border-border hover:bg-muted" : ""}
                          >
                            {isEditing ? "Cancel" : "Edit"}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</Label>
                            <Input
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="h-10 sm:h-11 bg-card border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="h-10 sm:h-11 bg-card border-border"
                            />
                          </div>
                        </div>

                        {isEditing && (
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                            <Button onClick={handleSave} disabled={isSaving} className="h-10 sm:h-11 gap-2">
                              <HugeiconsIcon icon={FloppyDiskIcon} className="h-4 w-4" />
                              {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button variant="outline" onClick={handleCancel} disabled={isSaving} className="h-10 sm:h-11 bg-card border-border hover:bg-muted">
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
                    <Card className="border border-border bg-card">
                      <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-foreground">
                          <HugeiconsIcon icon={Settings01Icon} className="h-5 w-5 text-foreground" />
                          Preferences
                        </CardTitle>
                        <CardDescription className="mt-1 text-muted-foreground">
                          Customize your dashboard appearance and default workspace behavior
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-border">
                          <div>
                            <p className="text-sm font-medium text-foreground">Color Theme</p>
                            <p className="text-xs text-muted-foreground">Switch between light, dark, or system theme</p>
                          </div>
                          <ThemeToggle />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-border">
                          <div>
                            <p className="text-sm font-medium text-foreground">Default Time Range</p>
                            <p className="text-xs text-muted-foreground">Preferred initial range for dashboards</p>
                          </div>
                          <Select
                            value={preferences.defaultTimeRange}
                            onValueChange={(value) => setPreferences(prev => ({ ...prev, defaultTimeRange: value }))}
                          >
                            <SelectTrigger className="w-full sm:w-[160px] bg-card border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1h">Last 1 Hour</SelectItem>
                              <SelectItem value="6h">Last 6 Hours</SelectItem>
                              <SelectItem value="24h">Last 24 Hours</SelectItem>
                              <SelectItem value="7d">Last 7 Days</SelectItem>
                              <SelectItem value="30d">Last 30 Days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between gap-4 p-4 border border-border">
                          <div>
                            <p className="text-sm font-medium text-foreground">Auto-Refresh Polling</p>
                            <p className="text-xs text-muted-foreground">Automatically refresh live metrics & health probes</p>
                          </div>
                          <Switch
                            checked={preferences.autoRefresh}
                            onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, autoRefresh: checked }))}
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button onClick={handleSavePreferences} className="gap-2">
                            <HugeiconsIcon icon={FloppyDiskIcon} className="h-4 w-4" />
                            Save Preferences
                          </Button>
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
                    <Card className="border border-border bg-card">
                      <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-foreground">
                          <HugeiconsIcon icon={Shield01Icon} className="h-5 w-5 text-foreground" />
                          Security & Session
                        </CardTitle>
                        <CardDescription className="mt-1 text-muted-foreground">
                          Review your current authentication state and role permissions
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 border border-border space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                              <HugeiconsIcon icon={LockIcon} className="h-4 w-4" />
                              Session Strategy
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Signed in with HTTP-only encrypted JWT session cookie via NextAuth.
                            </p>
                            <Badge variant="outline" className="px-2 py-0.5 text-xs">
                              <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-3 w-3 mr-1" />
                              Verified Session
                            </Badge>
                          </div>

                          <div className="p-4 border border-border space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                              <HugeiconsIcon icon={Shield01Icon} className="h-4 w-4" />
                              Assigned Role: {(session.user as any).role || "VIEWER"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {(session.user as any).role === "ADMIN"
                                ? "Full administrative access including Alertmanager silences, system settings, and admin diagnostics."
                                : (session.user as any).role === "EDITOR"
                                ? "Can view metrics and manage operational alerts and templates."
                                : "Read-only access to dashboards, metrics, logs, and alerts."}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground">
                            Need to switch accounts or revoke this session?
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                            className="border-border hover:bg-muted"
                          >
                            Sign Out
                          </Button>
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
