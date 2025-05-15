
import React from 'react';
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingProps {
  /**
   * Optional text to display below the spinner
   */
  text?: string;
  
  /**
   * Whether to show in fullscreen mode (centered in viewport)
   */
  fullscreen?: boolean;
  
  /**
   * Size of the loading spinner
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Additional classes to apply to the container
   */
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  text = "Carregando...",
  fullscreen = false,
  size = "md",
  className
}) => {
  const spinnerSizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const containerClasses = cn(
    "flex items-center justify-center",
    fullscreen ? "min-h-screen" : "p-6",
    className
  );

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <Loader2 className={cn(spinnerSizes[size], "animate-spin mx-auto mb-2")} />
        {text && (
          <p className={cn(
            "text-oficina-gray",
            size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base"
          )}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default Loading;
