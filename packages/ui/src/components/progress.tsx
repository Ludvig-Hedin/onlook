import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '../utils';

function Progress({
    className,
    value,
    ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
    return (
        <ProgressPrimitive.Root
            data-slot="progress"
            className={cn(
                'bg-primary/20 relative h-2 w-full overflow-hidden rounded-full',
                className,
            )}
            {...props}
            data-oid="cbf23929f5"
        >
            <ProgressPrimitive.Indicator
                data-slot="progress-indicator"
                className="bg-primary h-full w-full flex-1 transition-all"
                style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
                data-oid="d71d3f53d4"
            />
        </ProgressPrimitive.Root>
    );
}

export { Progress };
