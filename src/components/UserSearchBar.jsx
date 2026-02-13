'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, User, X, Loader } from 'lucide-react';
import { collection, query, getDocs, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import UserAvatar from '@/components/UserAvatar';

const UserSearchBar = ({ onUserClick, resultIcon: ResultIcon, containerClassName = "" }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      setShowResults(true);

      try {
        const usersRef = collection(db, 'users');
        const searchLower = searchQuery.toLowerCase();

        // Execute parallel queries to increase completeness
        const [exactEmailSnap, exactUsernameSnap, generalSnap] = await Promise.all([
          getDocs(query(usersRef, where('email', '==', searchLower), limit(5))),
          getDocs(query(usersRef, where('username', '==', searchQuery), limit(5))),
          getDocs(query(usersRef, limit(1000))) // Large batch for partial matches
        ]);

        const combinedDocs = [
          ...exactEmailSnap.docs,
          ...exactUsernameSnap.docs,
          ...generalSnap.docs
        ];

        // Deduplicate by ID
        const uniqueDocs = [];
        const seenIds = new Set();

        combinedDocs.forEach(doc => {
          if (!seenIds.has(doc.id)) {
            seenIds.add(doc.id);
            uniqueDocs.push(doc);
          }
        });

        const results = uniqueDocs.map(doc => ({ id: doc.id, ...doc.data() })).filter(user => {
          const username = (user.username || '').toLowerCase();
          const email = (user.email || '').toLowerCase();
          const firstName = (user.firstName || '').toLowerCase();
          const lastName = (user.lastName || '').toLowerCase();

          return (
            username.includes(searchLower) ||
            email.includes(searchLower) ||
            firstName.includes(searchLower) ||
            lastName.includes(searchLower)
          );
        });

        setSearchResults(results.slice(0, 10)); // Limit to 10 results for UI
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleUserClick = (user) => {
    if (onUserClick) {
      onUserClick(user);
      setShowResults(false);
    } else {
      window.location.href = `/users/${user.id}`;
    }
  };

  return (
    <div className={`relative w-full max-w-2xl mx-auto mb-8 ${containerClassName}`} ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Search className="w-5 h-5 text-gray-400" />
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery && setShowResults(true)}
          placeholder="Search users by username or full name..."
          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-12 pr-12 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
        />

        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {isSearching && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2">
            <Loader className="w-5 h-5 text-orange-500 animate-spin" />
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50">
          {isSearching ? (
            <div className="p-8 text-center text-gray-500">
              <Loader className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Searching users...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-2 divide-y divide-gray-700/50">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 transition-colors text-left group"
                >
                  <UserAvatar
                    user={user}
                    size="md"
                    className="flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate group-hover:text-orange-500 transition-colors">
                      {user.username || 'Unknown User'}
                    </p>
                    <p className="text-gray-400 text-sm truncate uppercase text-[10px] font-black tracking-widest opacity-60">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>

                  <div className="flex-shrink-0 text-gray-400 group-hover:text-orange-500 transition-colors">
                    {ResultIcon ? (
                      <ResultIcon user={user} />
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="p-8 text-center">
              <User className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-bold uppercase text-xs mb-1">No users found</p>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                Try searching with a different username or email
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default UserSearchBar;