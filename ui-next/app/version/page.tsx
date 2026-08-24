"use client"

import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { VersionInfo } from "@/components/version-badge"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft02Icon, 
  Download01Icon, 
  GithubIcon, 
  StarIcon, 
  FavouriteIcon 
} from "@hugeicons/core-free-icons"
import Link from "next/link"

export default function VersionPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost" className="flex items-center space-x-2">
                <HugeiconsIcon icon={ArrowLeft02Icon} className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="gap-2 border-border hover:bg-muted">
                <HugeiconsIcon icon={GithubIcon} className="w-4 h-4" />
                View on GitHub
              </Button>
              <Button size="sm" className="gap-2">
                <HugeiconsIcon icon={Download01Icon} className="w-4 h-4" />
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
          <div className="p-8 border border-border bg-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Enjoying the New UI?
            </h3>
            <p className="text-muted-foreground mb-6">
              Version 2.5.0 represents a complete overhaul of our monitoring dashboard,
              bringing modern design, better performance, and an enhanced user experience.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button variant="outline" className="gap-2 border-border hover:bg-muted">
                <HugeiconsIcon icon={StarIcon} className="w-4 h-4" />
                Star on GitHub
              </Button>
              <Button className="gap-2">
                <HugeiconsIcon icon={FavouriteIcon} className="w-4 h-4" />
                Support the Project
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-1">
              Made with <HugeiconsIcon icon={FavouriteIcon} className="w-4 h-4 text-foreground" /> by the DevOps Monitor Team
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
