import React from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "danger" | "outlined";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Button({
  children,
  variant = "primary",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  // Base classes for consistent premium feel
  const baseClasses =
    "inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 outline-none focus:ring-2 focus:ring-offset-2";

  // Variant mappings using the project's official theme tokens
  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      "bg-primary hover:bg-primary-dark text-slate-950 hover:shadow-lg hover:shadow-primary/15 focus:ring-primary/40",
    secondary:
      "bg-secondary hover:opacity-90 text-slate-950 hover:shadow-lg hover:shadow-secondary/15 focus:ring-secondary/40",
    danger:
      "bg-rose-500 hover:bg-rose-600 text-white hover:shadow-lg hover:shadow-rose-500/15 focus:ring-rose-500/40",
    outlined:
      "border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-750 focus:ring-slate-205",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      
      <span>{children}</span>
      
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
