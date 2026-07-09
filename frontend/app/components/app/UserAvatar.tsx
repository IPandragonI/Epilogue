"use client";

import { useState } from "react";

interface UserAvatarProps {
    avatarUrl?: string | null;
    firstname?: string;
    lastname?: string;
    size?: number;
    className?: string;
}

export default function UserAvatar({
    avatarUrl,
    firstname = "",
    lastname = "",
    size = 32,
    className = "",
}: UserAvatarProps) {
    const [imgError, setImgError] = useState(false);

    const initials =
        `${firstname?.[0] ?? ""}${lastname?.[0] ?? ""}`.toUpperCase() || "?";

    const style = { width: size, height: size, minWidth: size, fontSize: size * 0.38 };

    if (avatarUrl && !imgError) {
        return (
            <img
                src={avatarUrl}
                alt={`${firstname} ${lastname}`}
                onError={() => setImgError(true)}
                style={style}
                className={`rounded-full object-cover ${className}`}
            />
        );
    }

    return (
        <div
            style={style}
            className={`rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center select-none shrink-0 ${className}`}
        >
            {initials}
        </div>
    );
}
