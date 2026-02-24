'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import { Check, X, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function ResultsVerification({ hostId }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, verified, rejected, all
  const [selectedResult, setSelectedResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadResults();
  }, [filter]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const resultsRef = collection(db, 'match_results');

      let q;
      if (hostId) {
        if (filter === 'all') {
          q = query(
            resultsRef,
            where('hostId', '==', hostId),
            orderBy('submittedAt', 'desc')
          );
        } else {
          q = query(
            resultsRef,
            where('hostId', '==', hostId),
            where('status', '==', filter),
            orderBy('submittedAt', 'desc')
          );
        }
      } else {
        if (filter === 'all') {
          q = query(resultsRef, orderBy('submittedAt', 'desc'));
        } else {
          q = query(
            resultsRef,
            where('status', '==', filter),
            orderBy('submittedAt', 'desc')
          );
        }
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setResults(data);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (resultId, status, rejectionReason = null) => {
    setActionLoading(true);
    try {
      const resultRef = doc(db, 'match_results', resultId);
      await updateDoc(resultRef, {
        status,
        verifiedAt: serverTimestamp(),
        verifiedBy: 'admin', // Replace with actual admin ID
        rejectionReason,
      });

      toast.success(`Result ${status === 'verified' ? 'verified' : 'rejected'} successfully!`);
      setShowModal(false);
      setSelectedResult(null);
      loadResults();
    } catch (error) {
      console.error('Error updating result:', error);
      toast.error('Failed to update result');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Clock, label: 'Pending' },
      verified: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle, label: 'Verified' },
      rejected: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle, label: 'Rejected' },
    };

    const config = configs[status] || configs.pending;
    const Icon = config.icon;

    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#050505]">
      {/* Header & Stats - Compact */}
      <div className="p-4 md:p-6 border-b border-white/5 space-y-4 flex-shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tight truncate">
              Verify Results
            </h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 truncate">
              Host Verification Portal
            </p>
          </div>
          <div className="bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl flex-shrink-0">
            <span className="text-xs font-black text-orange-500 italic uppercase">
              {results.length} <span className="text-gray-500 not-italic">Items</span>
            </span>
          </div>
        </div>

        {/* Filter Tabs - Segmented Control style */}
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5 overflow-x-auto scrollbar-hide">
          {['pending', 'verified', 'rejected', 'all'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 min-w-[80px] py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === f
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Loading Records...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <Clock className="w-12 h-12 text-gray-700 mb-4" />
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">No matching results found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-12">
            {results.map(result => (
              <div
                key={result.id}
                className="group bg-gray-900/50 border border-white/5 rounded-3xl p-5 hover:border-orange-500/30 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  {/* Info Column */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-600/20 flex items-center justify-center border border-orange-600/20">
                        <span className="text-orange-500 text-[10px] font-black italic">!</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-black text-white truncate uppercase italic">{result.username}</h3>
                        <p className="text-[10px] text-gray-400 font-bold truncate opacity-60 tracking-wider">
                          {result.tournamentName || 'Tournament Match'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-xl border border-white/5">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Score</span>
                        <span className="text-xs font-black text-white tracking-widest">
                          {result.userScore} <span className="text-gray-600 mx-1">-</span> {result.opponentScore ?? '?'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                        <Clock size={12} className="opacity-50" />
                        {formatDate(result.submittedAt).split(',')[0]}
                      </div>
                      {getStatusBadge(result.status)}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/5 flex-shrink-0">
                    <button
                      onClick={() => {
                        setSelectedResult(result);
                        setShowModal(true);
                      }}
                      className="flex-1 sm:flex-none h-11 px-4 sm:px-6 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase text-white tracking-[0.2em] rounded-2xl border border-white/5 transition-all whitespace-nowrap"
                    >
                      Inspect
                    </button>

                    {result.status === 'pending' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleVerify(result.id, 'verified')}
                          disabled={actionLoading}
                          className="h-11 w-11 flex items-center justify-center bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-2xl border border-green-500/20 transition-all disabled:opacity-50"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Enter rejection reason:');
                            if (reason) handleVerify(result.id, 'rejected', reason);
                          }}
                          disabled={actionLoading}
                          className="h-11 w-11 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl border border-red-500/20 transition-all disabled:opacity-50"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal - MOBILE OPTIMIZED */}
      {showModal && selectedResult && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-end sm:items-center justify-center">
          <div className="bg-[#0a0a0a] border-t sm:border border-white/10 rounded-t-[2.5rem] sm:rounded-[3rem] w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0a0a0a] z-10 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-600/20 rounded-2xl flex items-center justify-center border border-orange-600/20">
                  <Eye className="text-orange-500" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white italic truncate uppercase tracking-tighter">Inspect Submission</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{selectedResult.username}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
              {/* Score Panel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/5 p-6 rounded-3xl text-center space-y-2">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Player Score</p>
                  <div className="text-5xl font-black text-white italic tracking-tighter">{selectedResult.userScore}</div>
                  <p className="text-[9px] font-extrabold text-orange-500 uppercase">{selectedResult.username}</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-6 rounded-3xl text-center space-y-2">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Opponent Score</p>
                  <div className="text-5xl font-black text-white/40 italic tracking-tighter">{selectedResult.opponentScore ?? '?'}</div>
                  <p className="text-[9px] font-extrabold text-gray-600 uppercase">Reported</p>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Status', value: getStatusBadge(selectedResult.status) },
                  { label: 'Submitted', value: formatDate(selectedResult.submittedAt).split(',')[0] },
                  { label: 'Time', value: formatDate(selectedResult.submittedAt).split(',')[1] },
                  { label: 'Game', value: selectedResult.tournamentName || 'Tournament' }
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">{item.label}</p>
                    <div className="truncate">{typeof item.value === 'string' ? <p className="text-[10px] font-black text-white uppercase tracking-tight">{item.value}</p> : item.value}</div>
                  </div>
                ))}
              </div>

              {/* Evidence Gallery */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Match Evidence</h4>
                  <span className="text-[9px] font-black text-orange-500 uppercase bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                    {selectedResult.screenshots?.length || 0} Files
                  </span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedResult.screenshots && selectedResult.screenshots.length > 0 ? (
                    selectedResult.screenshots.map((url, index) => (
                      <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="relative h-40 group overflow-hidden rounded-2xl border border-white/5">
                        <img src={url} alt="Evidence" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                          <Eye size={24} className="text-white" />
                        </div>
                      </a>
                    ))
                  ) : (
                    <div className="col-span-full py-12 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center">
                      <Clock size={24} className="text-gray-700 mb-2" />
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">No screenshots uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedResult.notes && (
                <div className="p-5 bg-white/5 border border-white/5 rounded-3xl space-y-2">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Player Notes</h4>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed italic">"{selectedResult.notes}"</p>
                </div>
              )}
            </div>

            {/* Sticky Footer Actions */}
            {selectedResult.status === 'pending' && (
              <div className="p-6 border-t border-white/5 bg-[#0a0a0a] flex gap-3 flex-shrink-0">
                <button
                  onClick={() => handleVerify(selectedResult.id, 'verified')}
                  disabled={actionLoading}
                  className="flex-1 h-14 bg-green-600 hover:bg-green-500 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-green-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <CheckCircle size={20} />
                  Verify Match
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('Enter rejection reason:');
                    if (reason) handleVerify(selectedResult.id, 'rejected', reason);
                  }}
                  disabled={actionLoading}
                  className="flex-1 h-14 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <XCircle size={20} />
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}