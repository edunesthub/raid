"use client";

import { useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/app/contexts/AuthContext';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';

export function useFriendRequests() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'friend_requests'),
      where('receiverId', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          // Avoid showing notification for existing requests on first load
          const isRecent = (new Date() - data.createdAt?.toDate()) < 5000;
          
          if (isRecent) {
            toast.custom((t) => (
              <div
                className={`${
                  t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full bg-[#0f0f10] border border-orange-500/30 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 relative overflow-hidden`}
              >
                {/* Glossy Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-orange-500/10 via-transparent to-white/5 opacity-50"></div>
                
                <div className="flex-1 w-0 p-4 relative z-10">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <div className="h-10 w-10 bg-orange-500/10 rounded-xl border border-orange-500/20 flex items-center justify-center text-orange-500">
                        <UserPlus size={20} />
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-black text-white uppercase tracking-widest italic">
                        Friend Request
                      </p>
                      <p className="mt-1 text-xs text-gray-400 font-medium">
                        Someone wants to challenge you. Check your requests!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-white/5 relative z-10">
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-xs font-black uppercase tracking-tighter text-orange-500 hover:text-orange-400 focus:outline-none transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            ), {
              duration: 5000,
              position: 'top-right'
            });
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user]);
}
