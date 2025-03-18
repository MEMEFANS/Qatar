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
        className="bg-gray-700 text-white px-4 py-2 rounded opacity-50 cursor-not-allowed"
        disabled
      >
        OKX Wallet Not Detected
      </button>
    );
  }

  return (
    <div className="flex flex-col">
      {isConnected ? (
        <div>
          <p className="text-sm text-gray-400 mb-2">Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
          <button 
            onClick={handleDisconnect}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button 
          onClick={handleConnectOkx}
          disabled={connectingOkx}
          className={`bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded ${connectingOkx ? 'opacity-50 cursor-wait' : ''}`}
        >
          {connectingOkx ? 'Connecting...' : 'Connect OKX Wallet'}
        </button>
      )}
      
      {okxError && (
        <p className="text-red-500 text-sm mt-2">{okxError}</p>
      )}
    </div>
  );
}
