import { useLiff } from '../hooks/useLiff';
import { useState } from 'react';

interface ProfilePageProps {
  navigate: (page: any) => void;
}

export const ProfilePage = ({ navigate }: ProfilePageProps) => {
  const { liffUser, logout, isInLineApp, shareMessage } = useLiff();
  const [showShareDialog, setShowShareDialog] = useState(false);

  const handleShare = () => {
    if (isInLineApp) {
      shareMessage({
        type: 'text',
        text: 'Check out Kaia Cards! Get discounted gift cards with crypto 🎁',
      });
    } else {
      setShowShareDialog(true);
    }
  };

  const stats = {
    totalOrders: 12,
    totalSaved: 145.50,
    memberSince: 'Dec 2023',
    referrals: 3,
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-6">
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2 text-white/80 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-white/30">
            {liffUser?.pictureUrl ? (
              <img src={liffUser.pictureUrl} alt={liffUser.displayName} />
            ) : (
              <div className="w-full h-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold">{liffUser?.displayName || 'Guest User'}</h1>
            <p className="text-white/80 text-sm">Member since {stats.memberSince}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4 p-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
            <div className="text-xs text-gray-500 mt-1">Total Orders</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">${stats.totalSaved}</div>
            <div className="text-xs text-gray-500 mt-1">Total Saved</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.referrals}</div>
            <div className="text-xs text-gray-500 mt-1">Referrals</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">VIP</div>
            <div className="text-xs text-gray-500 mt-1">Status</div>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="bg-white rounded-lg divide-y divide-gray-100">
            <button
              onClick={() => navigate('orders')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📦</span>
                <span className="font-medium">My Orders</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-xl">💳</span>
                <span className="font-medium">Payment Methods</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={handleShare}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🎁</span>
                <span className="font-medium">Invite Friends</span>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Earn $5</span>
            </button>

            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-xl">⚙️</span>
                <span className="font-medium">Settings</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-xl">❓</span>
                <span className="font-medium">Help & Support</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={logout}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 text-red-600"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🚪</span>
                <span className="font-medium">Sign Out</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {showShareDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="font-bold mb-4">Share with Friends</h3>
            <p className="text-sm text-gray-600 mb-4">
              Share Kaia Cards with your friends and earn $5 for each referral!
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowShareDialog(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('https://kaiacards.com/ref/' + liffUser?.userId);
                  alert('Referral link copied!');
                  setShowShareDialog(false);
                }}
                className="flex-1 py-2 bg-blue-500 text-white rounded-lg"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};