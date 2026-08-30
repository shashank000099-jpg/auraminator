"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg bg-surface border border-border px-3.5 py-2 text-sm text-white placeholder:text-zinc-600 transition-colors focus:border-white focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500/60 focus:border-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && !error && (
          <p className="text-[11px] font-mono text-zinc-500">{helperText}</p>
        )}
        {error && <p className="text-[11px] font-mono text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
