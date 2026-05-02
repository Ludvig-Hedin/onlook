export function SocialProofSection() {
    return (
        <div className="w-full max-w-6xl mx-auto py-16 px-8">
            <div className="text-center">
                <h2 className="text-foreground-primary text-2xl font-light mb-8">Community Stats:</h2>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-8 text-center">
                    <div>
                        <div className="text-2xl font-light text-foreground-primary mb-2">90+</div>
                        <div className="text-foreground-secondary text-regular">contributors</div>
                    </div>
                    <div>
                        <div className="text-2xl font-light text-foreground-primary mb-2">Open source</div>
                        <div className="text-foreground-secondary text-regular">&amp; transparent</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
