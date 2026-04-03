function ContentRenderer({text}: { text: string }) {
    const lines = text.split("\n");

    return (
        <div className="prose prose-sm max-w-none text-base-content leading-relaxed">
            {lines.map((line, i) => {
                if (line.startsWith("## ")) {
                    return (
                        <h2 key={i} className="text-base font-bold mt-6 mb-2 text-base-content">
                            {line.replace("## ", "")}
                        </h2>
                    );
                }
                if (line.startsWith("• ")) {
                    return (
                        <li key={i} className="ml-4 text-sm list-disc">
                            {line.replace("• ", "")}
                        </li>
                    );
                }
                if (line.trim() === "") return <div key={i} className="h-3"/>;
                return <p key={i} className="text-sm">{line}</p>;
            })}
        </div>
    );
}

export default ContentRenderer;