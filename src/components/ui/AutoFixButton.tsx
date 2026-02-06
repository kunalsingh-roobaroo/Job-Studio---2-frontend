import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Soft Minimalist Auto-fix Button Component
 * 
 * Brand Purple Palette:
 * - Lightest: #DFC4FF (backgrounds, light fills)
 * - Lighter:  #BC9CE2 (dark mode icons/accents)
 * - Light:    #9D7FC1 (medium accents)
 * - Base:     #815FAA (primary actions, buttons, icons)
 * - Darkest:  #684C8A (hover states, gradient ends)
 */

export type AutoFixButtonVariant = 'primary' | 'soft' | 'ghost'
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

// Size configurations - generous padding for soft feel
const sizeConfig = {
    sm: {
        padding: 'px-4 py-2',
        text: 'text-[13px]',
        gap: 'gap-2',
        iconSize: 'w-3.5 h-3.5',
        minWidth: 'min-w-[90px]',
    },
    md: {
        padding: 'px-5 py-2.5',
        text: 'text-[14px]',
        gap: 'gap-2.5',
        iconSize: 'w-4 h-4',
        minWidth: 'min-w-[100px]',
    },
    lg: {
        padding: 'px-6 py-3',
        text: 'text-[15px]',
        gap: 'gap-2.5',
        iconSize: 'w-4 h-4',
        minWidth: 'min-w-[120px]',
    },
}

export const AutoFixButton: React.FC<AutoFixButtonProps> = ({
    onClick,
    variant = 'primary',
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

    // Get variant-specific classes - full pill shapes, soft shadows
    const getVariantClasses = () => {
        switch (variant) {
            case 'primary':
                return cn(
                    // Solid brand purple background
                    'bg-[#815FAA]',
                    // Text
                    'text-white font-medium',
                    // Full pill shape (no sharp corners!)
                    'rounded-full',
                    // Soft diffused shadow
                    'shadow-[0_8px_30px_rgb(129_95_170/0.2)]',
                    // Transitions
                    'transition-all duration-300 ease-out',
                    // Hover: Darker + lift
                    !isDisabled && 'hover:bg-[#684C8A] hover:shadow-[0_12px_40px_rgb(129_95_170/0.3)] hover:-translate-y-[2px]',
                    // Active: Press
                    !isDisabled && 'active:translate-y-0 active:shadow-[0_8px_30px_rgb(129_95_170/0.2)]',
                    // Disabled
                    isDisabled && 'opacity-50 cursor-not-allowed'
                )
            
            case 'soft':
                return cn(
                    // Soft brand purple background
                    'bg-[#DFC4FF]/40',
                    // Brand purple text
                    'text-[#815FAA] font-medium',
                    // Full pill shape
                    'rounded-full',
                    // Soft shadow
                    'shadow-[0_4px_20px_rgb(0_0_0/0.04)]',
                    // Transitions
                    'transition-all duration-300 ease-out',
                    // Hover: Slightly darker bg + lift
                    !isDisabled && 'hover:bg-[#DFC4FF]/60 hover:shadow-[0_8px_30px_rgb(0_0_0/0.08)] hover:-translate-y-[2px]',
                    // Disabled
                    isDisabled && 'opacity-50 cursor-not-allowed'
                )
            
            case 'ghost':
                return cn(
                    // Transparent base
                    'bg-transparent',
                    // Brand purple text
                    'text-[#815FAA] font-medium',
                    // Full pill shape
                    'rounded-full',
                    // Transitions
                    'transition-all duration-300 ease-out',
                    // Hover: Fill with soft brand purple
                    !isDisabled && 'hover:bg-[#DFC4FF]/40',
                    // Disabled
                    isDisabled && 'opacity-50 cursor-not-allowed'
                )
            
            default:
                return ''
        }
    }

    // Icon color based on variant
    const getIconColor = () => {
        switch (variant) {
            case 'primary':
                return 'text-white/90'
            case 'soft':
            case 'ghost':
                return 'text-[#815FAA]'
            default:
                return 'text-white'
        }
    }

    // Spinner color based on variant
    const getSpinnerColor = () => {
        switch (variant) {
            case 'primary':
                return 'text-white/90'
            case 'soft':
            case 'ghost':
                return 'text-[#815FAA]'
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
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
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
 * Primary Variant - Full pill, violet background, white text
 */
export const AutoFixButtonPrimary: React.FC<Omit<AutoFixButtonProps, 'variant'>> = (props) => (
    <AutoFixButton {...props} variant="primary" />
)

/**
 * Soft Variant - Full pill, soft violet background, violet text
 */
export const AutoFixButtonSoft: React.FC<Omit<AutoFixButtonProps, 'variant'>> = (props) => (
    <AutoFixButton {...props} variant="soft" />
)

/**
 * Ghost Variant - Transparent, fills on hover
 */
export const AutoFixButtonGhost: React.FC<Omit<AutoFixButtonProps, 'variant'>> = (props) => (
    <AutoFixButton {...props} variant="ghost" />
)

// Legacy exports for backward compatibility
export const AutoFixButtonGlass = AutoFixButtonPrimary
export const AutoFixButtonSolid = AutoFixButtonPrimary

export default AutoFixButton
