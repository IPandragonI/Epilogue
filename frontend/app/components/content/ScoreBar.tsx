function ScoreBar({score}: { score: number }) {
    const color = score >= 75 ? "bg-success" : score >= 50 ? "bg-warning" : "bg-error";
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium w-6 text-right">{score}</span>
            <div className="flex-1 h-1.5 bg-base-300 rounded-full overflow-hidden w-16">
                <div className={`h-full rounded-full ${color}`} style={{width: `${score}%`}}/>
            </div>
        </div>
    );
}

export default ScoreBar;