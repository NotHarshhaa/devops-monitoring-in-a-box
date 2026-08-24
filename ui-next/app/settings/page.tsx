"use client"

import React from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FloppyDiskIcon,
  RefreshIcon,
  Notification01Icon,
  GlobeIcon,
  LockIcon,
  DatabaseIcon,
  Shield01Icon,
  Settings01Icon
} from "@hugeicons/core-free-icons"
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
                      <HugeiconsIcon icon={Settings01Icon} className="h-5 w-5 sm:h-7 sm:w-7 text-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                        Settings
                      </CardTitle>
                      <CardDescription className="mt-1 sm:mt-2 text-muted-foreground text-sm sm:text-base">
                        Configure your monitoring environment
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Badge className="bg-muted text-foreground border-border px-3 py-1.5 font-semibold text-sm">
                    <HugeiconsIcon icon={Shield01Icon} className="h-3.5 w-3.5 mr-1" />
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
                  className="text-center p-3 sm:p-4 border border-border"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted flex items-center justify-center mx-auto mb-2">
                    <HugeiconsIcon icon={DatabaseIcon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    5
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Categories</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="text-center p-3 sm:p-4 border border-border"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted flex items-center justify-center mx-auto mb-2">
                    <HugeiconsIcon icon={Notification01Icon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    12
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Notifications</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="text-center p-3 sm:p-4 border border-border"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted flex items-center justify-center mx-auto mb-2">
                    <HugeiconsIcon icon={LockIcon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    8
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Security</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="text-center p-3 sm:p-4 border border-border"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted flex items-center justify-center mx-auto mb-2">
                    <HugeiconsIcon icon={FloppyDiskIcon} className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    24
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Options</div>
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
          <Card className="border border-border bg-card">
            <CardContent className="p-4 sm:p-6">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-10 sm:h-11 bg-muted p-1">
                  <TabsTrigger value="general" className="text-xs sm:text-sm">General</TabsTrigger>
                  <TabsTrigger value="notifications" className="text-xs sm:text-sm">Notifications</TabsTrigger>
                  <TabsTrigger value="security" className="text-xs sm:text-sm">Security</TabsTrigger>
                  <TabsTrigger value="configuration" className="text-xs sm:text-sm">Configuration</TabsTrigger>
                  <TabsTrigger value="site" className="text-xs sm:text-sm">Site Config</TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border border-border bg-card">
                      <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-foreground">
                          <HugeiconsIcon icon={Settings01Icon} className="h-5 w-5 text-foreground" />
                          General Settings
                        </CardTitle>
                        <CardDescription className="mt-1 text-muted-foreground">
                          Configure basic system settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6 space-y-6">
                        <div className="space-y-4 sm:space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="instance-name" className="text-sm font-medium text-foreground">Instance Name</Label>
                            <Input id="instance-name" defaultValue="DevOps Monitor" className="h-10 sm:h-11 bg-card border-border" />
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              The name of your monitoring instance
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="base-url" className="text-sm font-medium text-foreground">Base URL</Label>
                            <Input id="base-url" defaultValue="http://localhost:4000" className="h-10 sm:h-11 bg-card border-border" />
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              The base URL for generating links and webhooks
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Advanced Mode</Label>
                            <div className="flex items-center justify-between gap-4 p-3 sm:p-4 border border-border">
                              <div className="space-y-0.5 min-w-0 flex-1">
                                <p className="text-sm font-medium text-foreground">Enable advanced features</p>
                                <p className="text-xs sm:text-sm text-muted-foreground">
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
                            <Label className="text-sm font-medium text-foreground">Language</Label>
                            <div className="flex flex-wrap items-center gap-2">
                              <Button variant="outline" className="gap-2 h-10 sm:h-11 bg-card border-border hover:bg-muted">
                                <HugeiconsIcon icon={GlobeIcon} className="h-4 w-4" />
                                English
                              </Button>
                              <Badge variant="outline" className="h-10 sm:h-11 px-3 border-border text-foreground">Default</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 pt-6 p-4 sm:p-6 border-t border-border">
                        <Button variant="outline" className="gap-2 w-full sm:w-auto h-10 sm:h-11 bg-card border-border hover:bg-muted">
                          <HugeiconsIcon icon={RefreshIcon} className="h-4 w-4" />
                          Reset to Defaults
                        </Button>
                        <Button className="gap-2 w-full sm:w-auto h-10 sm:h-11">
                          <HugeiconsIcon icon={FloppyDiskIcon} className="h-4 w-4" />
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
                    <Card className="border border-border bg-card">
                      <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-foreground">
                          <HugeiconsIcon icon={LockIcon} className="h-5 w-5 text-foreground" />
                          Security
                        </CardTitle>
                        <CardDescription className="mt-1 text-muted-foreground">
                          Manage authentication and security settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        <div className="text-center py-8">
                          <HugeiconsIcon icon={LockIcon} className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">Security settings configuration</p>
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
