'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function NotificationBadge() {
  const { user, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setUnreadCount(0);
      return;
    }

    // Real-time listener for unread notifications
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.id),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        setUnreadCount(snapshot.size);
      },
      (error) => {
        console.error('Error listening to notifications:', error);
      }
    );

    return () => unsubscribe();
  }, [user, isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Link
      href="/notifications"
      className="relative p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
      aria-label="Notifications"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-gray-900">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
}