"use client"

import { motion } from "framer-motion"
import { VersionInfo } from "@/components/version-badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Github, Star, Heart } from "lucide-react"
import Link from "next/link"

export default function VersionPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="border-b border-border dark:border-border bg-card dark:bg-card">
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
          <div className="p-8 border border-border dark:border-border">
            <h3 className="text-lg font-semibold text-muted-foreground dark:text-foreground mb-4">
              Enjoying the New UI?
            </h3>
            <p className="text-muted-foreground dark:text-muted-foreground mb-6">
              Version 2.5.0 represents a complete overhaul of our monitoring dashboard,
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
            <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-6">
              Made with <Heart className="w-4 h-4 inline text-foreground mx-1" /> by the DevOps Monitor Team
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
