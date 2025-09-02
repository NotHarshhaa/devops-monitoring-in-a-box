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
  EyeOff
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
    <div>
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure your monitoring environment
          </p>
        </motion.div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="mb-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure basic system settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="instance-name">Instance Name</Label>
                    <Input id="instance-name" defaultValue="DevOps Monitor" />
                    <p className="text-sm text-muted-foreground">
                      The name of your monitoring instance
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="base-url">Base URL</Label>
                    <Input id="base-url" defaultValue="http://localhost:3000" />
                    <p className="text-sm text-muted-foreground">
                      The base URL for generating links and webhooks
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Advanced Mode</Label>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm">Enable advanced features</p>
                        <p className="text-sm text-muted-foreground">
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
                    <Label>Language</Label>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="gap-2">
                        <Globe className="h-4 w-4" />
                        English
                      </Button>
                      <Badge variant="outline">Default</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset to Defaults
                </Button>
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the look and feel of the interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      onClick={() => setTheme("light")}
                      className="flex flex-col items-center justify-center gap-2 py-6"
                    >
                      <Sun className="h-6 w-6" />
                      <span>Light</span>
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      onClick={() => setTheme("dark")}
                      className="flex flex-col items-center justify-center gap-2 py-6"
                    >
                      <Moon className="h-6 w-6" />
                      <span>Dark</span>
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      onClick={() => setTheme("system")}
                      className="flex flex-col items-center justify-center gap-2 py-6"
                    >
                      <Globe className="h-6 w-6" />
                      <span>System</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Dashboard Layout</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto flex flex-col items-center justify-center gap-2 py-6">
                      <div className="w-16 h-12 border border-border rounded-md flex flex-col overflow-hidden">
                        <div className="h-2 bg-primary/20"></div>
                        <div className="flex flex-1">
                          <div className="w-1/3 bg-primary/10"></div>
                          <div className="w-2/3 p-1">
                            <div className="h-1.5 w-full bg-muted mb-1 rounded-sm"></div>
                            <div className="h-1.5 w-2/3 bg-muted rounded-sm"></div>
                          </div>
                        </div>
                      </div>
                      <span>Standard</span>
                    </Button>
                    <Button variant="outline" className="h-auto flex flex-col items-center justify-center gap-2 py-6">
                      <div className="w-16 h-12 border border-border rounded-md flex flex-col overflow-hidden">
                        <div className="h-2 bg-primary/20"></div>
                        <div className="flex flex-1">
                          <div className="w-1/4 bg-primary/10"></div>
                          <div className="w-3/4 p-1">
                            <div className="grid grid-cols-2 gap-1 h-full">
                              <div className="bg-muted rounded-sm"></div>
                              <div className="bg-muted rounded-sm"></div>
                              <div className="bg-muted rounded-sm"></div>
                              <div className="bg-muted rounded-sm"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <span>Compact</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Animation Settings</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Enable animations</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Reduce motion</span>
                      <Switch />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset to Defaults
                </Button>
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Configure how and when you receive alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>General Settings</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm">Enable alert notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications for all alerts
                        </p>
                      </div>
                      <Switch
                        checked={alertNotifications}
                        onCheckedChange={setAlertNotifications}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notification Channels</Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">Email Notifications</p>
                          <Badge variant="outline">Primary</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Send alert notifications to admin@example.com
                        </p>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">Slack Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Send alerts to #monitoring channel
                        </p>
                      </div>
                      <Switch
                        checked={slackNotifications}
                        onCheckedChange={setSlackNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">Webhook (Not configured)</p>
                        <p className="text-sm text-muted-foreground">
                          Set up a webhook to receive alerts
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Alert Severity Thresholds</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm">Critical</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-sm">Warning</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm">Info</span>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" className="gap-2">
                  <Bell className="h-4 w-4" />
                  Test Notifications
                </Button>
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Data Settings */}
        <TabsContent value="data">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Configure data retention and backup settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="data-retention">Data Retention</Label>
                  <div className="flex gap-4 items-center">
                    <Input
                      id="data-retention"
                      value={dataRetentionDays}
                      onChange={(e) => setDataRetentionDays(e.target.value)}
                      className="max-w-[100px]"
                    />
                    <span>days</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    How long to keep historical metric data (7-365 days)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup-frequency">Backup Frequency</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={backupFrequency === "daily" ? "default" : "outline"}
                      onClick={() => setBackupFrequency("daily")}
                    >
                      Daily
                    </Button>
                    <Button
                      type="button"
                      variant={backupFrequency === "weekly" ? "default" : "outline"}
                      onClick={() => setBackupFrequency("weekly")}
                    >
                      Weekly
                    </Button>
                    <Button
                      type="button"
                      variant={backupFrequency === "monthly" ? "default" : "outline"}
                      onClick={() => setBackupFrequency("monthly")}
                    >
                      Monthly
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    How often to create automatic backups
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Database Statistics</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center">
                          <Database className="h-8 w-8 text-primary mb-2" />
                          <p className="text-sm font-medium">Database Size</p>
                          <p className="text-xl font-bold">1.2 GB</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center">
                          <Server className="h-8 w-8 text-primary mb-2" />
                          <p className="text-sm font-medium">Total Metrics</p>
                          <p className="text-xl font-bold">543,281</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center">
                          <RefreshCw className="h-8 w-8 text-primary mb-2" />
                          <p className="text-sm font-medium">Last Backup</p>
                          <p className="text-xl font-bold">2 days ago</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Backup & Restore</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      Export Data
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Import Data
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Create Backup
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Clear All Data
                </Button>
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>
                  Manage authentication and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Authentication</Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">Basic Authentication</p>
                        <p className="text-sm text-muted-foreground">
                          Username and password login
                        </p>
                      </div>
                      <Badge>Active</Badge>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" defaultValue="admin" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={passwordVisible ? "text" : "password"}
                          defaultValue="••••••••••••"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-8 w-8 p-0"
                          onClick={() => setPasswordVisible(!passwordVisible)}
                        >
                          {passwordVisible ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {passwordVisible ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>API Keys</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="text-sm font-medium">Read-only API Key</p>
                        <p className="text-sm text-muted-foreground">
                          Created on Jul 1, 2023
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Show</Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">Revoke</Button>
                      </div>
                    </div>
                    <Button variant="outline" className="gap-2">
                      <Shield className="h-4 w-4" />
                      Generate New API Key
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Access Control</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">IP Allowlist</p>
                        <p className="text-sm text-muted-foreground">
                          Restrict access to specific IP addresses
                        </p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">HTTPS Enforcement</p>
                        <p className="text-sm text-muted-foreground">
                          Force all connections over HTTPS
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">Session Timeout</p>
                        <p className="text-sm text-muted-foreground">
                          Automatically log out after 1 hour of inactivity
                        </p>
                      </div>
                      <Select defaultValue="60">
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 min</SelectItem>
                          <SelectItem value="30">30 min</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                          <SelectItem value="240">4 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" className="gap-2">
                  <Lock className="h-4 w-4" />
                  Security Audit
                </Button>
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <NotificationSettings />
          </motion.div>
        </TabsContent>

        {/* Configuration Settings */}
        <TabsContent value="configuration">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ConfigLoader />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
