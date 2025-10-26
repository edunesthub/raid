// app/auth/reset/page.tsx
'use client';
import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { requestPasswordReset } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err?.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-gray-400">If the address exists, you'll receive password reset instructions.</p>
          <div className="mt-6">
            <button className="btn-raid" onClick={() => router.push('/auth/login')}>Back to login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-2">Reset password</h2>
        <p className="text-gray-400 mb-6">Enter your email and we'll send reset instructions.</p>

        <form onSubmit={handleSubmit} className="card-raid p-6">
          {error && <div className="text-red-400 text-sm mb-3">{error}</div>}
          <div>
            <label className="text-sm text-gray-300">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full mt-2 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white" />
          </div>
          <div className="mt-4">
            <button type="submit" disabled={loading} className="w-full btn-raid">
              {loading ? 'Sending...' : 'Send reset email'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4 text-gray-400">
          <Link href="/auth/login" className="text-orange-500">Back to login</Link>
        </div>
      </div>
    </div>
  );
}