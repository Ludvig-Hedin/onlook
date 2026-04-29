import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';

import { useCreateManager } from '@/components/store/create';

export const CreateError = observer(() => {
    const createManager = useCreateManager();
    const error = createManager.error;

    return (
        <motion.div
            className="mt-2 flex max-w-xl items-center gap-3 rounded-xl border border-red-500 bg-red-900/80 p-2 px-4 text-sm text-red-500"
            initial={{ opacity: 0, filter: 'blur(4px)' }}
            animate={
                error ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(4px)' }
            }
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            style={{
                willChange: 'opacity, filter',
                transform: 'translateZ(0)',
                display: error ? 'flex' : 'none',
            }}
        >
            <span className="flex-1 text-center">{error}</span>
            <button
                type="button"
                onClick={() => {
                    createManager.error = null;
                }}
                className="cursor-pointer rounded-md border border-red-500/60 px-2 py-1 text-xs font-medium tracking-wide text-red-200 uppercase transition-colors hover:bg-red-500/20"
            >
                Try again
            </button>
        </motion.div>
    );
});
