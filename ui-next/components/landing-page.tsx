"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Monitor, BarChart3, FileText, Bell, Settings, Shield } from "lucide-react"
import { motion } from "framer-motion"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-green-400/5 dark:bg-green-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center mb-6 sm:mb-8"
          >
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 p-3 sm:p-4 rounded-2xl mr-4 sm:mr-6 shadow-lg shadow-blue-500/25 dark:shadow-blue-400/20">
                <Monitor className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
              DevOps Monitor
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-2"
          >
            Comprehensive monitoring solution for your DevOps infrastructure. 
            <span className="text-blue-600 dark:text-blue-400 font-semibold">Monitor services, metrics, logs, and alerts</span> all in one place.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/auth/signin">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl shadow-lg hover:shadow-xl dark:shadow-blue-500/25 dark:hover:shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-1">
                <span className="font-semibold text-sm sm:text-base">Sign In</span>
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="border-2 border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 px-6 sm:px-8 py-2 sm:py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:shadow-lg dark:hover:shadow-black/20 transition-all duration-300 transform hover:-translate-y-1">
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">Sign Up</span>
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group"
          >
            <Card className="h-full bg-white/80 dark:bg-gray-900/95 backdrop-blur-sm border-0 dark:border-gray-800/50 shadow-lg hover:shadow-2xl dark:shadow-black/20 dark:hover:shadow-black/30 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-blue-500/25 dark:shadow-blue-400/20">
                  <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">Real-time Metrics</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Monitor system performance with live metrics and customizable dashboards
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group"
          >
            <Card className="h-full bg-white/80 dark:bg-gray-900/95 backdrop-blur-sm border-0 dark:border-gray-800/50 shadow-lg hover:shadow-2xl dark:shadow-black/20 dark:hover:shadow-black/30 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-green-500/25 dark:shadow-green-400/20">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">Centralized Logs</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Aggregate and search logs from all your services in one place
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group"
          >
            <Card className="h-full bg-white/80 dark:bg-gray-900/95 backdrop-blur-sm border-0 dark:border-gray-800/50 shadow-lg hover:shadow-2xl dark:shadow-black/20 dark:hover:shadow-black/30 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-red-600 dark:from-red-400 dark:to-red-500 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-red-500/25 dark:shadow-red-400/20">
                  <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">Smart Alerts</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Get notified instantly when issues occur with intelligent alerting
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </div>

        {/* Role-Based Access Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center mb-12 sm:mb-20"
        >
          <Card className="max-w-4xl mx-auto bg-white/80 dark:bg-gray-900/95 backdrop-blur-sm border-0 dark:border-gray-800/50 shadow-lg hover:shadow-xl dark:shadow-black/20 dark:hover:shadow-black/30 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10 pb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 rounded-3xl flex items-center justify-center mb-4 sm:mb-6 mx-auto shadow-lg shadow-purple-500/25 dark:shadow-purple-400/20">
                <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Role-Based Access</CardTitle>
              <CardDescription className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2">
                Secure multi-tenant system with Admin, Editor, and Viewer roles
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 1.4 }}
                  className="text-center p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 dark:from-red-400 dark:to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/25 dark:shadow-red-400/20">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div className="font-bold text-red-600 dark:text-red-400 text-lg mb-2">Admin</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">Full access</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 1.6 }}
                  className="text-center p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25 dark:shadow-blue-400/20">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <div className="font-bold text-blue-600 dark:text-blue-400 text-lg mb-2">Editor</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">Configure & view</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 1.8 }}
                  className="text-center p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/25 dark:shadow-green-400/20">
                    <Monitor className="h-6 w-6 text-white" />
                  </div>
                  <div className="font-bold text-green-600 dark:text-green-400 text-lg mb-2">Viewer</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">Read-only access</div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 2.0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white/60 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-gray-200 dark:border-gray-700 dark:shadow-lg dark:shadow-black/20 shadow-lg">
            <span className="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base">Built with</span>
            <span className="text-red-500 animate-pulse">❤️</span>
            <span className="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base">by</span>
            <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent text-sm sm:text-base">Harshhaa</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
