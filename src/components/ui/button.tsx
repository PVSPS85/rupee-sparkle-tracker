import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25 hover:bg-destructive/90 hover:shadow-destructive/40",
        outline:
          "border border-border bg-transparent hover:bg-secondary hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-secondary hover:text-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",
        neon:
          "bg-gradient-to-r from-neon-cyan to-neon-blue text-primary-foreground font-semibold shadow-lg shadow-neon-cyan/30 hover:shadow-neon-cyan/50 hover:-translate-y-0.5 hover:brightness-110",
        neonOutline:
          "border-2 border-neon-cyan bg-transparent text-neon-cyan hover:bg-neon-cyan/10 hover:shadow-lg hover:shadow-neon-cyan/30",
        success:
          "bg-gradient-to-r from-neon-green to-neon-cyan text-primary-foreground font-semibold shadow-lg shadow-neon-green/30 hover:shadow-neon-green/50 hover:-translate-y-0.5",
        danger:
          "bg-gradient-to-r from-neon-orange to-neon-pink text-primary-foreground font-semibold shadow-lg shadow-neon-orange/30 hover:shadow-neon-orange/50 hover:-translate-y-0.5",
        glass:
          "glass-card text-foreground hover:bg-white/5 hover:border-white/15",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
