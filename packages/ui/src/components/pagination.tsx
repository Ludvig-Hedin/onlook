import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react';

import type { Button } from './button';
import { cn } from '../utils';
import { buttonVariants } from './button';

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
    return (
        <nav
            role="navigation"
            aria-label="pagination"
            data-slot="pagination"
            className={cn('mx-auto flex w-full justify-center', className)}
            {...props}
            data-oid="57184c905a"
        />
    );
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
    return (
        <ul
            data-slot="pagination-content"
            className={cn('flex flex-row items-center gap-1', className)}
            {...props}
            data-oid="fc16c3d5c8"
        />
    );
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
    return <li data-slot="pagination-item" {...props} data-oid="1281cc64b7" />;
}

type PaginationLinkProps = {
    isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
    React.ComponentProps<'a'>;

function PaginationLink({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) {
    return (
        <a
            aria-current={isActive ? 'page' : undefined}
            data-slot="pagination-link"
            data-active={isActive}
            className={cn(
                buttonVariants({
                    variant: isActive ? 'outline' : 'ghost',
                    size,
                }),
                className,
            )}
            {...props}
            data-oid="06a5f87c97"
        />
    );
}

function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
    return (
        <PaginationLink
            aria-label="Go to previous page"
            size="default"
            className={cn('gap-1 px-2.5 sm:pl-2.5', className)}
            {...props}
            data-oid="322a8dfd74"
        >
            <ChevronLeftIcon data-oid="802f572f0c" />
            <span className="hidden sm:block" data-oid="32e1c8b92c">
                Previous
            </span>
        </PaginationLink>
    );
}

function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
    return (
        <PaginationLink
            aria-label="Go to next page"
            size="default"
            className={cn('gap-1 px-2.5 sm:pr-2.5', className)}
            {...props}
            data-oid="f5e66e567c"
        >
            <span className="hidden sm:block" data-oid="0fce6a55fc">
                Next
            </span>
            <ChevronRightIcon data-oid="2d3ab8b3aa" />
        </PaginationLink>
    );
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
    return (
        <span
            aria-hidden
            data-slot="pagination-ellipsis"
            className={cn('flex size-9 items-center justify-center', className)}
            {...props}
            data-oid="60a560b206"
        >
            <MoreHorizontalIcon className="size-4" data-oid="c645744e55" />
            <span className="sr-only" data-oid="1cbe8fbfcc">
                More pages
            </span>
        </span>
    );
}

export {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
};
