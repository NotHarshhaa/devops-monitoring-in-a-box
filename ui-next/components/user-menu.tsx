"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  Users, 
  ChevronDown,
  Crown,
  Eye,
  Activity
} from "lucide-react"

export function UserMenu() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" })
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Crown className="h-3 w-3" />
      case "EDITOR":
        return <Shield className="h-3 w-3" />
      case "VIEWER":
        return <Eye className="h-3 w-3" />
      default:
        return <User className="h-3 w-3" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-gradient-to-r from-red-500 to-orange-600 text-white border-0"
      case "EDITOR":
        return "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0"
      case "VIEWER":
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0"
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-600 text-white border-0"
    }
  }

  if (!session?.user) {
    return null
  }

  // Menu items with unique colors and animations
  const menuItems = [
    {
      label: "Profile",
      icon: User,
      action: () => router.push("/profile"),
      color: "from-violet-500 to-purple-600",
      description: "View your profile"
    },
    {
      label: "Settings",
      icon: Settings,
      action: () => router.push("/settings"),
      color: "from-blue-500 to-cyan-600",
      description: "Manage settings"
    }
  ]

  const adminItems = [
    {
      label: "Admin Panel",
      icon: Shield,
      action: () => router.push("/admin"),
      color: "from-red-500 to-pink-600",
      description: "Admin dashboard"
    },
    {
      label: "User Management",
      icon: Users,
      action: () => router.push("/admin/users"),
      color: "from-orange-500 to-red-600",
      description: "Manage users"
    }
  ]

  const logoutItem = {
    label: "Log out",
    icon: LogOut,
    action: handleSignOut,
    color: "from-gray-500 to-slate-600",
    description: "Sign out of account"
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            variant="ghost" 
            className="relative h-10 w-10 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-semibold">
                {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      
      <AnimatePresence>
        {isOpen && (
          <DropdownMenuContent 
            className="w-80 p-0 border-0 shadow-2xl" 
            align="end" 
            forceMount
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 25,
                duration: 0.2
              }}
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700"
            >
              {/* Enhanced User Profile Card */}
              <div className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-b border-gray-200/50 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="relative"
                  >
                    <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-gray-900 shadow-lg">
                      <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold text-lg">
                        {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900">
                      <div className="w-full h-full bg-green-400 rounded-full animate-ping"></div>
                    </div>
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {session.user.name || "User"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {session.user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600">
                        {getRoleIcon((session.user as any).role)}
                        <Badge 
                          variant="secondary" 
                          className={`text-xs font-medium ${getRoleColor((session.user as any).role)}`}
                        >
                          {(session.user as any).role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Menu Items */}
              <div className="p-4 space-y-2">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                  >
                    <DropdownMenuItem 
                      onClick={item.action}
                      className="group relative overflow-hidden p-0 rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      <motion.div
                        className="relative w-full"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className={cn(
                          "absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                          item.color
                        )} />
                        
                        <div className="relative flex items-center p-3 bg-white dark:bg-gray-800 rounded-xl group-hover:bg-transparent transition-colors duration-300">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                            "bg-gray-100 dark:bg-gray-700 group-hover:bg-white/20 dark:group-hover:bg-white/10"
                          )}>
                            <item.icon className={cn(
                              "h-5 w-5 transition-colors duration-300",
                              "text-gray-600 dark:text-gray-300 group-hover:text-white"
                            )} />
                          </div>
                          
                          <div className="ml-3 flex-1">
                            <p className={cn(
                              "font-semibold transition-colors duration-300",
                              "text-gray-900 dark:text-white group-hover:text-white"
                            )}>
                              {item.label}
                            </p>
                            <p className={cn(
                              "text-xs transition-colors duration-300",
                              "text-gray-500 dark:text-gray-400 group-hover:text-white/80"
                            )}>
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </DropdownMenuItem>
                  </motion.div>
                ))}

                {/* Admin Section */}
                {(session.user as any).role === "ADMIN" && (
                  <>
                    <DropdownMenuSeparator className="my-3 border-gray-200/50 dark:border-gray-700" />
                    {adminItems.map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (index + 2) * 0.05, duration: 0.2 }}
                      >
                        <DropdownMenuItem 
                          onClick={item.action}
                          className="group relative overflow-hidden p-0 rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                        >
                          <motion.div
                            className="relative w-full"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className={cn(
                              "absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                              item.color
                            )} />
                            
                            <div className="relative flex items-center p-3 bg-white dark:bg-gray-800 rounded-xl group-hover:bg-transparent transition-colors duration-300">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                "bg-gray-100 dark:bg-gray-700 group-hover:bg-white/20 dark:group-hover:bg-white/10"
                              )}>
                                <item.icon className={cn(
                                  "h-5 w-5 transition-colors duration-300",
                                  "text-gray-600 dark:text-gray-300 group-hover:text-white"
                                )} />
                              </div>
                              
                              <div className="ml-3 flex-1">
                                <p className={cn(
                                  "font-semibold transition-colors duration-300",
                                  "text-gray-900 dark:text-white group-hover:text-white"
                                )}>
                                  {item.label}
                                </p>
                                <p className={cn(
                                  "text-xs transition-colors duration-300",
                                  "text-gray-500 dark:text-gray-400 group-hover:text-white/80"
                                )}>
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </DropdownMenuItem>
                      </motion.div>
                    ))}
                  </>
                )}

                <DropdownMenuSeparator className="my-3 border-gray-200/50 dark:border-gray-700" />
                
                {/* Logout Item */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.2 }}
                >
                  <DropdownMenuItem 
                    onClick={logoutItem.action}
                    className="group relative overflow-hidden p-0 rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    <motion.div
                      className="relative w-full"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        logoutItem.color
                      )} />
                      
                      <div className="relative flex items-center p-3 bg-white dark:bg-gray-800 rounded-xl group-hover:bg-transparent transition-colors duration-300">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                          "bg-gray-100 dark:bg-gray-700 group-hover:bg-white/20 dark:group-hover:bg-white/10"
                        )}>
                          <logoutItem.icon className={cn(
                            "h-5 w-5 transition-colors duration-300",
                            "text-gray-600 dark:text-gray-300 group-hover:text-white"
                          )} />
                        </div>
                        
                        <div className="ml-3 flex-1">
                          <p className={cn(
                            "font-semibold transition-colors duration-300",
                            "text-gray-900 dark:text-white group-hover:text-white"
                          )}>
                            {logoutItem.label}
                          </p>
                          <p className={cn(
                            "text-xs transition-colors duration-300",
                            "text-gray-500 dark:text-gray-400 group-hover:text-white/80"
                          )}>
                            {logoutItem.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </DropdownMenuItem>
                </motion.div>
              </div>
            </motion.div>
          </DropdownMenuContent>
        )}
      </AnimatePresence>
    </DropdownMenu>
  )
}
