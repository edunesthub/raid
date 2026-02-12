export const GENERIC_AVATARS = [
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Felix",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Aneka",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Midnight",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Shadow",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Destiny",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Spark",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Blade",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Nova"
];

export const getDefaultAvatar = (userId) => {
    if (!userId) return GENERIC_AVATARS[0];
    // Simple hash to get a consistent index from the userId
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % GENERIC_AVATARS.length);
    return GENERIC_AVATARS[index];
};
