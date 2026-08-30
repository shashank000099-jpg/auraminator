"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-mono text-xs uppercase tracking-wider font-semibold transition-all duration-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const variantStyles = {
      primary: "bg-white text-black hover:bg-zinc-200 border border-white",
      secondary: "bg-surface-elevated text-white hover:bg-surface-subtle border border-border",
      outline: "bg-transparent text-white border border-border hover:border-white/40 hover:bg-white/5",
      danger: "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20",
      ghost: "bg-transparent text-muted hover:text-white hover:bg-white/5",
    };

    const sizeStyles = {
      sm: "h-8 px-3 rounded text-[11px]",
      md: "h-10 px-4 rounded-lg text-xs",
      lg: "h-12 px-6 rounded-lg text-sm",
      icon: "h-10 w-10 rounded-lg p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin h-3.5 w-3.5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Processing</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
