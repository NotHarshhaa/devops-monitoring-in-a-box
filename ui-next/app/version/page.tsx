"use client"

import { motion } from "framer-motion"
import { VersionInfo } from "@/components/version-badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Github, Star, Heart } from "lucide-react"
import Link from "next/link"

export default function VersionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20">
      {/* Header */}
      <div className="border-b border-gray-200/50 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Github className="w-4 h-4 mr-2" />
                View on GitHub
              </Button>
              <Button size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <VersionInfo />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Enjoying the New UI?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Version 2.0.0 represents a complete overhaul of our monitoring dashboard, 
              bringing modern design, better performance, and an enhanced user experience.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button variant="outline">
                <Star className="w-4 h-4 mr-2" />
                Star on GitHub
              </Button>
              <Button>
                <Heart className="w-4 h-4 mr-2" />
                Support the Project
              </Button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
              Made with <Heart className="w-4 h-4 inline text-red-500 mx-1" /> by the DevOps Monitor Team
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
