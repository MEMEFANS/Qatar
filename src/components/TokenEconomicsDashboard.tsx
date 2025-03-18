import React, { useState, useEffect } from 'react';
import { useContractRead, useAccount } from 'wagmi';
import contractInfo from '../contracts/Qatar.json';
import { formatEther } from 'viem';

const TokenEconomicsDashboard: React.FC = () => {
  const { address } = useAccount();
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [nextPriceIncrease, setNextPriceIncrease] = useState('0');
  const [burnedPercentage, setBurnedPercentage] = useState(0);
  const [activeStat, setActiveStat] = useState('price'); // 'price', 'burn', 'fees'

  // Get contract data
  const { data: currentPrice, refetch: refetchPrice } = useContractRead({
    address: contractInfo.address as `0x${string}`,
    abi: contractInfo.abi,
    functionName: 'getCurrentPrice',
    watch: true // Add watch to automatically update data
  });

  // Use the newly added getTotalBNBReceived function
  const { data: totalBNBReceived, refetch: refetchBNBReceived } = useContractRead({
    address: contractInfo.address as `0x${string}`,
    abi: contractInfo.abi,
    functionName: 'getTotalBNBReceived', // Use the new getter function
    watch: true // Add watch to automatically update data
  });

  const { data: burnedTokens, refetch: refetchBurnedTokens } = useContractRead({
    address: contractInfo.address as `0x${string}`,
    abi: contractInfo.abi,
    functionName: 'getBurnedTokens',
    watch: true // Add watch to automatically update data
  });

  const { data: totalMinted, refetch: refetchTotalMinted } = useContractRead({
    address: contractInfo.address as `0x${string}`,
    abi: contractInfo.abi,
    functionName: 'getTotalMinted',
    watch: true // Add watch to automatically update data
  });

  // Get remaining mintable tokens
  const { data: remainingSupply, refetch: refetchRemainingSupply } = useContractRead({
    address: contractInfo.address as `0x${string}`,
    abi: contractInfo.abi,
    functionName: 'getRemainingSupply',
    watch: true // Add watch to automatically update data
  });

  const BNB_MILESTONE = BigInt('10000000000000000000'); // 10 BNB

  useEffect(() => {
    if (totalBNBReceived && typeof totalBNBReceived === 'bigint') {
      // Calculate how much BNB is needed for the next price increase
      const currentMilestone = totalBNBReceived / BNB_MILESTONE;
      const nextMilestone = (currentMilestone + BigInt(1)) * BNB_MILESTONE;
      const bnbNeeded = nextMilestone - totalBNBReceived;
      setNextPriceIncrease(formatEther(bnbNeeded));

      // Calculate current milestone progress
      const currentProgress = totalBNBReceived % BNB_MILESTONE;
      setProgressPercentage(Number((currentProgress * BigInt(100)) / BNB_MILESTONE));
    }

    if (burnedTokens && totalMinted && 
        typeof burnedTokens === 'bigint' && 
        typeof totalMinted === 'bigint' && 
        totalMinted > BigInt(0)) {
      const percentage = Number((burnedTokens * BigInt(10000)) / totalMinted) / 100;
      setBurnedPercentage(percentage);
    }
  }, [totalBNBReceived, burnedTokens, totalMinted]);

  // Formatting function to ensure correct decimal places
  const formatBnbValue = (value: bigint): string => {
    return Number(formatEther(value)).toFixed(6);
  };

  const refreshAllData = () => {
    refetchPrice();
    refetchBNBReceived();
    refetchBurnedTokens();
    refetchTotalMinted();
    refetchRemainingSupply();
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 shadow-lg border border-amber-900/30">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-semibold text-amber-300">Token Economics Dashboard</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <button 
            onClick={refreshAllData}
            className="px-2 py-1 rounded-md bg-amber-700 hover:bg-amber-600 text-white text-xs border border-amber-500/50"
            title="Refresh Data"
          >
            Refresh Data
          </button>
          <div className="flex space-x-1 text-xs">
            <button 
              onClick={() => setActiveStat('price')}
              className={`px-2 py-1 rounded-md ${activeStat === 'price' 
                ? 'bg-amber-700 text-white' 
                : 'bg-gray-800 text-amber-300/70 hover:bg-gray-700'}`}
            >
              Price
            </button>
            <button 
              onClick={() => setActiveStat('burn')}
              className={`px-2 py-1 rounded-md ${activeStat === 'burn' 
                ? 'bg-amber-700 text-white' 
                : 'bg-gray-800 text-amber-300/70 hover:bg-gray-700'}`}
            >
              Burn
            </button>
          </div>
        </div>
      </div>

      {/* Price Milestone Progress */}
      {activeStat === 'price' && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-md font-medium text-amber-200">Price Milestone Progress</h3>
            <span className="text-xs text-amber-300/70">{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-amber-600 to-red-700 h-2.5 rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-3 rounded-lg border border-amber-900/20">
              <div className="text-xs text-amber-300/80 mb-1">Current Price</div>
              <div className="text-lg sm:text-xl font-bold text-amber-300">
                {currentPrice && typeof currentPrice === 'bigint' 
                  ? formatBnbValue(currentPrice) 
                  : '0.000000'} BNB
              </div>
              <div className="text-xs text-amber-300/50 mt-1">per Qatar Token</div>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg border border-amber-900/20">
              <div className="text-xs text-amber-300/80 mb-1">Next Price Increase</div>
              <div className="text-lg sm:text-xl font-bold text-amber-300">
                {nextPriceIncrease} BNB
              </div>
              <div className="text-xs text-amber-300/50 mt-1">needed to trigger</div>
            </div>
          </div>
        </div>
      )}

      {/* Burn Statistics */}
      {activeStat === 'burn' && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-md font-medium text-amber-200">Burn Statistics</h3>
            <span className="text-xs text-amber-300/70">{burnedPercentage.toFixed(1)}% Burned</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-amber-600 to-red-700 h-2.5 rounded-full" 
              style={{ width: `${Math.min(burnedPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-3 rounded-lg border border-amber-900/20">
              <div className="text-xs text-amber-300/80 mb-1">Total Minted</div>
              <div className="text-lg sm:text-xl font-bold text-amber-300">
                {totalMinted && typeof totalMinted === 'bigint' 
                  ? Number(formatEther(totalMinted)).toFixed(2)
                  : '0.00'} Qatar
              </div>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg border border-amber-900/20">
              <div className="text-xs text-amber-300/80 mb-1">Total Burned</div>
              <div className="text-lg sm:text-xl font-bold text-amber-300">
                {burnedTokens && typeof burnedTokens === 'bigint' 
                  ? Number(formatEther(burnedTokens)).toFixed(2)
                  : '0.00'} Qatar
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div className="bg-gray-800 p-3 rounded-lg border border-amber-900/20">
          <div className="text-xs text-amber-300/80 mb-1">Total BNB Received</div>
          <div className="text-lg font-bold text-amber-300">
            {totalBNBReceived && typeof totalBNBReceived === 'bigint' 
              ? formatBnbValue(totalBNBReceived)
              : '0.000000'} BNB
          </div>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg border border-amber-900/20">
          <div className="text-xs text-amber-300/80 mb-1">Available to Mint</div>
          <div className="text-lg font-bold text-amber-300">
            {remainingSupply && typeof remainingSupply === 'bigint'
              ? Number(formatEther(remainingSupply)).toFixed(2)
              : '1,000,000.00'} Qatar
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenEconomicsDashboard;
