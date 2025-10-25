'use client';

import { useState } from 'react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'New Tournament',
      message: 'A new tournament has been created in your region!',
      date: '2024-03-20',
      read: false
    },
    {
      id: '2',
      title: 'Deposit Successful',
      message: 'Your deposit has been successfully processed.',
      date: '2024-03-19',
      read: false
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700"
          >
            Mark all as read
          </button>
        </div>

        <div className="space-y-4">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg ${notification.read ? 'bg-gray-800' : 'bg-gray-800 border-l-4 border-orange-500'}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white">{notification.title}</h3>
                  <p className="mt-1 text-gray-300">{notification.message}</p>
                  <p className="mt-2 text-sm text-gray-400">{notification.date}</p>
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
      </div>
    </div>
  );
}