import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Premium Auto-fix Button Component
 * 
 * Design System Purple Palette:
 * - Lightest: #DFC4FF (Highlights, faint borders, glow effects)
 * - Lighter:  #BC9CE2
 * - Light:    #9D7FC1
 * - Base:     #815FAA (Primary backgrounds)
 * - Darkest:  #684C8A (Shadows, active states, borders)
 */

export type AutoFixButtonVariant = 'glass-glow' | 'solid-tactile' | 'ghost'
export type AutoFixButtonSize = 'sm' | 'md' | 'lg'

interface AutoFixButtonProps {
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
    variant?: AutoFixButtonVariant
    size?: AutoFixButtonSize
    isLoading?: boolean
    disabled?: boolean
    className?: string
    label?: string
    loadingLabel?: string
}

// Size configurations
const sizeConfig = {
    sm: {
        padding: 'px-3 py-1.5',
        text: 'text-xs',
        gap: 'gap-1.5',
        iconSize: 'w-3.5 h-3.5',
        minWidth: 'min-w-[76px]',
    },
    md: {
        padding: 'px-4 py-2',
        text: 'text-sm',
        gap: 'gap-2',
        iconSize: 'w-4 h-4',
        minWidth: 'min-w-[92px]',
    },
    lg: {
        padding: 'px-5 py-2.5',
        text: 'text-sm',
        gap: 'gap-2',
        iconSize: 'w-4 h-4',
        minWidth: 'min-w-[108px]',
    },
}

export const AutoFixButton: React.FC<AutoFixButtonProps> = ({
    onClick,
    variant = 'glass-glow',
    size = 'sm',
    isLoading = false,
    disabled = false,
    className,
    label = 'Auto-fix',
    loadingLabel = 'Fixing...',
}) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [buttonWidth, setButtonWidth] = useState<number | undefined>(undefined)

    // Capture initial width to prevent layout shift during loading
    useEffect(() => {
        if (buttonRef.current && !buttonWidth) {
            setButtonWidth(buttonRef.current.offsetWidth)
        }
    }, [buttonWidth])

    const config = sizeConfig[size]
    const isDisabled = disabled || isLoading

    // Get variant-specific classes and styles
    const getVariantClasses = () => {
        switch (variant) {
            case 'glass-glow':
                return cn(
                    // Gradient background: Base (#815FAA) to Light (#9D7FC1)
                    'bg-gradient-to-r from-[#815FAA] to-[#9D7FC1]',
                    // Glass edge: Lightest (#DFC4FF) at 30% opacity
                    'border border-[#DFC4FF]/30',
                    // Text & font
                    'text-white font-medium',
                    // Rounded corners
                    'rounded-lg',
                    // Base shadow with glow: Base (#815FAA) at 20% opacity
                    'shadow-[0_2px_8px_rgba(129,95,170,0.25)]',
                    // Transitions
                    'transition-all duration-200 ease-out',
                    // Hover: Enhanced glow
                    !isDisabled && 'hover:shadow-[0_4px_16px_rgba(129,95,170,0.35)] hover:border-[#DFC4FF]/50',
                    // Disabled
                    isDisabled && 'opacity-60 cursor-not-allowed'
                )
            
            case 'solid-tactile':
                return cn(
                    // Solid background: Base (#815FAA)
                    'bg-[#815FAA]',
                    // Bottom border shadow for depth: Darkest (#684C8A)
                    'shadow-[0_2px_0_0_#684C8A,0_4px_8px_rgba(104,76,138,0.25)]',
                    // Text & font
                    'text-white font-medium',
                    // Squircle shape
                    'rounded-lg',
                    // Transitions
                    'transition-all duration-150 ease-out',
                    // Hover: Shift to Light (#9D7FC1) and press down
                    !isDisabled && 'hover:bg-[#9D7FC1] hover:shadow-[0_1px_0_0_#684C8A,0_2px_4px_rgba(104,76,138,0.2)] hover:translate-y-[1px]',
                    // Active: Full press
                    !isDisabled && 'active:shadow-[0_0px_0_0_#684C8A,0_1px_2px_rgba(104,76,138,0.15)] active:translate-y-[2px]',
                    // Disabled
                    isDisabled && 'opacity-60 cursor-not-allowed'
                )
            
            case 'ghost':
                return cn(
                    // Transparent or faint Lightest (#DFC4FF) at 10% opacity
                    'bg-[#DFC4FF]/10',
                    // Border with Lightest (#DFC4FF) at 40% opacity
                    'border border-[#DFC4FF]/40',
                    // Text & Icon: Base (#815FAA)
                    'text-[#815FAA] font-medium',
                    // Rounded corners
                    'rounded-lg',
                    // Transitions
                    'transition-all duration-200 ease-out',
                    // Hover: Fill with Lightest (#DFC4FF) at 30% opacity
                    !isDisabled && 'hover:bg-[#DFC4FF]/30 hover:border-[#BC9CE2]/60',
                    // Disabled
                    isDisabled && 'opacity-60 cursor-not-allowed'
                )
            
            default:
                return ''
        }
    }

    // Icon color based on variant
    const getIconColor = () => {
        switch (variant) {
            case 'glass-glow':
                return 'text-[#DFC4FF]' // Lightest for contrast
            case 'solid-tactile':
                return 'text-[#DFC4FF]' // Lightest for contrast
            case 'ghost':
                return 'text-[#815FAA]' // Base color
            default:
                return 'text-white'
        }
    }

    // Spinner color based on variant
    const getSpinnerColor = () => {
        switch (variant) {
            case 'glass-glow':
            case 'solid-tactile':
                return 'text-[#DFC4FF]' // Lightest
            case 'ghost':
                return 'text-[#815FAA]' // Base
            default:
                return 'text-white'
        }
    }

    return (
        <motion.button
            ref={buttonRef}
            onClick={onClick}
            disabled={isDisabled}
            style={buttonWidth ? { minWidth: buttonWidth } : undefined}
            className={cn(
                // Base layout
                'inline-flex items-center justify-center',
                config.padding,
                config.gap,
                config.text,
                config.minWidth,
                // Variant styles
                getVariantClasses(),
                // Custom className
                className
            )}
            whileHover={!isDisabled ? { scale: 1.02 } : undefined}
            whileTap={!isDisabled ? { scale: 0.98 } : undefined}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            layout
        >
            {/* Icon with smooth transition to spinner */}
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="flex items-center justify-center"
                    >
                        <Loader2 className={cn(config.iconSize, 'animate-spin', getSpinnerColor())} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="icon"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="flex items-center justify-center"
                    >
                        <Sparkles className={cn(config.iconSize, getIconColor())} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Text with smooth transition */}
            <AnimatePresence mode="wait">
                <motion.span
                    key={isLoading ? 'loading' : 'default'}
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -2 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="whitespace-nowrap"
                >
                    {isLoading ? loadingLabel : label}
                </motion.span>
            </AnimatePresence>
        </motion.button>
    )
}

/**
 * Glass/Glow Variant
 * Features: Gradient from Base to Light, glass edge, colored glow shadow
 */
export const AutoFixButtonGlass: React.FC<Omit<AutoFixButtonProps, 'variant'>> = (props) => (
    <AutoFixButton {...props} variant="glass-glow" />
)

/**
 * Solid & Tactile Variant
 * Features: Solid Base color, physical depth with bottom shadow, press animation
 */
export const AutoFixButtonSolid: React.FC<Omit<AutoFixButtonProps, 'variant'>> = (props) => (
    <AutoFixButton {...props} variant="solid-tactile" />
)

/**
 * Ghost Variant
 * Features: Transparent base, fills on hover, contextual/low noise
 */
export const AutoFixButtonGhost: React.FC<Omit<AutoFixButtonProps, 'variant'>> = (props) => (
    <AutoFixButton {...props} variant="ghost" />
)

export default AutoFixButton
