"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Trophy, User, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  useEffect(() => {
    const fetchTotalUnreads = async () => {
      if (!user?.id) return;

      try {
        const userId = user.id || user.uid;

        // Check if user is admin
        const userDoc = await getDoc(doc(db, "users", userId));
        const userData = userDoc.data();
        const isAdmin = userData?.role === 'admin' || userData?.adminRole || user.email === 'admin@raidarena.com';

        let tournamentIds = [];

        if (isAdmin) {
          const allTournamentsSnapshot = await getDocs(collection(db, "tournaments"));
          tournamentIds = allTournamentsSnapshot.docs
            .filter(doc => doc.data().status !== "completed")
            .map(doc => doc.id);
        } else {
          const participantsQuery = query(
            collection(db, "tournament_participants"),
            where("userId", "==", userId)
          );
          const participantsSnapshot = await getDocs(participantsQuery);
          const participantTournamentIds = [...new Set(
            participantsSnapshot.docs.map(doc => doc.data().tournamentId)
          )];

          // Filter out completed tournaments
          const tournamentsData = await Promise.all(
            participantTournamentIds.map(async (tid) => {
              const tDoc = await getDoc(doc(db, "tournaments", tid));
              return tDoc.exists() && tDoc.data().status !== "completed" ? tid : null;
            })
          );
          tournamentIds = tournamentsData.filter(t => t !== null);
        }

        // Count total unread messages across all tournaments
        let totalUnread = 0;
        for (const tournamentId of tournamentIds) {
          const lastRead = localStorage.getItem(`chat_last_read_${tournamentId}_${userId}`);
          const lastReadTimestamp = lastRead ? parseInt(lastRead) : 0;

          const messagesQuery = query(
            collection(db, "tournament_chats"),
            where("tournamentId", "==", tournamentId),
            where("createdAt", ">", new Date(lastReadTimestamp))
          );
          const messagesSnapshot = await getDocs(messagesQuery);
          totalUnread += messagesSnapshot.docs.filter(doc => doc.data().senderId !== userId).length;
        }

        setTotalUnreadCount(totalUnread);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchTotalUnreads();

    // Listen for storage changes to update count
    const handleStorageChange = () => {
      fetchTotalUnreads();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  const tabs = [
    { name: "Home", href: "/", icon: Home },
    { name: "Chat", href: "/chat", icon: MessageCircle, badge: totalUnreadCount },
    { name: "Tournaments", href: "/tournament", icon: Trophy },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-black/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg z-50 flex justify-around py-3 md:hidden">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className="flex flex-col items-center transition-all duration-300"
          >
            <div
              className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                isActive ? "bg-orange-500 scale-110" : "bg-gray-700/50"
              }`}
            >
              <Icon
                size={20}
                className={`transition-colors duration-300 ${
                  isActive ? "text-white" : "text-gray-300"
                }`}
              />
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-400 text-black text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold px-1">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </div>
            <span
              className={`mt-1 text-xs font-medium transition-colors duration-300 ${
                isActive ? "text-orange-500" : "text-gray-300"
              }`}
            >
              {tab.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
