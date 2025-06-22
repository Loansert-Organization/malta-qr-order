
import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipContextType {
  content: string | null
  setContent: (content: string | null) => void
  isVisible: boolean
  setIsVisible: (visible: boolean) => void
}

const TooltipContext = React.createContext<TooltipContextType | null>(null)

const TooltipProvider = ({ children, delayDuration = 0 }: { children: React.ReactNode; delayDuration?: number }) => {
  const [content, setContent] = React.useState<string | null>(null)
  const [isVisible, setIsVisible] = React.useState(false)

  return (
    <TooltipContext.Provider value={{ content, setContent, isVisible, setIsVisible }}>
      {children}
    </TooltipContext.Provider>
  )
}

const TooltipRoot = ({ children }: { children: React.ReactNode }) => {
  return <div className="relative inline-block">{children}</div>
}

const TooltipTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
  const context = React.useContext(TooltipContext)
  
  return (
    <div
      onMouseEnter={() => context?.setIsVisible(true)}
      onMouseLeave={() => context?.setIsVisible(false)}
      onFocus={() => context?.setIsVisible(true)}
      onBlur={() => context?.setIsVisible(false)}
    >
      {children}
    </div>
  )
}

const TooltipContent = ({ 
  children, 
  className, 
  side = 'top', 
  align = 'center', 
  hidden = false,
  sideOffset = 4,
  ...props 
}: { 
  children?: React.ReactNode
  className?: string
  side?: string 
  align?: string
  hidden?: boolean
  sideOffset?: number
}) => {
  const context = React.useContext(TooltipContext)
  
  if (hidden || !context?.isVisible) return null

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  }

  return (
    <div
      className={cn(
        "absolute z-50 px-3 py-1.5 text-sm text-white bg-gray-900 rounded-md shadow-lg whitespace-nowrap",
        positionClasses[side as keyof typeof positionClasses] || positionClasses.top,
        className
      )}
      {...props}
    >
      {children}
      <div
        className={cn(
          "absolute w-2 h-2 bg-gray-900 transform rotate-45",
          side === 'top' && "top-full left-1/2 -translate-x-1/2 -mt-1",
          side === 'bottom' && "bottom-full left-1/2 -translate-x-1/2 -mb-1",
          side === 'left' && "left-full top-1/2 -translate-y-1/2 -ml-1",
          side === 'right' && "right-full top-1/2 -translate-y-1/2 -mr-1"
        )}
      />
    </div>
  )
}

export { TooltipProvider, TooltipRoot as Tooltip, TooltipTrigger, TooltipContent }
