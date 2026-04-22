import { cn } from '../utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-accent animate-pulse rounded-md', className)}
      {...props} data-oid="cc30a25e2e" />);


}

export { Skeleton };