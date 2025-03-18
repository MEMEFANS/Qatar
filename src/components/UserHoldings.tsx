import React, { useState, useEffect } from 'react';
import { useContractRead, useAccount } from 'wagmi';
import { formatEther } from 'viem';
import contractInfo from '../contracts/Qatar.json';

const UserHoldings: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [holdingValue, setHoldingValue] = useState('0');

  // Get token balance using custom abi
  const { data: tokenBalance, refetch: refetchBalance } = useContractRead({
    address: contractInfo.address as `0x${string}`,
    abi: [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    enabled: !!address,
    watch: true,
  });

  // Get current price
  const { 
    data: currentPrice,
    refetch: refetchPrice 
  } = useContractRead({
    address: contractInfo.address as `0x${string}`,
    abi: contractInfo.abi,
    functionName: 'getCurrentPrice',
    watch: true, // Auto-watch for changes
  });

  // Format token values with abbreviations for mobile display
  const formatTokenValue = (value: bigint): string => {
    if (!value) return '0';
    const isMobile = window.innerWidth < 640;
    const tokenValue = Number(formatEther(value));
    
    if (isMobile && tokenValue > 10000) {
      return tokenValue >= 1000000 
        ? (tokenValue / 1000000).toFixed(2) + 'M'
        : (tokenValue / 1000).toFixed(2) + 'K';
    }
    
    return tokenValue.toFixed(2);
  };

  // Calculate holding value
  useEffect(() => {
    if (tokenBalance && currentPrice && 
        typeof tokenBalance === 'bigint' && 
        typeof currentPrice === 'bigint' && 
        currentPrice > 0) {
      // Calculate token holding value (tokenBalance * currentPrice / 10^18)
      const value = (tokenBalance * currentPrice) / BigInt(10 ** 18);
      setHoldingValue(formatEther(value));
    }
  }, [tokenBalance, currentPrice]);

  // Manually refresh data
  const refreshData = () => {
    refetchBalance?.();
    refetchPrice?.();
  };

  // Auto refresh
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  if (!isConnected) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 shadow-lg border border-amber-900/30">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-amber-300">User Holdings</h2>
        <p className="text-amber-300/70 text-sm">Please connect your wallet to view your holdings</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 shadow-lg border border-amber-900/30">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-amber-300 mb-2 sm:mb-0">User Holdings</h2>
        <button 
          onClick={refreshData}
          className="text-xs bg-amber-700 hover:bg-amber-600 px-2 py-1 rounded text-white border border-amber-500/50"
          title="Refresh Data"
        >
          Refresh
        </button>
      </div>
      
      {/* Current Holdings */}
      <div className="mb-4 border-b border-amber-900/20 pb-4">
        <h3 className="text-sm font-medium mb-2 text-amber-200">Current Holdings</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="text-lg sm:text-xl font-bold text-white truncate max-w-full">
            {tokenBalance && typeof tokenBalance === 'bigint' 
              ? formatTokenValue(tokenBalance)
              : '0'} 
            <span className="text-xs sm:text-sm text-amber-300/70 ml-1">Qatar</span>
          </div>
          {address && (
            <div className="bg-gradient-to-r from-amber-800 to-red-900 text-white text-xs py-1 px-2 rounded-md border border-amber-700/50">
              {address.slice(0, 6)}...{address.slice(-4)}
            </div>
          )}
        </div>
      </div>
      
      {/* Holding Value */}
      <div>
        <h3 className="text-sm font-medium mb-2 text-amber-200">Holding Value</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="text-lg sm:text-xl font-bold text-white truncate max-w-full">
            {Number(holdingValue || '0').toFixed(6)} 
            <span className="text-xs sm:text-sm text-amber-300/70 ml-1">BNB</span>
          </div>
          <div className="text-xs text-amber-300/70 mt-1 sm:mt-0">
            ≈ {(Number(holdingValue || '0') * 300).toFixed(2)} USD
          </div>
        </div>
        <div className="text-xs text-amber-300/50 mt-2">
          Trading Price: {currentPrice && typeof currentPrice === 'bigint' 
            ? Number(formatEther(currentPrice)).toFixed(6) 
            : '0.000000'} BNB/Qatar
        </div>
      </div>
    </div>
  );
};

export default UserHoldings;
