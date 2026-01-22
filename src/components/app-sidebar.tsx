import * as React from "react"
import { useLocation } from "react-router-dom"
import { Home, Linkedin, User, FileText, Globe, Info, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from "@/components/ui/animated-sidebar"

interface AppSidebarProps {
  hideProjectsAndUser?: boolean
}

export function AppSidebar({ hideProjectsAndUser = false }: AppSidebarProps) {
  const location = useLocation()
  const [open, setOpen] = React.useState(false)

  const links = [
    {
      label: "Home",
      href: "/",
      icon: (
        <Home
          className={cn(
            "h-5 w-5 flex-shrink-0",
            location.pathname === "/" ? "text-[#815FAA]" : "text-neutral-700 dark:text-neutral-200"
          )}
        />
      ),
    },
    {
      label: "LinkedIn",
      href: "/linkedin",
      icon: (
        <Linkedin
          className={cn(
            "h-5 w-5 flex-shrink-0",
            location.pathname.startsWith("/linkedin") ? "text-[#815FAA]" : "text-neutral-700 dark:text-neutral-200"
          )}
        />
      ),
    },
    {
      label: "Account",
      href: "/account",
      icon: (
        <User
          className={cn(
            "h-5 w-5 flex-shrink-0",
            location.pathname === "/account" ? "text-[#815FAA]" : "text-neutral-700 dark:text-neutral-200"
          )}
        />
      ),
      disabled: hideProjectsAndUser,
    },
  ]

  const accessibilityLinks = [
    {
      label: "Language",
      href: "#",
      icon: <Globe className="h-4 w-4 flex-shrink-0 text-gray-600" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault()
        // TODO: Open language selector modal/submenu
        console.log("Language selector clicked")
      },
    },
    {
      label: "About",
      href: "#",
      icon: <Info className="h-4 w-4 flex-shrink-0 text-gray-600" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault()
        // TODO: Open about modal
        console.log("About clicked")
      },
    },
    {
      label: "Feedback",
      href: "#",
      icon: <MessageSquare className="h-4 w-4 flex-shrink-0 text-gray-600" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault()
        // TODO: Open feedback form
        console.log("Feedback clicked")
      },
    },
  ]

  return (
    <Sidebar open={open} setOpen={setOpen} animate={true}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#815FAA] flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            {open && (
              <span className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                Job Studio
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>

        {/* Accessibility Section - Pinned at Bottom */}
        <div className="flex flex-col">
          {/* Accessibility Header */}
          {open && (
            <div className="text-[11px] font-bold tracking-wider text-gray-400 pl-3 mb-2 mt-6">
              ACCESSIBILITY
            </div>
          )}

          {/* Accessibility Menu Items */}
          <div className="flex flex-col gap-1">
            {accessibilityLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                onClick={link.onClick}
                className={cn(
                  "flex items-center gap-3 h-9 px-3 rounded-lg",
                  "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                  "font-medium transition-colors duration-150",
                  "cursor-pointer"
                )}
              >
                {link.icon}
                {open && (
                  <span className="text-sm whitespace-nowrap">
                    {link.label}
                  </span>
                )}
              </a>
            ))}
          </div>

          {/* Profile Button Placeholder - Can be added here later */}
          {/* TODO: Add Stacked Profile Button (Free Plan) here */}
        </div>
      </SidebarBody>
    </Sidebar>
  )
}
