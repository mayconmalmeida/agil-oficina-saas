import * as React from "react"

import { cn } from "@/lib/utils"

// Simple tooltip implementation without Radix UI
interface TooltipProps {
  children: React.ReactNode;
  content: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip = ({ children, content, side = 'top' }: TooltipProps) => {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-3 py-1.5 text-sm text-white bg-gray-900 rounded-md shadow-lg whitespace-nowrap",
            {
              'bottom-full left-1/2 transform -translate-x-1/2 mb-2': side === 'top',
              'top-full left-1/2 transform -translate-x-1/2 mt-2': side === 'bottom',
              'right-full top-1/2 transform -translate-y-1/2 mr-2': side === 'left',
              'left-full top-1/2 transform -translate-y-1/2 ml-2': side === 'right',
            }
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};

// Dummy components for compatibility
const TooltipTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const TooltipContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
