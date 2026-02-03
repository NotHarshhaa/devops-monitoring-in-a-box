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
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "EDITOR":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "VIEWER":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    return status === "active" 
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-red-900/20">
      <div className="px-2 sm:px-4 py-3 sm:py-6 max-w-7xl mx-auto space-y-3 sm:space-y-6">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-900 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 dark:from-red-700 dark:via-orange-700 dark:to-yellow-700 text-white p-4 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                      <Crown className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl sm:text-3xl lg:text-4xl font-bold">
                        Admin Panel
                      </CardTitle>
                      <CardDescription className="mt-1 sm:mt-2 text-red-100 text-sm sm:text-base">
                        Manage users, configurations, and system settings
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Badge className="bg-white/20 text-white border-white/30 px-3 py-1.5 font-semibold text-sm">
                    <Shield className="h-3 w-3 mr-1" />
                    Administration
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2 h-9 sm:h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Refresh</span>
                  <span className="sm:hidden">Sync</span>
                </Button>
                <Button size="sm" className="gap-2 h-9 sm:h-10 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white">
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
            className="text-center p-3 sm:p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border border-red-200 dark:border-red-800"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">
              {systemStats.totalUsers}
            </div>
            <div className="text-xs sm:text-sm text-red-700 dark:text-red-300">Total Users</div>
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">
              {systemStats.activeUsers} active
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
              {systemStats.totalConfigs}
            </div>
            <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">Configurations</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              User-specific configs
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
              {systemStats.totalDashboards}
            </div>
            <div className="text-xs sm:text-sm text-green-700 dark:text-green-300">Dashboards</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              Custom dashboards
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Database className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
              {systemStats.uptime}
            </div>
            <div className="text-xs sm:text-sm text-purple-700 dark:text-purple-300">System Health</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
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
          <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900">
            <CardContent className="p-4 sm:p-6">
              <Tabs defaultValue="users" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-10 sm:h-11 bg-gradient-to-r from-gray-50 to-red-50 dark:from-gray-800 dark:to-red-900/20 border border-gray-200 dark:border-gray-700">
                  <TabsTrigger value="users" className="text-xs sm:text-sm data-[state=active]:bg-red-600 data-[state=active]:text-white">User Management</TabsTrigger>
                  <TabsTrigger value="configs" className="text-xs sm:text-sm data-[state=active]:bg-red-600 data-[state=active]:text-white">Configurations</TabsTrigger>
                  <TabsTrigger value="system" className="text-xs sm:text-sm data-[state=active]:bg-red-600 data-[state=active]:text-white">System Settings</TabsTrigger>
                </TabsList>

          <TabsContent value="users" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900">
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-red-50 dark:from-gray-800 dark:to-red-900/20 p-4 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          User Management
                        </CardTitle>
                        <CardDescription className="mt-1 text-gray-600 dark:text-gray-400">
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
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                            >
                              <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm sm:text-base font-medium text-white">
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3 className="font-medium text-sm sm:text-base break-words text-gray-900 dark:text-white">{user.name}</h3>
                                    <Badge className="bg-gradient-to-r from-red-500 to-orange-600 text-white border-0">
                                      {getRoleIcon(user.role)}
                                      <span className="ml-1 text-xs">{user.role}</span>
                                    </Badge>
                                    <Badge variant="outline" className={getStatusColor(user.status)}>
                                      <span className="text-xs">{user.status}</span>
                                    </Badge>
                                  </div>
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">{user.email}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    Last login: {new Date(user.lastLogin).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Button variant="outline" size="sm" className="h-9 flex-1 sm:flex-initial bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800">
                                  <Edit className="h-4 w-4 mr-1.5 sm:mr-0" />
                                  <span className="sm:hidden">Edit</span>
                                </Button>
                                <Button variant="outline" size="sm" className="h-9 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex-1 sm:flex-initial bg-white dark:bg-gray-900 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
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
                    <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900">
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-4 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                            <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          Configuration Management
                        </CardTitle>
                        <CardDescription className="mt-1 text-gray-600 dark:text-gray-400">
                          View and manage user-specific configurations
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        <div className="text-center py-8">
                          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Configuration Management</h3>
                          <p className="text-gray-600 dark:text-gray-400">
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
                    <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900">
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 p-4 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                            <Database className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          System Settings
                        </CardTitle>
                        <CardDescription className="mt-1 text-gray-600 dark:text-gray-400">
                          Configure system-wide settings and preferences
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        <div className="text-center py-8">
                          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">System Settings</h3>
                          <p className="text-gray-600 dark:text-gray-400">
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
