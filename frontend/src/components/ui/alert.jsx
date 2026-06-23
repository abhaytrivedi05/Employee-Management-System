import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const alertVariants = cva(
  'relative w-full rounded-xl border p-4 text-sm',
  {
    variants: {
      variant: {
        default:     'bg-secondary border-border text-foreground',
        destructive: 'bg-red-500/10 border-red-500/30 text-red-400',
        success:     'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        warning:     'bg-amber-500/10 border-amber-500/30 text-amber-400',
        info:        'bg-violet-500/10 border-violet-500/30 text-violet-300',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5 ref={ref} className={cn('mb-1 font-semibold leading-none tracking-tight', className)} {...props} />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-sm opacity-90', className)} {...props} />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
