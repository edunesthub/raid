// Fake user database for demo purposes

export const fakeUsers = [];

// Helper function to find user by email
export function findUserByEmail(email) {
    return fakeUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
}

// Helper function to validate credentials
export function validateCredentials(email, password) {
    const user = findUserByEmail(email);
    if (user && user.password === password) {
        return user;
    }
    return null;
}

// Helper function to generate fake JWT tokens (for demo purposes)
export function generateFakeTokens(user) {
    const accessToken = `fake_access_${user.id}_${Date.now()}`;
    const refreshToken = `fake_refresh_${user.id}_${Date.now()}`;

    return {
        accessToken,
        refreshToken,
        expiresIn: 3600 // 1 hour
    };
}