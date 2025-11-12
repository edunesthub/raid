'use client';

import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase'; // adjust path if different
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext'; // assumes you have AuthContext providing currentUser

export default function NotificationsPage() {
  const { user } = useAuth(); // get the logged-in user
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!user?.uid) return; // ✅ wait until user.uid is ready

  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', user.uid),
    orderBy('timestamp', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setNotifications(data);
    setLoading(false);
  });

  return () => unsubscribe();
}, [user]);


  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications.map((notif) =>
          updateDoc(doc(db, 'notifications', notif.id), { read: true })
        )
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 flex items-center justify-center text-gray-400">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          {notifications.some((n) => !n.read) && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700"
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="text-gray-400 text-center">No notifications yet.</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg transition ${
                  notification.read
                    ? 'bg-gray-800'
                    : 'bg-gray-800 border-l-4 border-orange-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">{notification.title}</h3>
                    <p className="mt-1 text-gray-300">{notification.message}</p>
                    <p className="mt-2 text-sm text-gray-400">
                      {new Date(notification.timestamp?.toDate?.() || notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="px-3 py-1 text-sm text-gray-300 hover:text-white"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
