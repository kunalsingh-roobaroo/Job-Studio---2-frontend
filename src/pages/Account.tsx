import { useAuthUser } from "@/auth/hooks"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { User, CreditCard, Bell, Settings, Lock, Mail, Phone, UserCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/contexts/ThemeContext"

const BRAND = {
  purple: "#815FAA",
  blue: "#27AAE7",
}

type NavItem = {
  id: string
  label: string
  icon: React.ElementType
  active?: boolean
  disabled?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { id: "general", label: "General", icon: Settings, disabled: true },
  { id: "profile", label: "Profile", icon: User, active: true },
  { id: "billing", label: "Billing", icon: CreditCard, disabled: true },
  { id: "notifications", label: "Notifications", icon: Bell, disabled: true },
]

function SettingsNav({ items, className, isDark }: { items: NavItem[]; className?: string; isDark: boolean }) {
  return (
    <nav className={cn("flex-shrink-0", className)}>
      <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.id} className="flex-shrink-0">
              <button
                type="button"
                disabled={item.disabled}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  item.active
                    ? isDark 
                      ? "bg-zinc-800 text-white" 
                      : "bg-zinc-100 text-zinc-900"
                    : item.disabled
                    ? isDark 
                      ? "text-zinc-600 cursor-not-allowed" 
                      : "text-zinc-400 cursor-not-allowed"
                    : isDark 
                      ? "text-zinc-400 hover:bg-zinc-800 hover:text-white" 
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                  "lg:w-full"
                )}
                style={item.active ? { borderLeft: `2px solid ${BRAND.purple}` } : undefined}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden lg:inline">{item.label}</span>
                {item.disabled && (
                  <span className={cn(
                    "hidden lg:inline ml-auto text-[10px] font-normal",
                    isDark ? "text-zinc-600" : "text-zinc-400"
                  )}>Soon</span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function ProfileSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <div className={cn(
      "h-full font-['Inter',sans-serif] overflow-hidden",
      isDark ? "bg-zinc-950" : "bg-zinc-50"
    )}>
      <div className="h-full max-w-5xl mx-auto px-4 lg:px-6 py-4 lg:py-6 flex flex-col">
        <div className="mb-4">
          <Skeleton className={cn("h-6 w-24 mb-1", isDark && "bg-zinc-800")} />
          <Skeleton className={cn("h-3 w-48", isDark && "bg-zinc-800")} />
        </div>
        <div className="flex-1 flex flex-col lg:flex-row gap-4">
          <div className="lg:w-40 flex lg:flex-col gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className={cn("h-9 w-9 lg:w-full rounded-lg", isDark && "bg-zinc-800")} />
            ))}
          </div>
          <div className="flex-1">
            <Card className={cn(
              "h-full rounded-xl overflow-hidden",
              isDark ? "bg-zinc-900 border-zinc-800" : "border-zinc-200"
            )}>
              <Skeleton className={cn("h-16 w-full", isDark && "bg-zinc-800")} />
              <CardContent className="pt-12 pb-4 px-4 space-y-4">
                <Skeleton className={cn("h-5 w-36", isDark && "bg-zinc-800")} />
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className={cn("h-14 w-full", isDark && "bg-zinc-800")} />
                  <Skeleton className={cn("h-14 w-full", isDark && "bg-zinc-800")} />
                </div>
                <Skeleton className={cn("h-14 w-full", isDark && "bg-zinc-800")} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function Account() {
  const { user, isInitializing } = useAuthUser()
  const { actualTheme } = useTheme()
  const isDark = actualTheme === "dark"

  if (isInitializing) {
    return <ProfileSkeleton isDark={isDark} />
  }

  if (!user) {
    return (
      <div className={cn(
        "h-full flex items-center justify-center p-4 font-['Inter',sans-serif]",
        isDark ? "bg-zinc-950" : "bg-zinc-50"
      )}>
        <Card className={cn(
          "rounded-xl p-6 text-center max-w-sm",
          isDark ? "bg-zinc-900 border-zinc-800" : "border-zinc-200"
        )}>
          <UserCircle className={cn("h-10 w-10 mx-auto mb-3", isDark ? "text-zinc-600" : "text-zinc-300")} />
          <p className={cn("text-sm", isDark ? "text-zinc-400" : "text-zinc-500")}>
            No account information available. Please sign in again.
          </p>
        </Card>
      </div>
    )
  }

  const attrs = user.attributes ?? {}
  const displayName = attrs.name ?? user.email ?? attrs.email ?? "Your account"
  const email = attrs.email ?? user.email ?? "-"
  const phone = attrs.phone_number ?? "-"
  const picture = attrs.picture
  const initials = displayName.charAt(0).toUpperCase()

  return (
    <div className={cn(
      "h-full font-['Inter',sans-serif] overflow-hidden",
      isDark ? "bg-zinc-950" : "bg-zinc-50"
    )}>
      <div className="h-full max-w-5xl mx-auto px-4 lg:px-6 py-4 lg:py-6 flex flex-col">
        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <h1 className={cn(
            "text-xl lg:text-2xl font-semibold tracking-tight",
            isDark ? "text-white" : "text-zinc-900"
          )}>Settings</h1>
          <p className={cn(
            "text-xs lg:text-sm mt-0.5",
            isDark ? "text-zinc-400" : "text-zinc-500"
          )}>
            Manage your account settings and preferences.
          </p>
        </div>

        {/* Main Layout */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
          {/* Sidebar Navigation */}
          <SettingsNav items={NAV_ITEMS} className="lg:w-40" isDark={isDark} />

          {/* Profile Panel */}
          <div className="flex-1 min-h-0">
            <Card className={cn(
              "h-full rounded-xl overflow-hidden shadow-sm flex flex-col",
              isDark ? "bg-zinc-900 border-zinc-800" : "border-zinc-200"
            )}>
              {/* Banner with gradient */}
              <div
                className="h-16 lg:h-20 relative flex-shrink-0"
                style={{
                  background: isDark 
                    ? `linear-gradient(135deg, ${BRAND.purple}30 0%, ${BRAND.blue}20 100%)`
                    : `linear-gradient(135deg, ${BRAND.blue}15 0%, ${BRAND.purple}20 100%)`,
                }}
              >
                {/* Avatar anchored over banner */}
                <div className="absolute -bottom-8 lg:-bottom-10 left-4 lg:left-6">
                  <div
                    className="rounded-full p-0.5 lg:p-1"
                    style={{
                      background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.blue})`,
                    }}
                  >
                    <Avatar className={cn(
                      "h-16 w-16 lg:h-20 lg:w-20 border-2 lg:border-4",
                      isDark ? "border-zinc-900" : "border-white"
                    )}>
                      {picture ? (
                        <AvatarImage src={picture} alt={displayName} />
                      ) : (
                        <AvatarFallback
                          className="text-xl lg:text-2xl font-semibold text-white"
                          style={{ backgroundColor: BRAND.purple }}
                        >
                          {initials}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                </div>
              </div>

              <CardContent className="pt-10 lg:pt-12 pb-4 px-4 lg:px-6 flex-1 flex flex-col overflow-auto">
                {/* Identity Section */}
                <div className="flex items-center gap-2 mb-3 lg:mb-4 flex-shrink-0">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className={cn(
                        "text-base lg:text-lg font-semibold tracking-tight",
                        isDark ? "text-white" : "text-zinc-900"
                      )}>
                        {displayName}
                      </h2>
                      <span
                        className="inline-flex items-center px-1.5 lg:px-2 py-0.5 rounded-full text-[10px] lg:text-xs font-medium border"
                        style={{
                          borderColor: BRAND.purple,
                          color: BRAND.purple,
                        }}
                      >
                        Free Plan
                      </span>
                    </div>
                    <p className={cn(
                      "text-xs lg:text-sm",
                      isDark ? "text-zinc-400" : "text-zinc-500"
                    )}>{email}</p>
                  </div>
                </div>

                <Separator className={cn("mb-3 lg:mb-4 flex-shrink-0", isDark ? "bg-zinc-800" : "bg-zinc-200")} />

                {/* Form Section */}
                <div className="space-y-3 lg:space-y-4 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                    {/* Name Field */}
                    <div className="space-y-1">
                      <label className={cn(
                        "text-xs lg:text-sm font-medium",
                        isDark ? "text-zinc-400" : "text-zinc-500"
                      )}>Full Name</label>
                      <div className="relative">
                        <User className={cn(
                          "absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 lg:h-4 lg:w-4",
                          isDark ? "text-zinc-500" : "text-zinc-400"
                        )} />
                        <Input
                          value={displayName}
                          readOnly
                          className={cn(
                            "pl-9 lg:pl-10 h-9 lg:h-10 text-sm rounded-lg cursor-not-allowed",
                            isDark 
                              ? "bg-zinc-800/50 text-zinc-300 border-zinc-700" 
                              : "bg-zinc-50/50 text-zinc-600 border-zinc-200"
                          )}
                        />
                      </div>
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-1">
                      <label className={cn(
                        "text-xs lg:text-sm font-medium",
                        isDark ? "text-zinc-400" : "text-zinc-500"
                      )}>Phone Number</label>
                      <div className="relative">
                        <Phone className={cn(
                          "absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 lg:h-4 lg:w-4",
                          isDark ? "text-zinc-500" : "text-zinc-400"
                        )} />
                        <Input
                          value={phone}
                          readOnly
                          className={cn(
                            "pl-9 lg:pl-10 h-9 lg:h-10 text-sm rounded-lg cursor-not-allowed",
                            isDark 
                              ? "bg-zinc-800/50 text-zinc-300 border-zinc-700" 
                              : "bg-zinc-50/50 text-zinc-600 border-zinc-200"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email Field - Full Width */}
                  <div className="space-y-1">
                    <label className={cn(
                      "text-xs lg:text-sm font-medium",
                      isDark ? "text-zinc-400" : "text-zinc-500"
                    )}>Email Address</label>
                    <div className="relative">
                      <Mail className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 lg:h-4 lg:w-4",
                        isDark ? "text-zinc-500" : "text-zinc-400"
                      )} />
                      <Input
                        value={email}
                        readOnly
                        className={cn(
                          "pl-9 lg:pl-10 pr-9 lg:pr-10 h-9 lg:h-10 text-sm rounded-lg cursor-not-allowed",
                          isDark 
                            ? "bg-zinc-800/50 text-zinc-300 border-zinc-700" 
                            : "bg-zinc-50/50 text-zinc-600 border-zinc-200"
                        )}
                      />
                      <Lock className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 lg:h-4 lg:w-4",
                        isDark ? "text-zinc-500" : "text-zinc-400"
                      )} />
                    </div>
                  </div>
                </div>

                <Separator className={cn("my-3 lg:my-4 flex-shrink-0", isDark ? "bg-zinc-800" : "bg-zinc-200")} />

                {/* Action Section */}
                <div className="flex items-center justify-between flex-shrink-0 flex-wrap gap-2">
                  <span className={cn(
                    "inline-flex items-center px-2 py-1 rounded-md text-[10px] lg:text-xs font-medium",
                    isDark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500"
                  )}>
                    <Lock className="h-3 w-3 mr-1" />
                    Profile editing disabled
                  </span>
                  <Button
                    disabled
                    size="sm"
                    className="rounded-lg text-xs lg:text-sm h-8 lg:h-9 text-white"
                    style={{
                      backgroundColor: BRAND.purple,
                      opacity: 0.5,
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Account
