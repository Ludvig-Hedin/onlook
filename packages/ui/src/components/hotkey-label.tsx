import { cn } from '../utils';
import { Kbd } from './kbd';

export type Hotkey = {
    command: string;
    description: string;
    readableCommand: string;
};

export function HotkeyLabel({ hotkey, className }: { hotkey: Hotkey; className?: string }) {
    return (
        <span className={cn('flex items-center space-x-2', className)} data-oid="0e5ee86f8e">
            <span data-oid="c6d8b2d142">{hotkey.description}</span>

            <Kbd data-oid="24f345307a">
                <span
                    className="inline-grid auto-cols-max grid-flow-col items-center gap-1.5 text-xs [&_kbd]:text-[1.1em]"
                    dangerouslySetInnerHTML={{ __html: hotkey.readableCommand }}
                    data-oid="fe28e57267"
                />
            </Kbd>
        </span>
    );
}
