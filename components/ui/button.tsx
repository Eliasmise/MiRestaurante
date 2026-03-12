import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-primary via-primary to-[#123a62] text-primary-foreground shadow-soft hover:shadow-luxe hover:brightness-[1.03]",
        secondary:
          "bg-gradient-to-br from-secondary/95 to-[#d3a66a] text-secondary-foreground shadow-soft hover:brightness-[1.02]",
        outline:
          "border border-input bg-white/90 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] hover:border-[#af986f] hover:bg-[#fcf8ef]",
        ghost: "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:brightness-95"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
