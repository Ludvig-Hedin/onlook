import { api } from '@/trpc/server';
import { Main } from './_components/main';
import { ProjectLoadError } from './_components/project-load-error';
import { ProjectProviders } from './providers';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const projectId = (await params).id;
    if (!projectId) {
        return <ProjectLoadError variant="invalid-id" />;
    }

    try {
        const [project, branches] = await Promise.all([
            api.project.get({ projectId }),
            api.branch.getByProjectId({ projectId }),
        ]);

        if (!project) {
            return <ProjectLoadError variant="not-found" />;
        }

        return (
            <ProjectProviders project={project} branches={branches}>
                <Main />
            </ProjectProviders>
        );
    } catch (error) {
        console.error('Failed to load project data:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        const lower = message.toLowerCase();
        const variant: 'unauthorized' | 'not-found' | 'unknown' =
            lower.includes('unauth') || lower.includes('forbidden') || lower.includes('session')
                ? 'unauthorized'
                : lower.includes('not found') || lower.includes('not_found')
                  ? 'not-found'
                  : 'unknown';
        return <ProjectLoadError variant={variant} message={message} />;
    }
}
