import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { isOkxWalletInstalled, connectOkxWallet } from '../utils/walletUtils';

export function OkxConnectButton() {
  const [isOkxAvailable, setIsOkxAvailable] = useState(false);
  const [connectingOkx, setConnectingOkx] = useState(false);
  const [okxError, setOkxError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Check if OKX wallet is installed
  useEffect(() => {
    const checkOkx = () => {
      const okxInstalled = isOkxWalletInstalled();
      setIsOkxAvailable(okxInstalled);
      
      if (okxInstalled) {
        console.log('OKX wallet is installed');
      } else {
        console.log('OKX wallet not detected');
      }
    };
    
    checkOkx();
    // Check every 3 seconds in case wallet extension loads with delay
    const interval = setInterval(checkOkx, 3000);
    return () => clearInterval(interval);
  }, []);

  // Connect directly to OKX wallet
  const handleConnectOkx = async () => {
    if (!isOkxAvailable) {
      setOkxError('OKX wallet not detected. Please install and try again');
      return;
    }
    
    try {
      setConnectingOkx(true);
      setOkxError(null);
      
      const account = await connectOkxWallet();
      if (!account) {
        setOkxError('Failed to connect to OKX wallet. Please try again');
      }
      
    } catch (error) {
      console.error('Error connecting to OKX wallet:', error);
      setOkxError('Connection error. Please try again');
    } finally {
      setConnectingOkx(false);
    }
  };

  // Disconnect
  const handleDisconnect = () => {
    disconnect();
  };

  if (!isOkxAvailable && !isConnected) {
    return (
      <button 
        className="bg-gray-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded text-sm sm:text-base opacity-50 cursor-not-allowed"
        disabled
      >
        OKX Wallet Not Detected
      </button>
    );
  }

  return (
    <div className="flex flex-col">
      {isConnected ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <p className="text-xs sm:text-sm text-amber-300/70 mb-1 sm:mb-0 mr-0 sm:mr-2">Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
          <button 
            onClick={handleDisconnect}
            className="bg-amber-700 hover:bg-amber-800 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded text-sm sm:text-base border border-amber-600/50"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button 
          onClick={handleConnectOkx}
          disabled={connectingOkx}
          className={`bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded text-sm sm:text-base border border-amber-400/50 ${connectingOkx ? 'opacity-50 cursor-wait' : ''}`}
        >
          {connectingOkx ? 'Connecting...' : 'Connect OKX Wallet'}
        </button>
      )}
      
      {okxError && (
        <p className="text-amber-500 text-xs sm:text-sm mt-2">{okxError}</p>
      )}
    </div>
  );
}
