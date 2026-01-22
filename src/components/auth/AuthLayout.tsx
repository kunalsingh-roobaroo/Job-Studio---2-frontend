/**
 * =============================================================================
 * AUTH LAYOUT COMPONENT - Lovable-Style Aesthetic
 * =============================================================================
 * 
 * A premium split-screen layout with:
 * - Left: Clean, minimalist form container
 * - Right: Artistic mesh gradient background with glassmorphism
 * 
 * BRAND PALETTE:
 * - Purple: #815FAA (Base), #BC9CE2 (Lighter), #DFC4FF (Lightest), #684C8A (Darkest)
 * - Coral: #FB7D7D (Base), #FFA6A6 (Light)
 * - Blue: #27AAE7 (Base), #57C2F3 (Light), #D2F1FF (Lightest)
 * - Ink: #0C0C0C (Base), #202325 (Light)
 * - Neutral: #FFFFFF (Base), #F2F4F5 (Dark)
 * 
 * =============================================================================
 */

import * as React from "react"
import { cn } from "@/lib/utils"

// College Logos
import IITKGPLogo from "@/assets/colleges/Iit_KGP.png"
import IITDelhiLogo from "@/assets/colleges/iit_delhi.jpeg"
import IITMadrasLogo from "@/assets/colleges/Iit madras.png"
import MastersUnionLogo from "@/assets/colleges/masters_union.jpeg"
import RishihoodLogo from "@/assets/colleges/rishihood.png"

// =============================================================================
// BRAND COLORS
// =============================================================================

const COLORS = {
  purple: {
    base: "#815FAA",
    lighter: "#BC9CE2",
    lightest: "#DFC4FF",
    darkest: "#684C8A",
  },
  coral: {
    base: "#FB7D7D",
    light: "#FFA6A6",
  },
  blue: {
    base: "#27AAE7",
    light: "#57C2F3",
    lightest: "#D2F1FF",
  },
  ink: {
    base: "#0C0C0C",
    light: "#202325",
  },
  neutral: {
    base: "#FFFFFF",
    dark: "#F2F4F5",
  },
}

// =============================================================================
// CONSTANTS
// =============================================================================

const INSTITUTIONS = [
  { name: "IIT KGP", logo: IITKGPLogo },
  { name: "IIT Delhi", logo: IITDelhiLogo },
  { name: "IIT Madras", logo: IITMadrasLogo },
  { name: "Masters' Union", logo: MastersUnionLogo },
  { name: "Rishihood University", logo: RishihoodLogo },
]

const FEATURES = [
  "One-stop solution for all your resume needs",
  "Get interview questions & curated ideas to boost credibility",
  "Personalised suggestions for a standout LinkedIn profile",
]

// =============================================================================
// TYPES
// =============================================================================

interface AuthLayoutProps {
  children: React.ReactNode
  className?: string
  mode?: "dark" | "light"
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/**
 * Gradient Blobs - Creates the mesh gradient effect
 */
function GradientBlobs({ mode }: { mode: "dark" | "light" }) {
  if (mode === "dark") {
    return (
      <>
        {/* Purple blob - top left */}
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full mix-blend-screen filter blur-[100px] opacity-40"
          style={{ backgroundColor: COLORS.purple.base }}
        />
        {/* Blue blob - bottom right */}
        <div
          className="absolute -bottom-32 -right-32 w-[450px] h-[450px] rounded-full mix-blend-screen filter blur-[100px] opacity-30"
          style={{ backgroundColor: COLORS.blue.base }}
        />
        {/* Purple darkest blob - center */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full mix-blend-screen filter blur-[120px] opacity-50"
          style={{ backgroundColor: COLORS.purple.darkest }}
        />
        {/* Coral accent - top right */}
        <div
          className="absolute top-20 right-20 w-[200px] h-[200px] rounded-full mix-blend-screen filter blur-[80px] opacity-20"
          style={{ backgroundColor: COLORS.coral.base }}
        />
      </>
    )
  }

  // Light mode blobs
  return (
    <>
      {/* Coral blob - top right */}
      <div
        className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full mix-blend-multiply filter blur-[100px] opacity-60"
        style={{ backgroundColor: COLORS.coral.light }}
      />
      {/* Blue blob - bottom left */}
      <div
        className="absolute -bottom-32 -left-32 w-[450px] h-[450px] rounded-full mix-blend-multiply filter blur-[100px] opacity-70"
        style={{ backgroundColor: COLORS.blue.lightest }}
      />
      {/* Purple blob - center */}
      <div
        className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full mix-blend-multiply filter blur-[120px] opacity-50"
        style={{ backgroundColor: COLORS.purple.lightest }}
      />
    </>
  )
}

/**
 * Marquee - Scrolling institution logos
 */
function InstitutionMarquee({ size = "default" }: { mode: "dark" | "light"; size?: "default" | "small" }) {
  const logoHeight = size === "small" ? "h-8" : "h-16"
  const gapSize = size === "small" ? "gap-6" : "gap-8"
  
  return (
    <div className="overflow-hidden">
      <div className={cn("inline-flex animate-marquee items-center", gapSize)}>
        {[...INSTITUTIONS, ...INSTITUTIONS].map((institution, idx) => (
          <div
            key={`${institution.name}-${idx}`}
            className="flex-shrink-0"
          >
            <img 
              src={institution.logo} 
              alt={institution.name} 
              className={cn(logoHeight, "w-auto object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all")}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Feature Item - Checkmark + text
 */
function FeatureItem({ text, mode }: { text: string; mode: "dark" | "light" }) {
  const isDark = mode === "dark"
  return (
    <div className="flex items-start gap-3">
      <div className={cn(
        "mt-0.5 h-5 w-5 rounded-full backdrop-blur-sm flex items-center justify-center flex-shrink-0",
        isDark ? "bg-white/20" : "bg-[#0C0C0C]/20"
      )}>
        <svg
          className={cn("h-3 w-3", isDark ? "text-white" : "text-[#0C0C0C]")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className={cn(
        "text-sm leading-relaxed",
        isDark ? "text-white/80" : "text-[#0C0C0C]/80"
      )}>{text}</p>
    </div>
  )
}

/**
 * Stats Item
 */
function StatItem({ value, label, mode }: { value: string; label: string; mode: "dark" | "light" }) {
  const isDark = mode === "dark"
  return (
    <div className="text-center">
      <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-[#0C0C0C]")}>{value}</p>
      <p className={cn("text-xs", isDark ? "text-white/50" : "text-[#0C0C0C]/50")}>{label}</p>
    </div>
  )
}

/**
 * Mobile Panel - Simplified version for mobile view
 */
function MobileArtisticPanel({ mode }: { mode: "dark" | "light" }) {
  const bgColor = mode === "dark" ? COLORS.ink.base : COLORS.neutral.base
  const textColor = mode === "dark" ? "text-white" : "text-[#0C0C0C]"

  return (
    <div
      className="relative h-full overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* Gradient Blobs */}
      <GradientBlobs mode={mode} />

      {/* Content Overlay - Simplified for mobile */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center p-6 text-center">
        <h1 className={cn("text-2xl font-bold", textColor)}>Job Studio</h1>
        <p className={cn("text-xs mb-3", mode === "dark" ? "text-white/60" : "text-gray-500")}>
          by Roobaroo.ai
        </p>
        <h2 className={cn("text-lg font-bold leading-tight", textColor)}>
          Your AI-Powered{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(135deg, ${COLORS.purple.lighter}, ${COLORS.coral.base}, ${COLORS.blue.light})`,
            }}
          >
            Career Companion
          </span>
        </h2>
      </div>
    </div>
  )
}

/**
 * Right Side Panel - Artistic Gradient Background
 */
function ArtisticPanel({ mode }: { mode: "dark" | "light" }) {
  const bgColor = mode === "dark" ? COLORS.ink.base : COLORS.neutral.base
  const textColor = mode === "dark" ? "text-white" : "text-[#0C0C0C]"

  return (
    <div
      className="relative h-full overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* Gradient Blobs */}
      <GradientBlobs mode={mode} />

      {/* Content Overlay with Glass Effect */}
      <div className="relative z-10 h-full flex flex-col p-8 lg:p-12">
        {/* Top spacer - to push Job Studio down to align with left side logo */}
        <div className="h-[12%]" />

        {/* Job Studio heading - aligned with left side logo position */}
        <div>
          <h1 className={cn("text-3xl font-bold", textColor)}>Job Studio</h1>
          <p className={cn("text-sm", mode === "dark" ? "text-white/60" : "text-gray-500")}>
            by Roobaroo.ai
          </p>
        </div>

        {/* Spacer - pushes content to bottom */}
        <div className="flex-1" />

        {/* Bottom content block - with margin bottom to push it up */}
        <div className="space-y-3 mb-28">
          {/* Hero Text */}
          <div className="space-y-1">
            <h2 className={cn("text-xl lg:text-2xl font-bold leading-tight", textColor)}>
              Your AI-Powered{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${COLORS.purple.lighter}, ${COLORS.coral.base}, ${COLORS.blue.light})`,
                }}
              >
                Career Companion
              </span>
            </h2>
            <p className={cn("text-xs", mode === "dark" ? "text-white/60" : "text-gray-600")}>
              Transform your career journey with AI-powered tools designed to help you stand out.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-1.5">
            {FEATURES.map((feature, idx) => (
              <FeatureItem key={idx} text={feature} mode={mode} />
            ))}
          </div>

          {/* Trusted By */}
          <div className="space-y-3 pt-2">
            <p className={cn("text-xs uppercase tracking-wider font-medium", mode === "dark" ? "text-white/40" : "text-gray-400")}>
              Trusted by students from
            </p>
            <InstitutionMarquee mode={mode} />
          </div>

          {/* Stats */}
          <div className="flex justify-between max-w-xs pt-4">
            <StatItem value="10K+" label="Resumes" mode={mode} />
            <StatItem value="95%" label="Success" mode={mode} />
            <StatItem value="4.9★" label="Rating" mode={mode} />
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// CENTERED LAYOUT (for post-verification steps)
// =============================================================================

export function CenteredAuthLayout({ children, mode = "dark" }: { children: React.ReactNode; mode?: "dark" | "light" }) {
  const bgColor = mode === "dark" ? COLORS.ink.base : COLORS.neutral.base

  return (
    <div
      className="min-h-screen flex items-center justify-center font-['Inter',sans-serif] relative overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* Background gradient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        {mode === "dark" ? (
          <>
            <div
              className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full mix-blend-screen filter blur-[150px] opacity-30"
              style={{ backgroundColor: COLORS.purple.base }}
            />
            <div
              className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full mix-blend-screen filter blur-[150px] opacity-20"
              style={{ backgroundColor: COLORS.blue.base }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full mix-blend-screen filter blur-[120px] opacity-15"
              style={{ backgroundColor: COLORS.blue.light }}
            />
          </>
        ) : (
          <>
            <div
              className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-[150px] opacity-40"
              style={{ backgroundColor: COLORS.coral.light }}
            />
            <div
              className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full mix-blend-multiply filter blur-[150px] opacity-50"
              style={{ backgroundColor: COLORS.blue.lightest }}
            />
            <div
              className="absolute top-1/3 right-1/3 w-[300px] h-[300px] rounded-full mix-blend-multiply filter blur-[100px] opacity-30"
              style={{ backgroundColor: COLORS.purple.lightest }}
            />
          </>
        )}
      </div>

      {/* Centered content */}
      <div className="relative z-10 w-full max-w-lg p-6">
        {children}
      </div>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AuthLayout({ children, className, mode = "dark" }: AuthLayoutProps) {
  return (
    <div className={cn(
      "min-h-screen flex flex-col lg:flex-row font-['Inter',sans-serif]",
      mode === "dark" ? "bg-[#0C0C0C]" : "bg-[#F8F8F8]"
    )}>
      {/* Mobile: Simplified Artistic Panel on top */}
      <div className="lg:hidden h-[25vh] min-h-[180px] p-3">
        <div className="h-full rounded-3xl overflow-hidden">
          <MobileArtisticPanel mode={mode} />
        </div>
      </div>

      {/* Left Side: Form Container */}
      <div
        className={cn(
          "flex-1 flex items-center justify-center p-6 lg:p-12",
          mode === "dark" ? "bg-[#0C0C0C]" : "bg-[#F8F8F8]",
          className
        )}
      >
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Desktop: Artistic Panel on right with rounded edges */}
      <div className="hidden lg:block lg:w-1/2 xl:w-[45%] p-4">
        <div className="h-full rounded-3xl overflow-hidden shadow-2xl">
          <ArtisticPanel mode={mode} />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
