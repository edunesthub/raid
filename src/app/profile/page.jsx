"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext.jsx";
import { formatCurrency } from "@/utils/formatters.js";

// Mock Data
const mockUserProfile = {
    id: "1",
    username: "raid_admin",
    email: "admin@raid.com",
    avatarUrl: "/images/avatar.jpg",
    bio: "Passionate mobile gamer from Ghana. Love competitive esports and always looking for the next challenge!",
    location: "Ghana",
    joinedDate: "January 2024",
    favoriteGames: ["PUBG Mobile", "Call of Duty Mobile"],
    clanAffiliation: "Ghana Warriors",
    phone: "+233 24 123 4567",
    stats: {
        totalTournaments: 12,
        tournamentsWon: 3,
        upcomingTournaments: 2,
    },
    socialLinks: {
        instagram: "@john_gamer_gh",
    },
};

const fakeMatches = [
    {
        id: "1",
        name: "CODM Battle Royale",
        game: "Call of Duty Mobile",
        date: "2024-09-15",
        status: "upcoming",
        placement: "N/A",
        earnings: 0,
    },
    {
        id: "2",
        name: "PUBG Mobile Squad",
        game: "PUBG Mobile",
        date: "2024-09-20",
        status: "upcoming",
        placement: "N/A",
        earnings: 0,
    },
    {
        id: "3",
        name: "FIFA Mobile Cup",
        game: "FIFA Mobile",
        date: "2024-09-10",
        status: "completed",
        placement: "1st Place",
        earnings: 3000,
    },
];

export default function ProfilePage() {
    const { user, isAuthenticated } = useAuth();
    const [profile, setProfile] = useState(null);
    const [matches, setMatches] = useState([]);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editedBio, setEditedBio] = useState("");
    const [editedUsername, setEditedUsername] = useState("");
    const [editedEmail, setEditedEmail] = useState("");
    const [editedPhone, setEditedPhone] = useState("");
    const [editedClanAffiliation, setEditedClanAffiliation] = useState("");
    const [editedSocialLinks, setEditedSocialLinks] = useState({});

    useEffect(() => {
        setProfile(mockUserProfile);
        setMatches(fakeMatches);
        setEditedUsername(mockUserProfile.username);
        setEditedEmail(mockUserProfile.email);
        setEditedPhone(mockUserProfile.phone);
        setEditedBio(mockUserProfile.bio);
        setEditedClanAffiliation(mockUserProfile.clanAffiliation);
        setEditedSocialLinks(mockUserProfile.socialLinks);
    }, []);

    const handleAvatarChange = (e) => {
        if (e.target.files?.[0]) {
            const newAvatarUrl = URL.createObjectURL(e.target.files[0]);
            setProfile((prev) => (prev ? { ...prev, avatarUrl: newAvatarUrl } : prev));
        }
    };

    const handleSocialLinkChange = (platform, value) => {
        setEditedSocialLinks((prev) => ({ ...prev, [platform]: value }));
    };

    const handleSaveProfile = () => {
        if (!profile) return;
        setProfile({
            ...profile,
            username: editedUsername,
            email: editedEmail,
            phone: editedPhone,
            bio: editedBio,
            clanAffiliation: editedClanAffiliation,
            socialLinks: editedSocialLinks,
        });
        setIsEditingProfile(false);
    };

    const handleSaveBio = () => {
        if (profile) {
            setProfile({ ...profile, bio: editedBio });
            setIsEditingProfile(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="container-mobile min-h-screen flex items-center justify-center py-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
                    <p className="text-gray-400 mb-6">Please log in to view your profile.</p>
                    <Link href="/auth/login" className="btn-raid-primary">
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    if (!profile) return <p className="text-white">Loading profile...</p>;

    const upcomingMatches = matches.filter((m) => m.status === "upcoming");
    const recentMatches = matches.filter((m) => m.status === "completed");

    return (
        <div className="container-mobile min-h-screen py-6 text-white">
            <div className="max-w-3xl mx-auto">
                {/* Avatar */}
                <div className="flex flex-col items-center mb-6">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden mb-3 border-4 border-orange-500">
                        <Image src={profile.avatarUrl} alt="Profile Avatar" fill className="object-cover" />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                    <h1 className="text-3xl font-bold">{profile.username}</h1>
                    <p className="text-gray-400 text-sm">{profile.location} • Joined {profile.joinedDate}</p>
                    <p className="italic text-center mt-2">"{profile.bio}"</p>
                    <button
                        onClick={() => setIsEditingProfile(true)}
                        className="btn-raid-primary mt-4"
                    >
                        Edit Profile
                    </button>
                </div>

                {isEditingProfile && (
                    <div className="card-raid p-4 mb-8">
                        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
                        <div className="mb-4">
                            <label htmlFor="editUsername" className="block text-gray-400 text-sm mb-2">Username</label>
                            <input
                                type="text"
                                id="editUsername"
                                className="input-raid"
                                value={editedUsername}
                                onChange={(e) => setEditedUsername(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="editEmail" className="block text-gray-400 text-sm mb-2">Email</label>
                            <input
                                type="email"
                                id="editEmail"
                                className="input-raid"
                                value={editedEmail}
                                onChange={(e) => setEditedEmail(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="editPhone" className="block text-gray-400 text-sm mb-2">Phone</label>
                            <input
                                type="text"
                                id="editPhone"
                                className="input-raid"
                                value={editedPhone}
                                onChange={(e) => setEditedPhone(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="editBio" className="block text-gray-400 text-sm mb-2">Bio</label>
                            <textarea
                                id="editBio"
                                className="input-raid"
                                value={editedBio}
                                onChange={(e) => setEditedBio(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="editClanAffiliation" className="block text-gray-400 text-sm mb-2">Clan Affiliation</label>
                            <input
                                type="text"
                                id="editClanAffiliation"
                                className="input-raid"
                                value={editedClanAffiliation}
                                onChange={(e) => setEditedClanAffiliation(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="editInstagram" className="block text-gray-400 text-sm mb-2">Instagram</label>
                            <input
                                type="text"
                                id="editInstagram"
                                className="input-raid"
                                value={editedSocialLinks.instagram || ''}
                                onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setIsEditingProfile(false)}
                                className="btn-raid-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                className="btn-raid-primary"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 mb-8">
                    <div className="card-raid p-4 text-center">
                        <p className="text-2xl font-bold text-orange-400">{profile.stats.totalTournaments}</p>
                        <p className="text-gray-400 text-sm">Tournaments Played</p>
                    </div>
                </div>

                {/* Matches */}
                <h2 className="text-xl font-bold mb-2">Upcoming Matches</h2>
                {upcomingMatches.map((m) => (
                    <div key={m.id} className="card-raid p-4 mb-2">
                        <p className="font-semibold">{m.name}</p>
                        <p className="text-gray-400 text-sm">{new Date(m.date).toDateString()}</p>
                        <p className="text-orange-400">{m.game}</p>
                    </div>
                ))}

                <h2 className="text-xl font-bold mt-6 mb-2">Recent Matches</h2>
                {recentMatches.map((m) => (
                    <div key={m.id} className="card-raid p-4 mb-2">
                        <p className="font-semibold">{m.name}</p>
                        <p className="text-gray-400 text-sm">{new Date(m.date).toDateString()}</p>
                        <p className="text-orange-400">{m.game}</p>
                        <p className="text-green-400">{m.placement}</p>
                        <p className="text-gray-300">{m.earnings > 0 && `Earnings: ${formatCurrency(m.earnings)}`}</p>
                    </div>
                ))}

                {/* Settings & Actions */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                        <span className="mr-2"></span>
                        Settings & Actions
                    </h2>
                    <div className="card-raid p-4 space-y-2">
                        <Link
                            href="/profile/change-password"
                            className="flex justify-between items-center text-white hover:text-orange-500 transition-colors"
                        >
                            <div>
                                <h3 className="font-semibold">Change Password</h3>
                                <p className="text-gray-400 text-sm">Update your account security</p>
                            </div>
                            <span>→</span>
                        </Link>
                        <Link
                            href="/profile/notifications"
                            className="flex justify-between items-center text-white hover:text-orange-500 transition-colors"
                        >
                            <div>
                                <h3 className="font-semibold">Notification Preferences</h3>
                                <p className="text-gray-400 text-sm">Manage your notification settings</p>
                            </div>
                            <span>→</span>
                        </Link>
                        <Link
                            href="/profile/privacy"
                            className="flex justify-between items-center text-white hover:text-orange-500 transition-colors"
                        >
                            <div>
                                <h3 className="font-semibold">Privacy Settings</h3>
                                <p className="text-gray-400 text-sm">Control your profile visibility</p>
                            </div>
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}