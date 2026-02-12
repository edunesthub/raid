"use client";

import Image from "next/image";
import { getDefaultAvatar } from "@/utils/avatars";

export default function UserAvatar({ user, size = "md", className = "" }) {
    const avatarUrl = user?.avatarUrl;
    const userId = user?.id || user?.userId || user?.uid;
    const username = user?.username || "User";

    const isDiceBear = avatarUrl?.includes('dicebear.com');

    const sizeClasses = {
        xs: "w-8 h-8",
        sm: "w-10 h-10",
        md: "w-12 h-12",
        lg: "w-16 h-16",
        xl: "w-20 h-20",
        "2xl": "w-32 h-32",
        "3xl": "w-40 h-40",
    };

    const currentSizeClass = sizeClasses[size] || sizeClasses.md;

    return (
        <div className={`relative rounded-full overflow-hidden flex-shrink-0 ${currentSizeClass} ${className}`}>
            {avatarUrl ? (
                <Image
                    src={avatarUrl}
                    alt={username}
                    fill
                    unoptimized={isDiceBear}
                    className="object-cover"
                />
            ) : (
                <Image
                    src={getDefaultAvatar(userId)}
                    alt={`${username} default`}
                    fill
                    unoptimized={true}
                    className="object-cover bg-gray-800"
                />
            )}
        </div>
    );
}
