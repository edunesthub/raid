import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArrowLeft, Trophy, Award, Calendar, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

const UserProfilePage = () => {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id;

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    tournamentsPlayed: 0,
    tournamentsWon: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user profile
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        setError('User not found');
        return;
      }

      const userData = { id: userDoc.id, ...userDoc.data() };
      setUser(userData);

      // Fetch user stats
      const statsDoc = await getDoc(doc(db, 'userStats', userId));
      if (statsDoc.exists()) {
        setStats(statsDoc.data());
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {error || 'User not found'}
          </h2>
          <p className="text-gray-400 mb-6">
            The user you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/" className="btn-raid inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        {/* Profile Header */}
        <div className="card-raid p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-500 flex-shrink-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-black to-orange-500 flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">
                    {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">
                {user.username || 'Unknown User'}
              </h1>
              
              {(user.firstName || user.lastName) && (
                <p className="text-xl text-gray-300 mb-4">
                  {user.firstName} {user.lastName}
                </p>
              )}

              {user.bio && (
                <p className="text-gray-400 mb-4 max-w-2xl">
                  {user.bio}
                </p>
              )}

              {/* Contact Info */}
              <div className="flex flex-col sm:flex-row gap-4 text-sm">
                {user.email && (
                  <div className="flex items-center justify-center md:justify-start text-gray-400">
                    <Mail className="w-4 h-4 mr-2" />
                    {user.email}
                  </div>
                )}
                {user.contact && (
                  <div className="flex items-center justify-center md:justify-start text-gray-400">
                    <Phone className="w-4 h-4 mr-2" />
                    {user.contact}
                  </div>
                )}
              </div>

              {user.createdAt && (
                <div className="flex items-center justify-center md:justify-start text-gray-500 text-sm mt-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  Joined {new Date(user.createdAt.toDate?.() || user.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card-raid p-6 text-center">
            <Trophy className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white mb-1">
              {stats.tournamentsPlayed || 0}
            </p>
            <p className="text-gray-400 text-sm">Tournaments Played</p>
          </div>

          <div className="card-raid p-6 text-center">
            <Award className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white mb-1">
              {stats.tournamentsWon || 0}
            </p>
            <p className="text-gray-400 text-sm">Tournaments Won</p>
          </div>

          <div className="card-raid p-6 text-center">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-3xl font-bold text-white mb-1">
              ₵{(stats.totalEarnings || 0).toLocaleString()}
            </p>
            <p className="text-gray-400 text-sm">Total Earnings</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="card-raid p-6">
          <h2 className="text-xl font-bold text-white mb-4">About</h2>
          {user.bio ? (
            <p className="text-gray-300">{user.bio}</p>
          ) : (
            <p className="text-gray-500 italic">This user hasn't added a bio yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;