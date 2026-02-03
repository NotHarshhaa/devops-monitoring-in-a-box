"use client"

import React from "react"
import { motion } from "framer-motion"
import {
  Save,
  Trash2,
  RefreshCw,
  Bell,
  Moon,
  Sun,
  Globe,
  Lock,
  User,
  Database,
  Server,
  Shield,
  RotateCcw,
  Download,
  Upload,
  Eye,
  EyeOff,
  Settings
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ConfigLoader } from "@/components/config-loader"
import { NotificationSettings } from "@/components/notification-settings"
import { SiteConfigManager } from "@/components/site-config-manager"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [passwordVisible, setPasswordVisible] = React.useState(false)
  const [backupFrequency, setBackupFrequency] = React.useState("daily")
  const [alertNotifications, setAlertNotifications] = React.useState(true)
  const [emailNotifications, setEmailNotifications] = React.useState(true)
  const [slackNotifications, setSlackNotifications] = React.useState(true)
  const [dataRetentionDays, setDataRetentionDays] = React.useState("30")
  const [isAdvancedUser, setIsAdvancedUser] = React.useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-900/20">
      <div className="px-2 sm:px-4 py-3 sm:py-6 max-w-7xl mx-auto space-y-3 sm:space-y-6">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-900 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-700 dark:via-teal-700 dark:to-cyan-700 text-white p-4 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                      <Settings className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl sm:text-3xl lg:text-4xl font-bold">
                        Settings
                      </CardTitle>
                      <CardDescription className="mt-1 sm:mt-2 text-emerald-100 text-sm sm:text-base">
                        Configure your monitoring environment
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Badge className="bg-white/20 text-white border-white/30 px-3 py-1.5 font-semibold text-sm">
                    <Shield className="h-3 w-3 mr-1" />
                    Configuration
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="text-center p-3 sm:p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Database className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    5
                  </div>
                  <div className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">Categories</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                    12
                  </div>
                  <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">Notifications</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400">
                    8
                  </div>
                  <div className="text-xs sm:text-sm text-purple-700 dark:text-purple-300">Security</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="text-center p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Save className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400">
                    24
                  </div>
                  <div className="text-xs sm:text-sm text-orange-700 dark:text-orange-300">Options</div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Settings Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900">
            <CardContent className="p-4 sm:p-6">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-10 sm:h-11 overflow-x-auto bg-gradient-to-r from-gray-50 to-emerald-50 dark:from-gray-800 dark:to-emerald-900/20 border border-gray-200 dark:border-gray-700">
                  <TabsTrigger value="general" className="text-xs sm:text-sm data-[state=active]:bg-emerald-600 data-[state=active]:text-white">General</TabsTrigger>
                  <TabsTrigger value="notifications" className="text-xs sm:text-sm data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Notifications</TabsTrigger>
                  <TabsTrigger value="security" className="text-xs sm:text-sm data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Security</TabsTrigger>
                  <TabsTrigger value="configuration" className="text-xs sm:text-sm data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Configuration</TabsTrigger>
                  <TabsTrigger value="site" className="text-xs sm:text-sm data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Site Config</TabsTrigger>
                </TabsList>

        {/* General Settings */}
                <TabsContent value="general" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900">
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-emerald-50 dark:from-gray-800 dark:to-emerald-900/20 p-4 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                            <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          General Settings
                        </CardTitle>
                        <CardDescription className="mt-1 text-gray-600 dark:text-gray-400">
                          Configure basic system settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6 space-y-6">
                        <div className="space-y-4 sm:space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="instance-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Instance Name</Label>
                            <Input id="instance-name" defaultValue="DevOps Monitor" className="h-10 sm:h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600" />
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              The name of your monitoring instance
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="base-url" className="text-sm font-medium text-gray-700 dark:text-gray-300">Base URL</Label>
                            <Input id="base-url" defaultValue="http://localhost:4000" className="h-10 sm:h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600" />
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              The base URL for generating links and webhooks
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Advanced Mode</Label>
                            <div className="flex items-center justify-between gap-4 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-emerald-50 dark:from-gray-800 dark:to-emerald-900/20">
                              <div className="space-y-0.5 min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Enable advanced features</p>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                  Shows advanced configuration options
                                </p>
                              </div>
                              <Switch
                                checked={isAdvancedUser}
                                onCheckedChange={setIsAdvancedUser}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</Label>
                            <div className="flex flex-wrap items-center gap-2">
                              <Button variant="outline" className="gap-2 h-10 sm:h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <Globe className="h-4 w-4" />
                                English
                              </Button>
                              <Badge variant="outline" className="h-10 sm:h-11 px-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">Default</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 pt-6 bg-gradient-to-r from-gray-50 to-emerald-50 dark:from-gray-800 dark:to-emerald-900/20 p-4 sm:p-6">
                        <Button variant="outline" className="gap-2 w-full sm:w-auto h-10 sm:h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <RotateCcw className="h-4 w-4" />
                          Reset to Defaults
                        </Button>
                        <Button className="gap-2 w-full sm:w-auto h-10 sm:h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
                          <Save className="h-4 w-4" />
                          Save Changes
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </TabsContent>

                {/* Notifications Settings */}
                <TabsContent value="notifications" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <NotificationSettings />
                  </motion.div>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900">
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-emerald-50 dark:from-gray-800 dark:to-emerald-900/20 p-4 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                            <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          Security
                        </CardTitle>
                        <CardDescription className="mt-1 text-gray-600 dark:text-gray-400">
                          Manage authentication and security settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        <div className="text-center py-8">
                          <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-400">Security settings configuration</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                {/* Configuration Settings */}
                <TabsContent value="configuration" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ConfigLoader />
                  </motion.div>
                </TabsContent>

                {/* Site Configuration */}
                <TabsContent value="site" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SiteConfigManager />
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
