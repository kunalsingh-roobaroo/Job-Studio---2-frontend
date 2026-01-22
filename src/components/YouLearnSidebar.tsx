import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuthContext } from "@/auth/context"
import { useTheme } from "@/contexts/ThemeContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { LanguageSelector } from "./LanguageSelector"
import {
  ClipboardList,
  Edit3,
  MessageSquare,
  Briefcase,
  Linkedin,
  Award,
  Users,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Settings,
  CreditCard,
  Gift,
  LogOut,
  Info,
  MessageCircle,
  Globe,
} from "lucide-react"
import { cn } from "@/lib/utils"
import * as Popover from "@radix-ui/react-popover"
import Favicon from "@/assets/Favicon.png"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface NavItem {
  id: string // Added stable ID for translation caching key if needed, or just use label
  label: string
  href?: string
  icon: React.ReactNode
  badge?: string
  disabled?: boolean
  children?: { id: string; label: string; href: string; disabled?: boolean }[]
}

export function YouLearnSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuthContext()
  const { actualTheme } = useTheme()
  const { tBatch, currentLanguage } = useLanguage()
  const isDark = actualTheme === "dark"
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set())
  const [accountOpen, setAccountOpen] = React.useState(false)
  const [languageOpen, setLanguageOpen] = React.useState(false)
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    return saved === 'true'
  })

  // Translated Labels State
  const [translatedLabels, setTranslatedLabels] = React.useState<Record<string, string>>({})

  const userName = user?.attributes?.name || user?.username || "User"
  const firstName = userName.split(" ")[0]

  // Save collapse state and dispatch event
  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', String(newState))
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { isCollapsed: newState } }))
  }

  const navItems: NavItem[] = [
    {
      id: "resume_checklist",
      label: "Resume Checklist",
      href: "/",
      icon: <ClipboardList className="w-[18px] h-[18px]" strokeWidth={2} />,
    },
    {
      id: "resume_edit",
      label: "Resume Edit",
      href: "/resume-edit",
      icon: <Edit3 className="w-[18px] h-[18px]" strokeWidth={2} />,
      disabled: true,
    },
    {
      id: "interview_prep",
      label: "Interview Prep",
      href: "/interview-prep",
      icon: <MessageSquare className="w-[18px] h-[18px]" strokeWidth={2} />,
      disabled: true,
    },
    {
      id: "job_search",
      label: "Job Search",
      href: "/job-search",
      icon: <Briefcase className="w-[18px] h-[18px]" strokeWidth={2} />,
      badge: "Based on LinkedIn",
      disabled: true,
    },
    {
      id: "linkedin_opt",
      label: "LinkedIn Optimisation",
      href: "/linkedin",
      icon: <Linkedin className="w-[18px] h-[18px]" strokeWidth={2} />,
    },
    {
      id: "credibility",
      label: "Credibility Builder",
      href: "/credibility",
      icon: <Award className="w-[18px] h-[18px]" strokeWidth={2} />,
      disabled: true,
    },
    {
      id: "network",
      label: "Network",
      icon: <Users className="w-[18px] h-[18px]" strokeWidth={2} />,
      disabled: true,
      children: [
        { id: "elevator", label: "Elevator Pitch", href: "/network/elevator-pitch", disabled: true },
        { id: "cover_letter", label: "Cover Letter", href: "/network/cover-letter", disabled: true },
        { id: "email", label: "Email", href: "/network/email", disabled: true },
        { id: "dm", label: "DM Writing", href: "/network/dm-writing", disabled: true },
      ],
    },
  ]

  // Translation Effect
  React.useEffect(() => {
    const translateNav = async () => {
      const textsToTranslate: string[] = []
      // Collect all labels
      navItems.forEach(item => {
        textsToTranslate.push(item.label)
        if (item.badge) textsToTranslate.push(item.badge)
        if (item.children) {
          item.children.forEach(child => textsToTranslate.push(child.label))
        }
      })

      // Add static UI elements
      const staticTexts = ["Language", "About", "Feedback", "Free Plan", "Settings", "Pricing", "Invite & Earn", "Dark Mode", "Log out"]
      textsToTranslate.push(...staticTexts)

      if (currentLanguage.code === 'en') {
        setTranslatedLabels({})
        return
      }

      try {
        const results = await tBatch(textsToTranslate)
        const newLabels: Record<string, string> = {}
        textsToTranslate.forEach((text, i) => {
          newLabels[text] = results[i]
        })
        setTranslatedLabels(newLabels)
      } catch (e) {
        console.error("Nav Translation error", e)
      }
    }
    translateNav()
  }, [currentLanguage])

  // Helper to get text
  const _t = (text: string) => translatedLabels[text] || text

  const toggleExpanded = (label: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(label)) {
      newExpanded.delete(label)
    } else {
      newExpanded.add(label)
    }
    setExpandedItems(newExpanded)
  }

  const handleNavClick = (href?: string, disabled?: boolean) => {
    if (disabled) return
    if (href) navigate(href)
  }

  const handleLogout = async () => {
    await signOut()
    navigate("/signin")
  }

  return (
    <div
      className={cn(
        "h-screen border-r flex flex-col fixed left-0 top-0 transition-all duration-300",
        isCollapsed ? "w-[60px]" : "w-[260px]",
        isDark
          ? "bg-[#0C0C0C] border-[#202325]"
          : "bg-white border-[#E5E7EB]"
      )}
    >
      {/* Logo Section */}
      <div className={cn(
        "flex items-center border-b",
        isCollapsed ? "justify-center px-3 py-5" : "gap-2 px-6 py-5",
        isDark ? "border-[#202325]" : "border-[#E5E7EB]"
      )}>
        <img src={Favicon} alt="Job Studio" className="h-6 w-6 flex-shrink-0" />
        {!isCollapsed && (
          <span className={cn(
            "text-lg font-semibold",
            isDark ? "text-white" : "text-gray-900"
          )}>
            Job Studio
          </span>
        )}
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={toggleCollapse}
        className={cn(
          "absolute -right-3 top-20 w-6 h-6 rounded-full border shadow-sm flex items-center justify-center transition-colors z-10",
          isDark
            ? "bg-[#202325] border-[#303437] hover:bg-[#303437]"
            : "bg-white border-gray-200 hover:border-gray-300 hover:shadow"
        )}
      >
        {isCollapsed ? (
          <ChevronRight className={cn("w-4 h-4", isDark ? "text-gray-400" : "text-gray-600")} />
        ) : (
          <ChevronLeft className={cn("w-4 h-4", isDark ? "text-gray-400" : "text-gray-600")} />
        )}
      </button>

      {/* Top Section */}
      <div className={cn("flex-1 overflow-y-auto", isCollapsed ? "px-2 py-4" : "p-4")}>
        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === location.pathname ||
              (item.href === "/linkedin" && location.pathname.startsWith("/linkedin"))
            const isExpanded = expandedItems.has(item.label)
            const hasChildren = item.children && item.children.length > 0
            const translatedLabel = _t(item.label)

            return (
              <div key={item.label}>
                <button
                  onClick={() => {
                    if (hasChildren && !item.disabled) {
                      toggleExpanded(item.label)
                    } else {
                      handleNavClick(item.href, item.disabled)
                    }
                  }}
                  disabled={item.disabled}
                  title={isCollapsed ? translatedLabel : undefined}
                  className={cn(
                    "w-full flex items-center rounded-lg text-[14px] transition-colors",
                    isCollapsed ? "justify-center px-2 py-2" : "justify-between px-3 py-2",
                    item.disabled
                      ? isDark
                        ? "text-gray-600 cursor-not-allowed font-medium"
                        : "text-gray-400 cursor-not-allowed font-medium"
                      : isActive
                        ? isDark
                          ? "bg-[#202325] font-semibold text-white"
                          : "bg-[#E5E7EB] font-semibold text-black"
                        : isDark
                          ? "text-gray-300 font-medium hover:bg-[#202325]"
                          : "text-gray-600 font-medium hover:bg-[#F3F4F6] hover:text-gray-900"
                  )}
                >
                  <div className={cn("flex items-center", isCollapsed ? "" : "gap-3")}>
                    {item.icon}
                    {!isCollapsed && <span>{translatedLabel}</span>}
                  </div>
                  {!isCollapsed && (
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded",
                          isDark
                            ? "text-gray-500 bg-[#202325]"
                            : "text-gray-500 bg-gray-200"
                        )}>
                          {_t(item.badge)}
                        </span>
                      )}
                      {hasChildren && !item.disabled && (
                        isExpanded ? (
                          <ChevronDown className={cn("w-4 h-4", isDark ? "text-gray-500" : "text-gray-500")} />
                        ) : (
                          <ChevronRight className={cn("w-4 h-4", isDark ? "text-gray-500" : "text-gray-500")} />
                        )
                      )}
                    </div>
                  )}
                </button>

                {/* Children */}
                {hasChildren && isExpanded && !item.disabled && !isCollapsed && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children!.map((child) => (
                      <button
                        key={child.label}
                        onClick={() => handleNavClick(child.href, child.disabled)}
                        disabled={child.disabled}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-[14px] transition-colors",
                          child.disabled
                            ? isDark
                              ? "text-gray-600 cursor-not-allowed font-medium"
                              : "text-gray-400 cursor-not-allowed font-medium"
                            : location.pathname === child.href
                              ? isDark
                                ? "bg-[#202325] font-semibold text-white"
                                : "bg-[#E5E7EB] font-semibold text-black"
                              : isDark
                                ? "text-gray-400 font-medium hover:bg-[#202325]"
                                : "text-gray-600 font-medium hover:bg-[#F3F4F6] hover:text-gray-900"
                        )}
                      >
                        {_t(child.label)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>

      {/* Footer Section - Stacked Profile Card */}
      <div className={cn(
        "mt-auto",
        isCollapsed ? "p-2" : "p-4"
      )}>
        {/* Accessibility Section */}
        {!isCollapsed && (
          <div className="mb-4">
            {/* Accessibility Header */}
            <div className="text-[11px] font-bold tracking-wider text-gray-400 pl-3 mb-2 mt-6">
              ACCESSIBILITY
            </div>

            {/* Accessibility Menu Items */}
            <div className="space-y-1">
              <button
                onClick={() => setLanguageOpen(true)}
                className={cn(
                  "w-full flex items-center gap-3 h-9 px-3 rounded-lg text-[14px] font-medium transition-colors",
                  isDark
                    ? "text-gray-300 hover:bg-[#202325] hover:text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Globe className="w-4 h-4 flex-shrink-0" />
                <span>{_t("Language")}</span>
              </button>

              <a
                href="https://jobstudio.ai/about"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "w-full flex items-center gap-3 h-9 px-3 rounded-lg text-[14px] font-medium transition-colors",
                  isDark
                    ? "text-gray-300 hover:bg-[#202325] hover:text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>{_t("About")}</span>
              </a>

              <a
                href="mailto:feedback@jobstudio.ai"
                className={cn(
                  "w-full flex items-center gap-3 h-9 px-3 rounded-lg text-[14px] font-medium transition-colors",
                  isDark
                    ? "text-gray-300 hover:bg-[#202325] hover:text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <MessageCircle className="w-4 h-4 flex-shrink-0" />
                <span>{_t("Feedback")}</span>
              </a>
            </div>
          </div>
        )}

        {/* Collapsed state - show icons only */}
        {isCollapsed && (
          <div className="mb-4 space-y-1">
            <button
              onClick={() => setLanguageOpen(true)}
              title={_t("Language")}
              className={cn(
                "w-full flex items-center justify-center p-2 rounded-lg transition-colors",
                isDark ? "hover:bg-[#202325]" : "hover:bg-gray-100"
              )}
            >
              <Globe className="w-4 h-4" />
            </button>

            <a
              href="https://jobstudio.ai/about"
              target="_blank"
              rel="noopener noreferrer"
              title={_t("About")}
              className={cn(
                "w-full flex items-center justify-center p-2 rounded-lg transition-colors",
                isDark ? "hover:bg-[#202325]" : "hover:bg-gray-100"
              )}
            >
              <Info className="w-4 h-4" />
            </a>

            <a
              href="mailto:feedback@jobstudio.ai"
              title={_t("Feedback")}
              className={cn(
                "w-full flex items-center justify-center p-2 rounded-lg transition-colors",
                isDark ? "hover:bg-[#202325]" : "hover:bg-gray-100"
              )}
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Stacked Profile Card */}
        <Popover.Root open={accountOpen} onOpenChange={setAccountOpen}>
          <Popover.Trigger asChild>
            {isCollapsed ? (
              <button className={cn(
                "w-full flex items-center justify-center p-2 rounded-lg transition-colors",
                isDark ? "hover:bg-[#202325]" : "hover:bg-gray-100"
              )}>
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {firstName.charAt(0).toUpperCase()}
                </div>
              </button>
            ) : (
              <div className="cursor-pointer">
                {/* Layer 1: The Badge (File Folder Tab) */}
                <div className={cn(
                  "mx-auto w-[80%] rounded-t-lg h-6 flex justify-center items-start pt-1",
                  isDark
                    ? "bg-[#1a2e1a]"
                    : "bg-[#E6F4EA]"
                )}>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wide",
                    isDark ? "text-[#4ade80]" : "text-[#1E8E3E]"
                  )}>
                    {_t("Free Plan")}
                  </span>
                </div>

                {/* Layer 2: The User Card */}
                <div className={cn(
                  "relative z-10 flex items-center gap-3 p-3 rounded-xl border transition-all",
                  isDark
                    ? "bg-[#202325] border-[#303437] hover:shadow-md"
                    : "bg-white border-[#E5E7EB] shadow-sm hover:shadow-md"
                )}>
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                  <span className={cn(
                    "text-sm font-semibold flex-1",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    {firstName}
                  </span>
                  <ChevronDown className={cn("w-4 h-4", isDark ? "text-gray-500" : "text-gray-400")} />
                </div>
              </div>
            )}
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              side="top"
              align="start"
              sideOffset={12}
              className={cn(
                "w-[220px] rounded-xl shadow-xl border p-1 z-50",
                isDark
                  ? "bg-[#202325] border-[#303437]"
                  : "bg-white border-gray-200"
              )}
            >
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    navigate("/account")
                    setAccountOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors",
                    isDark
                      ? "text-gray-300 hover:bg-[#303437]"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Settings className="w-4 h-4" />
                  {_t("Settings")}
                </button>
                <button className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors",
                  isDark
                    ? "text-gray-300 hover:bg-[#303437]"
                    : "text-gray-700 hover:bg-gray-50"
                )}>
                  <CreditCard className="w-4 h-4" />
                  {_t("Pricing")}
                </button>
                <button className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors",
                  isDark
                    ? "text-gray-300 hover:bg-[#303437]"
                    : "text-gray-700 hover:bg-gray-50"
                )}>
                  <Gift className="w-4 h-4" />
                  {_t("Invite & Earn")}
                </button>
                <div className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg",
                  isDark
                    ? "text-gray-300"
                    : "text-gray-700"
                )}>
                  <span className="text-[14px] font-medium">{_t("Dark Mode")}</span>
                  <ThemeToggle />
                </div>
                <div className={cn(
                  "border-t my-1",
                  isDark ? "border-[#303437]" : "border-gray-100"
                )} />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {_t("Log out")}
                </button>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      <LanguageSelector
        open={languageOpen}
        onOpenChange={setLanguageOpen}
        isDark={isDark}
      />
    </div>
  )
}
