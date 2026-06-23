import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:     'bg-primary/20 text-primary border border-primary/30',
        secondary:   'bg-secondary text-secondary-foreground border border-border',
        destructive: 'bg-destructive/20 text-red-400 border border-destructive/30',
        outline:     'border border-border text-muted-foreground',
        success:     'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
        warning:     'bg-amber-500/15 text-amber-400 border border-amber-500/25',
        violet:      'bg-violet-500/15 text-violet-300 border border-violet-500/25',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
