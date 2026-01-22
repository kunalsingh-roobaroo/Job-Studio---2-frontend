import { useNavigate, useLocation } from "react-router-dom"
import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar"
import { useApp } from "@/contexts/AppContext"
import { cn } from "@/lib/utils"

interface MenuItem {
  label: string
  route: (resumeId: string | null) => string
  isActive: (pathname: string) => boolean
}

const menuItems: MenuItem[] = [
  {
    label: "Resume Evaluation",
    route: (resumeId) => resumeId ? `/resume/${resumeId}/evaluation` : "/",
    isActive: (pathname) => /^\/resume\/[^/]+\/evaluation$/.test(pathname),
  },
  {
    label: "LinkedIn Optimization",
    route: (resumeId) => resumeId ? `/resume/${resumeId}/linkedin-optimization` : "/",
    isActive: (pathname) => pathname.endsWith("/linkedin-optimization"),
  },
]

export function TopMenubar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { resumeId } = useApp()

  const handleNavigation = (item: MenuItem) => {
    const route = item.route(resumeId)
    navigate(route)
  }

  return (
    <Menubar className={cn(
      "h-12 bg-background/30 backdrop-blur-md border-border/30 shadow-sm",
      "flex items-center gap-0.5 p-0.5 mb-4 md:mb-6 rounded-full",
      "w-full justify-start md:justify-center overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    )}>
      {menuItems.map((item) => {
        const isActive = item.isActive(location.pathname)
        
        return (
          <MenubarMenu key={item.label}>
            <MenubarTrigger
              onClick={(e: React.MouseEvent) => {
                e.preventDefault()
                e.stopPropagation()
                handleNavigation(item)
              }}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  e.stopPropagation()
                  handleNavigation(item)
                }
              }}
              className={cn(
                "h-10 px-2.5 md:px-3 py-1 text-xs md:text-sm font-medium rounded-full",
                "transition-all duration-200 ease-in-out",
                "cursor-pointer select-none",
                "whitespace-normal leading-snug text-center",
                isActive
                  ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </MenubarTrigger>
          </MenubarMenu>
        )
      })}
    </Menubar>
  )
}

