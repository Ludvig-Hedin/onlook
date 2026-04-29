interface HighlightProps {
    text: string;
    start: number;
    end: number;
}

export const Highlight = ({ text, start, end }: HighlightProps) => {
    if (start < 0 || end <= start) {
        return <span>{text}</span>;
    }
    return (
        <>
            <span>{text.slice(0, start)}</span>
            <span className="text-foreground-primary font-bold">{text.slice(start, end)}</span>
            <span>{text.slice(end)}</span>
        </>
    );
};
