import React, { useState, useEffect, useMemo } from 'react';
import { useContractRead, useAccount } from 'wagmi';
import contractInfo from '../contracts/Qatar.json';
import { formatEther } from 'viem';

// 定义总供应量常量
const TOTAL_SUPPLY = BigInt('1000000000000000000000000'); // 1,000,000 tokens in wei (18 decimals)

const TokenEconomicsDashboard: React.FC = () => {
  const { address } = useAccount();
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [nextPriceIncrease, setNextPriceIncrease] = useState('0');
  const [burnedPercentage, setBurnedPercentage] = useState(0);
  const [activeStat, setActiveStat] = useState('price'); // 'price', 'burn', 'fees'

  // Get contract data with loading states
  const { data: currentPrice, refetch: refetchPrice, isLoading: isPriceLoading } = useContractRead({
    address: contractInfo.address as `0x${string}`,
    abi: contractInfo.abi,
    functionName: 'getCurrentPrice',
    watch: true // Add watch to automatically update data
  });

  // Use the newly added getTotalBNBReceived function
  const { data: totalBNBReceived, refetch: refetchBNBReceived, isLoading: isBNBLoading } = useContractRead({
    address: contractInfo.address as `0x${string}`,
    abi: contractInfo.abi,
    functionName: 'getTotalBNBReceived', // Use the new getter function
    watch: true // Add watch to automatically update data
  });

  const { data: burnedTokens, refetch: refetchBurnedTokens, isLoading: isBurnedLoading } = useContractRead({
    address: contractInfo.address as `0x${string}`,
    abi: contractInfo.abi,
    functionName: 'getBurnedTokens',
    watch: true // Add watch to automatically update data
  });

  const { data: totalMinted, refetch: refetchTotalMinted, isLoading: isMintedLoading } = useContractRead({
    address: contractInfo.address as `0x${string}`,
    abi: contractInfo.abi,
    functionName: 'getTotalMinted',
    watch: true // Add watch to automatically update data
  });

  // Get remaining mintable tokens
  const { data: remainingSupply, refetch: refetchRemainingSupply, isLoading: isRemainingLoading } = useContractRead({
    address: contractInfo.address as `0x${string}`,
    abi: contractInfo.abi,
    functionName: 'getRemainingSupply',
    watch: true // Add watch to automatically update data
  });

  // Check if any data is still loading
  const isLoading = isPriceLoading || isBNBLoading || isBurnedLoading || isMintedLoading || isRemainingLoading;

  const BNB_MILESTONE = BigInt('10000000000000000000'); // 10 BNB

  // Format BNB values with proper decimal display - memoized for performance
  const formatBnbValue = useMemo(() => {
    return (value: bigint): string => {
      if (!value) return '0.000000';
      return Number(formatEther(value)).toFixed(6);
    };
  }, []);

  // Format token values with abbreviations for mobile display - memoized for performance
  const formatTokenValue = useMemo(() => {
    return (value: bigint): string => {
      if (!value) return '0';
      const isMobile = window.innerWidth < 640;
      const tokenValue = Number(formatEther(value));
      
      if (isMobile && tokenValue > 10000) {
        return tokenValue >= 1000000 
          ? (tokenValue / 1000000).toFixed(2) + 'M'
          : (tokenValue / 1000).toFixed(2) + 'K';
      }
      
      return tokenValue.toLocaleString(undefined, { maximumFractionDigits: 2 });
    };
  }, []);

  // Memoized formatted values for better performance
  const formattedCurrentPrice = useMemo(() => {
    return currentPrice && typeof currentPrice === 'bigint' 
      ? formatBnbValue(currentPrice) 
      : '0.000000';
  }, [currentPrice, formatBnbValue]);

  const formattedTotalBNBReceived = useMemo(() => {
    return totalBNBReceived && typeof totalBNBReceived === 'bigint'
      ? formatBnbValue(totalBNBReceived)
      : '0';
  }, [totalBNBReceived, formatBnbValue]);

  const formattedBurnedTokens = useMemo(() => {
    return burnedTokens && typeof burnedTokens === 'bigint' 
      ? formatTokenValue(burnedTokens)
      : '0';
  }, [burnedTokens, formatTokenValue]);

  const formattedTotalMinted = useMemo(() => {
    return totalMinted && typeof totalMinted === 'bigint'
      ? formatTokenValue(totalMinted)
      : '0';
  }, [totalMinted, formatTokenValue]);

  const formattedRemainingSupply = useMemo(() => {
    return remainingSupply && typeof remainingSupply === 'bigint'
      ? formatTokenValue(remainingSupply)
      : '0';
  }, [remainingSupply, formatTokenValue]);

  const priceGrowth = useMemo(() => {
    return currentPrice && typeof currentPrice === 'bigint'
      ? (Number(formatEther(currentPrice)) * 100 / 0.000001).toFixed(2)
      : '0';
  }, [currentPrice]);

  // Update price milestone progress
  useEffect(() => {
    if (totalBNBReceived && typeof totalBNBReceived === 'bigint') {
      // Calculate progress as a percentage of the milestone
      const remainderBNB = totalBNBReceived % BNB_MILESTONE;
      const progress = Number((remainderBNB * BigInt(100)) / BNB_MILESTONE);
      setProgressPercentage(progress);

      // Calculate how much more BNB is needed for next price increase
      const bnbNeeded = BNB_MILESTONE - remainderBNB;
      const bnbNeededEther = formatEther(bnbNeeded);
      setNextPriceIncrease(Number(bnbNeededEther).toFixed(6));
    }
  }, [totalBNBReceived, BNB_MILESTONE]);

  // Update burned percentage
  useEffect(() => {
    if (burnedTokens && typeof burnedTokens === 'bigint') {
      // 计算已销毁代币占总供应量的百分比
      const percentage = Number((burnedTokens * BigInt(10000)) / TOTAL_SUPPLY) / 100;
      console.log("销毁百分比计算:", { 
        burnedTokens: formatEther(burnedTokens), 
        totalSupply: formatEther(TOTAL_SUPPLY),
        calculatedPercentage: percentage
      });
      setBurnedPercentage(percentage);
    }
  }, [burnedTokens]);

  // Function to refresh all data
  const refreshAllData = () => {
    refetchPrice();
    refetchBNBReceived();
    refetchBurnedTokens();
    refetchTotalMinted();
    refetchRemainingSupply();
  };

  // Loading indicator component
  const LoadingIndicator = () => (
    <div className="flex items-center justify-center py-2">
      <div className="animate-pulse flex space-x-1">
        <div className="h-2 w-2 bg-amber-400 rounded-full"></div>
        <div className="h-2 w-2 bg-amber-400 rounded-full"></div>
        <div className="h-2 w-2 bg-amber-400 rounded-full"></div>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 shadow-lg border border-amber-900/30">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-semibold text-amber-300">Token Economics</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={refreshAllData}
            className="px-2 py-1 rounded-md bg-amber-700 hover:bg-amber-600 text-white text-xs border border-amber-500/50"
            title="Refresh Data"
            aria-label="Refresh data"
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
          <div className="flex space-x-1 text-xs">
            <button 
              onClick={() => setActiveStat('price')}
              className={`px-2 py-1 rounded-md ${activeStat === 'price' 
                ? 'bg-amber-700 text-white' 
                : 'bg-gray-800 text-amber-300/70 hover:bg-gray-700'}`}
              aria-pressed={activeStat === 'price'}
              aria-label="Show price information"
            >
              Price
            </button>
            <button 
              onClick={() => setActiveStat('burn')}
              className={`px-2 py-1 rounded-md ${activeStat === 'burn' 
                ? 'bg-amber-700 text-white' 
                : 'bg-gray-800 text-amber-300/70 hover:bg-gray-700'}`}
              aria-pressed={activeStat === 'burn'}
              aria-label="Show burn information"
            >
              Burn
            </button>
          </div>
        </div>
      </div>

      {isLoading && <LoadingIndicator />}

      {/* Price Milestone Progress */}
      {activeStat === 'price' && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-medium text-amber-200">Price Milestone Progress</h3>
            <span className="text-xs text-amber-300/70">{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercentage}>
            <div 
              className="bg-gradient-to-r from-amber-600 to-red-700 h-2.5 rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-800 p-3 rounded-lg border border-amber-900/20">
              <div className="text-xs text-amber-300/80 mb-1">Current Price</div>
              <div className="text-base sm:text-lg font-bold text-amber-300 truncate">
                {formattedCurrentPrice} BNB
              </div>
              <div className="text-xs text-amber-300/50 mt-1">per Qatar Token</div>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg border border-amber-900/20">
              <div className="text-xs text-amber-300/80 mb-1">Next Price Increase</div>
              <div className="text-base sm:text-lg font-bold text-amber-300 truncate">
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
            <h3 className="text-sm font-medium text-amber-200">Burn Progress</h3>
            <span className="text-xs text-amber-300/70">{burnedPercentage.toFixed(1)}%</span>
          </div>
          <div 
            className="w-full bg-gray-700 rounded-full h-2.5" 
            role="progressbar" 
            aria-valuemin={0} 
            aria-valuemax={100} 
            aria-valuenow={burnedPercentage}
          >
            <div 
              className="bg-gradient-to-r from-amber-600 to-red-700 h-2.5 rounded-full" 
              style={{ width: `${Math.max(0.5, burnedPercentage)}%` }}
            ></div>
          </div>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-800 p-3 rounded-lg border border-amber-900/20">
              <div className="text-xs text-amber-300/80 mb-1">Tokens Burned</div>
              <div className="text-base sm:text-lg font-bold text-amber-300 truncate">
                {formattedBurnedTokens} Qatar
              </div>
              <div className="text-xs text-amber-300/50 mt-1">total burned</div>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg border border-amber-900/20">
              <div className="text-xs text-amber-300/80 mb-1">Available to Mint</div>
              <div className="text-base sm:text-lg font-bold text-amber-300 truncate">
                {formattedRemainingSupply} Qatar
              </div>
              <div className="text-xs text-amber-300/50 mt-1">remaining supply</div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Statistics - Visible on all tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-2 rounded-lg border border-amber-900/20">
          <div className="text-xs text-amber-300/80">Total Minted</div>
          <div className="text-sm font-semibold text-amber-300 truncate">
            {formattedTotalMinted} Qatar
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-2 rounded-lg border border-amber-900/20">
          <div className="text-xs text-amber-300/80">BNB Received</div>
          <div className="text-sm font-semibold text-amber-300 truncate">
            {formattedTotalBNBReceived} BNB
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-2 rounded-lg border border-amber-900/20">
          <div className="text-xs text-amber-300/80">Burned %</div>
          <div className="text-sm font-semibold text-amber-300 truncate">
            {burnedPercentage.toFixed(2)}%
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-2 rounded-lg border border-amber-900/20">
          <div className="text-xs text-amber-300/80">Price Growth</div>
          <div className="text-sm font-semibold text-amber-300 truncate">
            {priceGrowth}x
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenEconomicsDashboard;
