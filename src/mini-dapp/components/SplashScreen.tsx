import { useEffect, useState } from 'react';

export const SplashScreen = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-600 to-blue-600 flex flex-col items-center justify-center">
      <div className="text-white text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-white rounded-3xl mx-auto flex items-center justify-center shadow-2xl">
            <span className="text-4xl">🎁</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Kaia Cards</h1>
        <p className="text-white/80 mb-8">Gift Cards on Blockchain</p>
        <div className="h-6">
          <span className="text-white/60">Loading{dots}</span>
        </div>
      </div>
    </div>
  );
};