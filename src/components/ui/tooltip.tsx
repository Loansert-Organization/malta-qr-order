
import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactNode
  content: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const Tooltip = ({ children, content, side = 'top', className }: TooltipProps) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-3 py-1.5 text-sm text-white bg-gray-900 rounded-md shadow-lg whitespace-nowrap",
            positionClasses[side],
            className
          )}
        >
          {content}
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
      )}
    </div>
  );
};

// For backward compatibility with existing code
const TooltipTrigger = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const TooltipContent = ({ children, className, ...props }: { 
  children: React.ReactNode; 
  className?: string;
  sideOffset?: number;
}) => {
  return <span className={className} {...props}>{children}</span>;
};

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
