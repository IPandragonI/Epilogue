"use client";

export default function SeoScoreGauge({score}: { score: number }) {
    const radius = 54;
    const stroke = 10;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const progress = circumference - (score / 100) * circumference;

    const color =
        score >= 75 ? "#7C3AED" : score >= 50 ? "#D97706" : "#DC2626";

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative w-32 h-32">
                <svg width="128" height="128" viewBox="0 0 128 128">
                    <circle
                        cx="64"
                        cy="64"
                        r={normalizedRadius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={stroke}
                        className="text-base-300"
                    />
                    <circle
                        cx="64"
                        cy="64"
                        r={normalizedRadius}
                        fill="none"
                        stroke={color}
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={progress}
                        transform="rotate(-90 64 64)"
                        style={{transition: "stroke-dashoffset 0.6s ease"}}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold" style={{color}}>
                    {score}
                  </span>
                </div>
            </div>
        </div>
    );
}