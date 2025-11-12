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
import { Check, X, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function ResultsVerification() {
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
      if (filter === 'all') {
        q = query(resultsRef, orderBy('submittedAt', 'desc'));
      } else {
        q = query(
          resultsRef,
          where('status', '==', filter),
          orderBy('submittedAt', 'desc')
        );
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

      alert(`Result ${status === 'verified' ? 'verified' : 'rejected'} successfully!`);
      setShowModal(false);
      setSelectedResult(null);
      loadResults();
    } catch (error) {
      console.error('Error updating result:', error);
      alert('Failed to update result');
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
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">
          Match Results Verification
        </h2>
        <div className="text-gray-400 text-sm">
          {results.length} {results.length === 1 ? 'result' : 'results'} found
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['pending', 'verified', 'rejected', 'all'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-orange-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Results List */}
      {loading ? (
        <div className="text-center py-12 text-white">Loading results...</div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No results found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map(result => (
            <div
              key={result.id}
              className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-orange-500/50 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left Side - Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-bold">{result.username}</h3>
                    {getStatusBadge(result.status)}
                  </div>
                  
                  <p className="text-gray-400 text-sm">{result.tournamentName}</p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-300">
                      Score: <span className="font-bold text-green-400">{result.userScore}</span>
                      {result.opponentScore !== null && (
                        <> vs <span className="font-bold text-red-400">{result.opponentScore}</span></>
                      )}
                    </span>
                    <span className="text-gray-500">
                      Submitted: {formatDate(result.submittedAt)}
                    </span>
                  </div>

                  {result.notes && (
                    <p className="text-gray-400 text-sm italic">{result.notes}</p>
                  )}
                </div>

                {/* Right Side - Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedResult(result);
                      setShowModal(true);
                    }}
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>

                  {result.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleVerify(result.id, 'verified')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        Verify
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Enter rejection reason:');
                          if (reason) handleVerify(result.id, 'rejected', reason);
                        }}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedResult && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Match Result Details</h3>
                <p className="text-gray-400 text-sm mt-1">{selectedResult.tournamentName}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Player Info */}
              <div className="bg-gray-800 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-3">Player Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Username:</span>
                    <p className="text-white font-medium">{selectedResult.username}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <div className="mt-1">{getStatusBadge(selectedResult.status)}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Submitted:</span>
                    <p className="text-white">{formatDate(selectedResult.submittedAt)}</p>
                  </div>
                  {selectedResult.verifiedAt && (
                    <div>
                      <span className="text-gray-400">Verified:</span>
                      <p className="text-white">{formatDate(selectedResult.verifiedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Score Info */}
              <div className="bg-gray-800 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-3">Match Score</h4>
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-1">{selectedResult.username}</p>
                    <p className="text-5xl font-bold text-green-400">{selectedResult.userScore}</p>
                  </div>
                  <span className="text-gray-500 text-2xl">VS</span>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-1">Opponent</p>
                    <p className="text-5xl font-bold text-red-400">
                      {selectedResult.opponentScore || '?'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Screenshots */}
              <div>
                <h4 className="text-white font-semibold mb-3">Match Screenshots</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedResult.screenshots?.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative group"
                    >
                      <img
                        src={url}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border border-gray-700 hover:border-orange-500 transition-colors"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Eye className="w-8 h-8 text-white" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedResult.notes && (
                <div className="bg-gray-800 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-2">Additional Notes</h4>
                  <p className="text-gray-300 text-sm">{selectedResult.notes}</p>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedResult.status === 'rejected' && selectedResult.rejectionReason && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <h4 className="text-red-400 font-semibold mb-2">Rejection Reason</h4>
                  <p className="text-red-300 text-sm">{selectedResult.rejectionReason}</p>
                </div>
              )}

              {/* Actions */}
              {selectedResult.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleVerify(selectedResult.id, 'verified')}
                    disabled={actionLoading}
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Verify Result
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Enter rejection reason:');
                      if (reason) handleVerify(selectedResult.id, 'rejected', reason);
                    }}
                    disabled={actionLoading}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Reject Result
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}