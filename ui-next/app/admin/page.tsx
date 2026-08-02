"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Settings, 
  Shield, 
  Activity, 
  Database, 
  Crown,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw
} from "lucide-react"
import { useRouter } from "next/navigation"

// Mock data for demonstration
const mockUsers = [
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

const mockSystemStats = {
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
  const [users, setUsers] = useState(mockUsers)
  const [systemStats, setSystemStats] = useState(mockSystemStats)

  // Redirect if not admin
  useEffect(() => {
    if (session?.user && (session.user as any).role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [session, router])

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Crown className="h-4 w-4" />
      case "EDITOR":
        return <Edit className="h-4 w-4" />
      case "VIEWER":
        return <Eye className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-muted text-foreground"
      case "EDITOR":
        return "bg-muted text-foreground"
      case "VIEWER":
        return "bg-muted text-foreground"
      default:
        return "bg-muted text-muted-foreground dark:bg-card dark:text-muted-foreground"
    }
  }

  const getStatusColor = (status: string) => {
    return status === "active" 
      ? "bg-muted text-foreground bg-muted text-foreground"
      : "bg-muted text-muted-foreground dark:bg-card dark:text-muted-foreground"
  }

  if (session?.user && (session.user as any).role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
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
          <Card className="border border-border dark:border-border bg-card dark:bg-card overflow-hidden">
            <CardHeader className="text-foreground p-4 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 bg-card">
                      <Crown className="h-5 w-5 sm:h-7 sm:w-7 text-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-xl sm:text-3xl lg:text-4xl font-bold">
                        Admin Panel
                      </CardTitle>
                      <CardDescription className="mt-1 sm:mt-2 text-foreground text-sm sm:text-base">
                        Manage users, configurations, and system settings
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Badge className="bg-card text-foreground border-border px-3 py-1.5 font-semibold text-sm">
                    <Shield className="h-3 w-3 mr-1" />
                    Administration
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2 h-9 sm:h-10 bg-card dark:bg-card border-border dark:border-border hover:bg-muted dark:hover:bg-muted">
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Refresh</span>
                  <span className="sm:hidden">Sync</span>
                </Button>
                <Button size="sm" className="gap-2 h-9 sm:h-10 text-foreground">
                  <Plus className="h-4 w-4" />
                  Add User
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

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
            className="text-center p-3 sm:p-4 border border-border"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-foreground">
              {systemStats.totalUsers}
            </div>
            <div className="text-xs sm:text-sm text-foreground">Total Users</div>
            <div className="text-xs text-foreground mt-1">
              {systemStats.activeUsers} active
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-center p-3 sm:p-4 border border-border"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-foreground">
              {systemStats.totalConfigs}
            </div>
            <div className="text-xs sm:text-sm text-foreground">Configurations</div>
            <div className="text-xs text-foreground mt-1">
              User-specific configs
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="text-center p-3 sm:p-4 border border-border"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-foreground">
              {systemStats.totalDashboards}
            </div>
            <div className="text-xs sm:text-sm text-foreground">Dashboards</div>
            <div className="text-xs text-foreground mt-1">
              Custom dashboards
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="text-center p-3 sm:p-4 border border-border"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
              <Database className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-foreground">
              {systemStats.uptime}
            </div>
            <div className="text-xs sm:text-sm text-foreground">System Health</div>
            <div className="text-xs text-foreground mt-1">
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
          <Card className="border border-border dark:border-border bg-card dark:bg-card">
            <CardContent className="p-4 sm:p-6">
              <Tabs defaultValue="users" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-10 sm:h-11 border border-border dark:border-border">
                  <TabsTrigger value="users" className="text-xs sm:text-sm data-[state=active]:bg-foreground data-[state=active]:text-background">User Management</TabsTrigger>
                  <TabsTrigger value="configs" className="text-xs sm:text-sm data-[state=active]:bg-foreground data-[state=active]:text-background">Configurations</TabsTrigger>
                  <TabsTrigger value="system" className="text-xs sm:text-sm data-[state=active]:bg-foreground data-[state=active]:text-background">System Settings</TabsTrigger>
                </TabsList>

          <TabsContent value="users" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border border-border dark:border-border bg-card dark:bg-card">
                      <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-muted-foreground dark:text-foreground">
                          <div className="p-2">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                          </div>
                          User Management
                        </CardTitle>
                        <CardDescription className="mt-1 text-muted-foreground dark:text-muted-foreground">
                          Manage user accounts, roles, and permissions
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        <div className="space-y-4">
                          {users.map((user) => (
                            <motion.div
                              key={user.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 border border-border dark:border-border rounded-lg hover:bg-muted dark:hover:bg-muted transition-all duration-300"
                            >
                              <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm sm:text-base font-medium text-foreground">
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3 className="font-medium text-sm sm:text-base break-words text-muted-foreground dark:text-foreground">{user.name}</h3>
                                    <Badge className="text-foreground border border-border">
                                      {getRoleIcon(user.role)}
                                      <span className="ml-1 text-xs">{user.role}</span>
                                    </Badge>
                                    <Badge variant="outline" className={getStatusColor(user.status)}>
                                      <span className="text-xs">{user.status}</span>
                                    </Badge>
                                  </div>
                                  <p className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground break-words">{user.email}</p>
                                  <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
                                    Last login: {new Date(user.lastLogin).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Button variant="outline" size="sm" className="h-9 flex-1 sm:flex-initial bg-card dark:bg-card border-border dark:border-border hover:bg-muted dark:hover:bg-muted">
                                  <Edit className="h-4 w-4 mr-1.5 sm:mr-0" />
                                  <span className="sm:hidden">Edit</span>
                                </Button>
                                <Button variant="outline" size="sm" className="h-9 text-foreground flex-1 sm:flex-initial bg-card dark:bg-card border-border">
                                  <Trash2 className="h-4 w-4 mr-1.5 sm:mr-0" />
                                  <span className="sm:hidden">Delete</span>
                                </Button>
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
                    <Card className="border border-border dark:border-border bg-card dark:bg-card">
                      <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-muted-foreground dark:text-foreground">
                          <div className="p-2">
                            <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                          </div>
                          Configuration Management
                        </CardTitle>
                        <CardDescription className="mt-1 text-muted-foreground dark:text-muted-foreground">
                          View and manage user-specific configurations
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        <div className="text-center py-8">
                          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2 text-muted-foreground dark:text-foreground">Configuration Management</h3>
                          <p className="text-muted-foreground dark:text-muted-foreground">
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
                    <Card className="border border-border dark:border-border bg-card dark:bg-card">
                      <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-muted-foreground dark:text-foreground">
                          <div className="p-2">
                            <Database className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                          </div>
                          System Settings
                        </CardTitle>
                        <CardDescription className="mt-1 text-muted-foreground dark:text-muted-foreground">
                          Configure system-wide settings and preferences
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        <div className="text-center py-8">
                          <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2 text-muted-foreground dark:text-foreground">System Settings</h3>
                          <p className="text-muted-foreground dark:text-muted-foreground">
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
