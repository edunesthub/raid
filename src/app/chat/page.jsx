"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import LoadingSpinner from "@/components/LoadingSpinner";
import { MessageCircle, Users, Trophy } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ChatPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserTournaments = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      // Redirect to login if not authenticated
      if (!isAuthenticated || !user) {
        router.push("/auth/login");
        setLoading(false);
        return;
      }

      // Use user.id instead of user.uid (based on AuthContext structure)
      const userId = user.id || user.uid;
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        console.log("Starting tournament fetch for user:", userId);
        setLoading(true);

        // Check if user is admin
        const userDoc = await getDoc(doc(db, "users", userId));
        const userData = userDoc.data();
        const isAdmin = userData?.role === 'admin' || userData?.adminRole || user.email === 'admin@raidarena.com';

        let tournamentIds = [];

        if (isAdmin) {
          // Admin sees all tournaments
          console.log("Admin user detected - fetching all tournaments");
          const allTournamentsSnapshot = await getDocs(collection(db, "tournaments"));
          tournamentIds = allTournamentsSnapshot.docs.map(doc => doc.id);
        } else {
          // Regular users see only tournaments they're part of
          const participantsQuery = query(
            collection(db, "tournament_participants"),
            where("userId", "==", userId)
          );
          const participantsSnapshot = await getDocs(participantsQuery);
          tournamentIds = [...new Set(
            participantsSnapshot.docs.map(doc => doc.data().tournamentId)
          )];
        }

        if (tournamentIds.length === 0) {
          setTournaments([]);
          setLoading(false);
          return;
        }

        // Fetch tournament details for each ID
        const tournamentsData = await Promise.all(
          tournamentIds.map(async (tournamentId) => {
            const tournamentDoc = await getDoc(doc(db, "tournaments", tournamentId));
            if (!tournamentDoc.exists()) return null;

            const tournamentData = tournamentDoc.data();
            
            // Skip completed tournaments for all users
            if (tournamentData.status === "completed") {
              return null;
            }

            // Count participants for this tournament
            const tournamentParticipantsQuery = query(
              collection(db, "tournament_participants"),
              where("tournamentId", "==", tournamentId)
            );
            const tournamentParticipantsSnapshot = await getDocs(tournamentParticipantsQuery);
            const participantCount = tournamentParticipantsSnapshot.docs.length;

            return {
              id: tournamentDoc.id,
              ...tournamentData,
              participantCount,
            };
          })
        );

        // Filter out null entries and sort by most recent
        const validTournaments = tournamentsData.filter(t => t !== null);

        validTournaments.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });

        setTournaments(validTournaments);
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTournaments();
  }, [user, isAuthenticated, authLoading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-black via-orange-900/20 to-black border-b border-orange-500/20 py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-8 h-8 text-orange-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">Tournament Chats</h1>
              <p className="text-gray-400 text-sm">Select a tournament to view chat</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {tournaments.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
            <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Tournament Chats
            </h3>
            <p className="text-gray-400 mb-6">
              Join a tournament to start chatting with other participants
            </p>
            <Link
              href="/tournament"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              <Trophy className="w-5 h-5" />
              <span>Browse Tournaments</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tournaments.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/tournament/${tournament.id}/chat`}
                className="block bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-orange-500/30 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Tournament Image */}
                  <div className="flex-shrink-0">
                    {tournament.tournament_flyer ? (
                      <img
                        src={tournament.tournament_flyer}
                        alt={tournament.tournament_name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                        <Trophy className="w-10 h-10 text-white" />
                      </div>
                    )}
                  </div>
                  {/* Tournament Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors mb-1">
                      {tournament.tournament_name || tournament.title || tournament.name || `Tournament ${tournament.id.slice(0, 8)}`}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{tournament.participantCount} participants</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Trophy className="w-4 h-4" />
                        <span className="capitalize">{tournament.status || "upcoming"}</span>
                      </div>
                    </div>
                  </div>
                  <MessageCircle className="w-6 h-6 text-gray-500 group-hover:text-orange-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
