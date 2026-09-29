"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  UserGroupIcon,
  Settings01Icon,
  Shield01Icon,
  Activity01Icon,
  DatabaseIcon,
  StarIcon,
  EyeIcon,
  Edit02Icon
} from "@hugeicons/core-free-icons"
import { useRouter } from "next/navigation"
import { PageConnections } from "@/components/page-connections"
import { DashboardSquare01Icon } from "@hugeicons/core-free-icons"

// Sample data. There is no user-management API yet — user administration is
// not implemented, so this page is presented as sample data instead of
// offering Edit/Delete/Add actions that would do nothing.
const sampleUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "ADMIN",
    createdAt: "2023-10-01T10:00:00Z",
    lastLogin: "2023-10-27T15:30:00Z",
    status: "active"
  },
  {
    id: "2",
    name: "Demo User",
    email: "demo@example.com",
    role: "VIEWER",
    createdAt: "2023-10-15T14:20:00Z",
    lastLogin: "2023-10-27T12:15:00Z",
    status: "active"
  },
  {
    id: "3",
    name: "Editor User",
    email: "editor@example.com",
    role: "EDITOR",
    createdAt: "2023-10-20T09:45:00Z",
    lastLogin: "2023-10-26T18:20:00Z",
    status: "inactive"
  }
]

const sampleSystemStats = {
  totalUsers: 3,
  activeUsers: 2,
  totalConfigs: 15,
  totalDashboards: 8,
  systemHealth: "healthy",
  uptime: "99.9%"
}

export default function AdminPage() {
  const { data: session } = useSession()
  const router = useRouter()

  // Redirect if not admin
  useEffect(() => {
    if (session?.user && (session.user as any).role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [session, router])

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <HugeiconsIcon icon={StarIcon} className="h-4 w-4" />
      case "EDITOR":
        return <HugeiconsIcon icon={Edit02Icon} className="h-4 w-4" />
      case "VIEWER":
        return <HugeiconsIcon icon={EyeIcon} className="h-4 w-4" />
      default:
        return <HugeiconsIcon icon={UserGroupIcon} className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-muted text-foreground"
      : "bg-muted text-muted-foreground"
  }

  if (session?.user && (session.user as any).role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-96 border border-border bg-card">
          <CardContent className="pt-6 text-center">
            <HugeiconsIcon icon={Shield01Icon} className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-foreground">Access Denied</h2>
            <p className="text-muted-foreground">
              You need admin privileges to access this page.
            </p>
          </CardContent>
        </Card>
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
                      <HugeiconsIcon icon={StarIcon} className="h-5 w-5 sm:h-7 sm:w-7 text-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                        Admin Panel
                      </CardTitle>
                      <CardDescription className="mt-1 sm:mt-2 text-muted-foreground text-sm sm:text-base">
                        Manage users, configurations, and system settings
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Badge variant="outline" className="border-border px-3 py-1.5 font-semibold text-sm">
                    <HugeiconsIcon icon={Shield01Icon} className="h-3.5 w-3.5 mr-1" />
                    Sample data
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                User administration is not implemented yet — the listing below shows sample data.
                Configure authentication providers and roles via the environment instead.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cross-page navigation */}
        <PageConnections
          links={[
            { href: '/dashboard', label: 'Dashboard', icon: DashboardSquare01Icon },
            { href: '/settings', label: 'Settings', icon: Settings01Icon },
          ]}
        />

        {/* Enhanced System Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-center p-3 sm:p-4 border border-border bg-card"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted flex items-center justify-center mx-auto mb-2">
              <HugeiconsIcon icon={UserGroupIcon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-foreground">
              {sampleSystemStats.totalUsers}
            </div>
            <div className="text-xs sm:text-sm text-foreground">Total Users</div>
            <div className="text-xs text-muted-foreground mt-1">
              {sampleSystemStats.activeUsers} active
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-center p-3 sm:p-4 border border-border bg-card"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted flex items-center justify-center mx-auto mb-2">
              <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-foreground">
              {sampleSystemStats.totalConfigs}
            </div>
            <div className="text-xs sm:text-sm text-foreground">Configurations</div>
            <div className="text-xs text-muted-foreground mt-1">
              User-specific configs
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="text-center p-3 sm:p-4 border border-border bg-card"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted flex items-center justify-center mx-auto mb-2">
              <HugeiconsIcon icon={Activity01Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-foreground">
              {sampleSystemStats.totalDashboards}
            </div>
            <div className="text-xs sm:text-sm text-foreground">Dashboards</div>
            <div className="text-xs text-muted-foreground mt-1">
              Custom dashboards
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="text-center p-3 sm:p-4 border border-border bg-card"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted flex items-center justify-center mx-auto mb-2">
              <HugeiconsIcon icon={DatabaseIcon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-foreground">
              {sampleSystemStats.uptime}
            </div>
            <div className="text-xs sm:text-sm text-foreground">System Health</div>
            <div className="text-xs text-muted-foreground mt-1">
              System uptime
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Admin Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border border-border bg-card">
            <CardContent className="p-4 sm:p-6">
              <Tabs defaultValue="users" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-10 sm:h-11 bg-muted p-1">
                  <TabsTrigger value="users" className="text-xs sm:text-sm">User Management</TabsTrigger>
                  <TabsTrigger value="configs" className="text-xs sm:text-sm">Configurations</TabsTrigger>
                  <TabsTrigger value="system" className="text-xs sm:text-sm">System Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border border-border bg-card">
                      <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-foreground">
                          <HugeiconsIcon icon={UserGroupIcon} className="h-5 w-5 text-foreground" />
                          User Management
                        </CardTitle>
                        <CardDescription className="mt-1 text-muted-foreground">
                          Sample listing of user accounts, roles, and permissions
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        <div className="space-y-4">
                          {sampleUsers.map((user) => (
                            <motion.div
                              key={user.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 border border-border bg-card hover:bg-muted transition-all duration-300"
                            >
                              <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm sm:text-base font-medium text-foreground">
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3 className="font-medium text-sm sm:text-base break-words text-foreground">{user.name}</h3>
                                    <Badge className="text-foreground border border-border bg-muted">
                                      {getRoleIcon(user.role)}
                                      <span className="ml-1 text-xs">{user.role}</span>
                                    </Badge>
                                    <Badge variant="outline" className={getStatusColor(user.status)}>
                                      <span className="text-xs">{user.status}</span>
                                    </Badge>
                                  </div>
                                  <p className="text-xs sm:text-sm text-muted-foreground break-words">{user.email}</p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="configs" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border border-border bg-card">
                      <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-foreground">
                          <HugeiconsIcon icon={Settings01Icon} className="h-5 w-5 text-foreground" />
                          Configuration Management
                        </CardTitle>
                        <CardDescription className="mt-1 text-muted-foreground">
                          View and manage user-specific configurations
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        <div className="text-center py-8">
                          <HugeiconsIcon icon={Settings01Icon} className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2 text-foreground">Configuration Management</h3>
                          <p className="text-muted-foreground">
                            View and manage user-specific configurations here.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="system" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border border-border bg-card">
                      <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-foreground">
                          <HugeiconsIcon icon={DatabaseIcon} className="h-5 w-5 text-foreground" />
                          System Settings
                        </CardTitle>
                        <CardDescription className="mt-1 text-muted-foreground">
                          Configure system-wide settings and preferences
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        <div className="text-center py-8">
                          <HugeiconsIcon icon={DatabaseIcon} className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2 text-foreground">System Settings</h3>
                          <p className="text-muted-foreground">
                            Configure system-wide settings and preferences here.
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
