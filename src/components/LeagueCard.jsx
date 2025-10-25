'use client';

import { useState } from 'react';
import { leagueApiClient } from '@/lib/apiClient';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

const gameImageMap = {
  'codm': '/assets/cod.jpg',
  'pubgm': '/assets/pubg-mobile.jpg',
  'freefire': '/assets/freefire.jpg',
  'fifa-mobile': '/assets/fifa.jpg',
  '8ball': '/assets/8ball.jpg',
  'chess': '/assets/chess.jpg',
  'ludo': '/assets/2kmbile.jpg', // Placeholder, assuming 2kmbile.jpg is generic
  'Dream league': '/assets/dream.jpg',
  'Efootball': '/assets/efootball.jpg',
};

const LeagueCard = ({ league }) => {
  const { user } = useAuth();
  const [isJoining, setIsJoining] = useState(false);
  const [joinStatus, setJoinStatus] = useState('idle');

  const handleJoinLeague = async () => {
    if (!user) {
      alert('Please log in to join a league.');
      return;
    }

    setIsJoining(true);
    setJoinStatus('idle');
    try {
      const success = await leagueApiClient.joinLeague(league.id, user.id);
      if (success) {
        setJoinStatus('success');
        // Optionally, refresh league data or update UI to reflect joined status
      } else {
        setJoinStatus('error');
      }
    } catch (error) {
      console.error('Failed to join league:', error);
      setJoinStatus('error');
    } finally {
      setIsJoining(false);
    }
  };

  const isJoined = league.participants.includes(user?.id || '');
  const isFull = league.participants.length >= league.maxParticipants;
  const gameImageUrl = gameImageMap[league.gameId] || '/assets/raid1.png'; // Default image

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-4 flex flex-col">
      <div className="relative w-full h-40 mb-4 rounded-md overflow-hidden">
        <Image
          src={gameImageUrl}
          alt={league.gameName}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 hover:scale-105"
        />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{league.name}</h3>
      <p className="text-gray-400 text-sm mb-2 flex-grow">{league.description}</p>
      <div className="text-gray-300 text-sm mb-1">
        <span className="font-semibold">Game:</span> {league.gameName}
      </div>
      <div className="text-gray-300 text-sm mb-1">
        <span className="font-semibold">Dates:</span> {league.startDate} - {league.endDate}
      </div>
      <div className="text-gray-300 text-sm mb-1">
        <span className="font-semibold">Status:</span> {league.status}
      </div>
      <div className="text-gray-300 text-sm mb-1">
        <span className="font-semibold">Participants:</span> {league.participants.length}/{league.maxParticipants}
      </div>
      <div className="text-gray-300 text-sm mb-4">
        <span className="font-semibold">Entry Fee:</span> ${league.entryFee} | <span className="font-semibold">Reward:</span> {league.reward}
      </div>

      {!isJoined && !isFull && league.status === 'active' && user && (
        <button
          onClick={handleJoinLeague}
          disabled={isJoining}
          className={`mt-4 px-4 py-2 rounded-md font-semibold w-full
            ${isJoining ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
            text-white`}
        >
          {isJoining ? 'Joining...' : 'Join League'}
        </button>
      )}
      {isJoined && <p className="text-green-500 mt-4 text-center">You have joined this league!</p>}
      {isFull && !isJoined && <p className="text-red-500 mt-4 text-center">This league is full.</p>}
      {league.status === 'upcoming' && <p className="text-yellow-500 mt-4 text-center">League is upcoming.</p>}
      {league.status === 'completed' && <p className="text-gray-500 mt-4 text-center">League has completed.</p>}
      {joinStatus === 'success' && <p className="text-green-500 mt-2 text-center">Successfully joined!</p>}
      {joinStatus === 'error' && <p className="text-red-500 mt-2 text-center">Failed to join league. Please try again.</p>}
    </div>
  );
};

export default LeagueCard;