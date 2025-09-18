import { useState } from 'react';
import { useLiff } from '../hooks/useLiff';
import { useKaiaWalletSdk } from '../hooks/useKaiaWallet';

export const Header = () => {
  const { liffUser, isLoggedIn } = useLiff();
  const [showMenu, setShowMenu] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  const connectWallet = async () => {
    try {
      const { requestAccount } = useKaiaWalletSdk();
      await requestAccount();
      setWalletConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🎁</span>
          </div>
          <h1 className="font-bold text-lg">Kaia Cards</h1>
        </div>

        <div className="flex items-center gap-2">
          {!walletConnected ? (
            <button
              onClick={connectWallet}
              className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg font-medium"
            >
              Connect
            </button>
          ) : (
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          )}

          {isLoggedIn && liffUser && (
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200"
            >
              {liffUser.pictureUrl ? (
                <img src={liffUser.pictureUrl} alt={liffUser.displayName} />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-400"></div>
              )}
            </button>
          )}
        </div>
      </div>

      {showMenu && (
        <div className="absolute top-full right-4 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px]">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="font-medium text-sm">{liffUser?.displayName}</p>
          </div>
          <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
            Profile
          </button>
          <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
            Orders
          </button>
          <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
            Settings
          </button>
        </div>
      )}
    </header>
  );
};