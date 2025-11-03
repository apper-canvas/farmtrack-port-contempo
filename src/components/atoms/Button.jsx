import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Button = forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  children, 
  ...props 
}, ref) => {
  const variants = {
    default: "bg-gradient-to-r from-primary to-primary/90 text-white hover:from-primary/90 hover:to-primary/80 focus:ring-primary/20",
    secondary: "bg-gradient-to-r from-secondary to-secondary/90 text-white hover:from-secondary/90 hover:to-secondary/80 focus:ring-secondary/20",
    accent: "bg-gradient-to-r from-accent to-accent/90 text-white hover:from-accent/90 hover:to-accent/80 focus:ring-accent/20",
    outline: "border-2 border-primary text-primary bg-white hover:bg-primary hover:text-white focus:ring-primary/20",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-200",
    destructive: "bg-gradient-to-r from-error to-error/90 text-white hover:from-error/90 hover:to-error/80 focus:ring-error/20"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs font-medium",
    default: "h-10 px-4 py-2 text-sm font-medium",
    lg: "h-12 px-6 py-3 text-base font-medium",
    icon: "h-10 w-10 p-0"
  };

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transform hover:scale-[1.02] active:scale-[0.98]",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;