"use client"

import React from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { 
  Info, 
  Zap, 
  Palette, 
  Smartphone, 
  Gauge,
  Sparkles,
  Rocket,
  Star
} from "lucide-react"
import { cn } from "@/lib/utils"

interface VersionBadgeProps {
  variant?: "default" | "compact" | "detailed"
  className?: string
}

export function VersionBadge({ variant = "default", className }: VersionBadgeProps) {
  const version = "2.0.0"
  const releaseDate = "February 2026"

  const features = [
    { icon: Palette, label: "Complete UI Overhaul", color: "from-purple-500 to-pink-600" },
    { icon: Zap, label: "50% Faster Performance", color: "from-yellow-500 to-orange-600" },
    { icon: Smartphone, label: "Enhanced Mobile Experience", color: "from-blue-500 to-cyan-600" },
    { icon: Gauge, label: "Optimized Animations", color: "from-green-500 to-emerald-600" },
  ]

  if (variant === "compact") {
    return (
      <Badge 
        variant="secondary" 
        className={cn(
          "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 font-semibold",
          className
        )}
      >
        <Rocket className="w-3 h-3 mr-1" />
        v{version}
      </Badge>
    )
  }

  if (variant === "detailed") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg",
          className
        )}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Version 2.0.0</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Major UI Overhaul</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
            <Star className="w-3 h-3 mr-1" />
            Latest
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              <div className={cn(
                "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center",
                feature.color
              )}>
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {feature.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Released {releaseDate}</span>
          <div className="flex items-center space-x-1">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span>Major Release</span>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        "group relative inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300",
        className
      )}
    >
      <Rocket className="w-4 h-4" />
      <span>v{version}</span>
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-900">
        <div className="w-full h-full bg-green-300 rounded-full animate-ping"></div>
      </div>
    </motion.div>
  )
}

export function VersionInfo() {
  const version = "2.0.0"
  const releaseDate = "February 2026"
  
  const changelog = [
    {
      category: "🎨 UI/UX Improvements",
      items: [
        "Complete redesign of all 8 pages with modern card-based layouts",
        "Enhanced gradient color schemes and glass morphism effects",
        "Improved responsive design and mobile experience",
        "Better accessibility and keyboard navigation"
      ]
    },
    {
      category: "⚡ Performance",
      items: [
        "50% faster animations with optimized transitions",
        "Eliminated sidebar scroll lag issues",
        "Reduced memory usage with better component memoization",
        "CSS-first animations for better performance"
      ]
    },
    {
      category: "🔧 Technical",
      items: [
        "Modern React patterns and component architecture",
        "Enhanced error handling and user feedback",
        "Optimized bundle size and loading performance",
        "Better dark mode support and theme consistency"
      ]
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl"
        >
          <Rocket className="w-10 h-10" />
        </motion.div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Version 2.0.0</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Major UI Overhaul Release</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Released {releaseDate}</p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Palette, label: "Modern Design", color: "from-purple-500 to-pink-600" },
          { icon: Zap, label: "Lightning Fast", color: "from-yellow-500 to-orange-600" },
          { icon: Smartphone, label: "Mobile First", color: "from-blue-500 to-cyan-600" },
          { icon: Gauge, label: "Performance", color: "from-green-500 to-emerald-600" },
        ].map((feature, index) => (
          <motion.div
            key={feature.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 text-center"
          >
            <div className={cn(
              "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mx-auto mb-3",
              feature.color
            )}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{feature.label}</h3>
          </motion.div>
        ))}
      </div>

      {/* Changelog */}
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <Info className="w-5 h-5 mr-2 text-blue-500" />
          What's New
        </h2>
        <div className="space-y-6">
          {changelog.map((section, index) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{section.category}</h3>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
