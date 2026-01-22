import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import type { CategoryScores } from "@/services/api/types"
import { motion } from "framer-motion"
import { Award, AlertCircle, CheckCircle2, ArrowUpRight } from "lucide-react"

interface ScoreHeaderProps {
  totalScore: number
  categoryScores: CategoryScores
  isDark?: boolean
}

export function ScoreHeader({ totalScore, categoryScores, isDark = false }: ScoreHeaderProps) {
  // Constants for the circle
  const size = 180
  const strokeWidth = 12
  const center = size / 2
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // State for the gradient ring animation
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Fill animation on mount
    const timer = setTimeout(() => {
      setProgress(totalScore)
    }, 100)
    return () => clearTimeout(timer)
  }, [totalScore])

  // Color Logic based on requirements
  // Green (80+), Blue (60-79), Amber (40-59), Red (<40)
  const getScoreConfig = (score: number) => {
    if (score >= 80) return {
      color: "var(--success-500)",
      gradientId: "gradientSuccess",
      label: "Excellent",
      icon: Award,
      bg: "var(--success-50)",
      text: "var(--success-700)"
    }
    if (score >= 60) return {
      color: "var(--primary-500)",
      gradientId: "gradientPrimary",
      label: "Good",
      icon: CheckCircle2,
      bg: "var(--primary-50)",
      text: "var(--primary-700)"
    }
    if (score >= 40) return {
      color: "var(--warning-500)",
      gradientId: "gradientWarning",
      label: "Needs Work",
      icon: AlertCircle,
      bg: "var(--warning-50)",
      text: "var(--warning-700)"
    }
    return {
      color: "var(--danger-500)",
      gradientId: "gradientDanger",
      label: "Critical",
      icon: AlertCircle,
      bg: "var(--danger-50)",
      text: "var(--danger-700)"
    }
  }

  const scoreConfig = getScoreConfig(totalScore)
  const offset = circumference - (progress / 100) * circumference

  const categories = [
    { key: "headline", label: "Headline", max: 20, score: categoryScores.headline, color: "var(--primary-500)", gradient: "linear-gradient(90deg, var(--primary-400), var(--primary-600))" },
    { key: "about", label: "Summary", max: 24, score: categoryScores.about, color: "var(--info-500)", gradient: "linear-gradient(90deg, var(--info-400), var(--info-600))" },
    { key: "experience", label: "Experience", max: 32, score: categoryScores.experience, color: "var(--success-500)", gradient: "linear-gradient(90deg, var(--success-400), var(--success-600))" },
    { key: "skills", label: "Skills", max: 12, score: categoryScores.skills, color: "var(--warning-500)", gradient: "linear-gradient(90deg, var(--warning-400), var(--warning-600))" },
  ]

  return (
    <div className={cn(
      "relative rounded-2xl p-6 sm:p-8 overflow-hidden font-sans transition-all duration-300",
      isDark ? "bg-zinc-900 border border-white/5" : "bg-white border border-gray-100 shadow-sm"
    )}>
      {/* Background decoration */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-[0.03] blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"
        style={{ background: scoreConfig.color }}
      />

      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* Left Side: Score Ring */}
        <div className="relative shrink-0 flex flex-col items-center">
          <div className="relative" style={{ width: size, height: size }}>
            {/* SVG Ring */}
            <svg width={size} height={size} className="transform -rotate-90">
              <defs>
                <linearGradient id="gradientSuccess" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="gradientPrimary" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
                <linearGradient id="gradientWarning" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="gradientDanger" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>

                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Background Circle */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                stroke={isDark ? "rgba(255,255,255,0.05)" : "var(--gray-100)"}
                strokeWidth={strokeWidth}
                fill="none"
              />

              {/* Progress Circle with Animation */}
              <motion.circle
                cx={center}
                cy={center}
                r={radius}
                stroke={`url(#${scoreConfig.gradientId})`}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ filter: "url(#glow)" }}
              />
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className={cn(
                  "text-5xl font-bold tracking-tight",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                {progress}
              </motion.div>
              <span className={cn(
                "text-sm font-medium uppercase tracking-wider mt-1",
                isDark ? "text-gray-500" : "text-gray-400"
              )}>
                / 100
              </span>
            </div>
          </div>

          {/* Trend Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-4 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100"
          >
            <ArrowUpRight className="w-3 h-3" />
            <span>+5 since last week</span>
          </motion.div>
        </div>

        {/* Right Side: Details & Progress Bars */}
        <div className="flex-1 w-full min-w-0">
          {/* Badge & Status Message */}
          <div className="mb-6">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 mb-2"
            >
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold shadow-sm ring-1 ring-inset ring-black/5"
                style={{
                  backgroundColor: scoreConfig.bg,
                  color: scoreConfig.text
                }}
              >
                <scoreConfig.icon className="w-4 h-4" />
                {scoreConfig.label}
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={cn(
                "text-sm",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              {totalScore >= 80
                ? "Outstanding profile! You're in the top percentile of users."
                : totalScore >= 60
                  ? "Great foundation. Focus on the suggestions below to reach All-Star status."
                  : "Your profile needs attention. Prioritize the high-impact items below."}
            </motion.p>
          </div>

          {/* Category Progress Bars */}
          <div className="space-y-4">
            {categories.map((cat, index) => {
              const pct = Math.round((cat.score / cat.max) * 100)

              return (
                <div key={cat.key} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cn(
                      "text-sm font-medium",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}>
                      {cat.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-xs font-semibold tabular-nums",
                        isDark ? "text-gray-400" : "text-gray-500"
                      )}>
                        {cat.score}/{cat.max}
                      </span>
                    </div>
                  </div>

                  {/* Progress Track */}
                  <div className="relative h-2.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute top-0 left-0 h-full rounded-full"
                      style={{ background: cat.gradient }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.5 + (index * 0.1), duration: 0.8, ease: "easeOut" }}
                    />

                    {/* Shimmer Effect for "Alive" feel */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                  </div>

                  {/* Tooltip on Hover */}
                  <div className="h-0 overflow-hidden group-hover:h-auto group-hover:overflow-visible transition-all">
                    <div className="pt-1">
                      <span className="text-[10px] text-gray-400">
                        {pct}% Complete
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
