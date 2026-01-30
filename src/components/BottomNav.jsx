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
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-black/40 backdrop-blur-2xl border border-blue-500/30 shadow-[0_-10px_30px_rgba(0,243,255,0.1)] z-50 flex justify-around py-2 md:hidden" style={{ clipPath: 'polygon(0 15%, 5% 0, 95% 0, 100% 15%, 100% 85%, 95% 100%, 5% 100%, 0 85%)' }}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className="flex flex-col items-center transition-all duration-300 group px-2"
          >
            <div
              className={`relative flex items-center justify-center w-12 h-10 transition-all duration-500 ${isActive ? "text-blue-400" : "text-gray-500 group-hover:text-blue-300"
                }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-blue-500/10 shadow-[inner_0_0_10px_rgba(0,243,255,0.2)]" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0 100%, 0 20%)' }}></div>
              )}
              <Icon
                size={isActive ? 22 : 20}
                className={`z-10 transition-all duration-300 ${isActive ? "shadow-[0_0_10px_#00f3ff]" : ""
                  }`}
              />
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[9px] min-w-[16px] h-[16px] flex items-center justify-center font-black px-1 z-20 shadow-[0_0_8px_#ff00ff]" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </div>
            <span
              className={`mt-0.5 text-[10px] uppercase font-black tracking-tighter transition-colors duration-300 ${isActive ? "text-blue-400" : "text-gray-600"
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
