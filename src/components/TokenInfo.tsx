import { useQatarContract } from '../hooks/useQatarContract';
import { formatEther } from 'viem';

export function TokenInfo() {
  const { currentPrice, totalMinted, burnedTokens, formattedPrice, formattedMinted, formattedBurned } = useQatarContract();

  // 计算正确的可铸造代币数量
  const calculateAvailableToMint = () => {
    if (!totalMinted || typeof totalMinted !== 'bigint') {
      return '1,000,000';
    }
    
    // 总供应量是 1,000,000
    const totalSupply = 1000000;
    
    // 将 totalMinted 从 wei 转换为实际数量
    const mintedAmount = Number(formatEther(totalMinted));
    
    // 计算剩余可铸造数量
    const available = Math.max(0, totalSupply - mintedAmount);
    
    return available.toLocaleString();
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6 rounded-lg border border-amber-900/30 shadow-lg">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-amber-300">Token Information</h2>
      <div className="space-y-2 sm:space-y-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 border-b border-amber-900/20">
          <span className="text-sm sm:text-base text-amber-300/80 mb-1 sm:mb-0">Total Supply:</span>
          <span className="text-sm sm:text-base text-white font-medium">1,000,000 Qatar</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 border-b border-amber-900/20">
          <span className="text-sm sm:text-base text-amber-300/80 mb-1 sm:mb-0">Minted:</span>
          <span className="text-sm sm:text-base text-white font-medium">{formattedMinted} Qatar</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 border-b border-amber-900/20">
          <span className="text-sm sm:text-base text-amber-300/80 mb-1 sm:mb-0">Burned:</span>
          <span className="text-sm sm:text-base text-white font-medium">{formattedBurned} Qatar</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 border-b border-amber-900/20">
          <span className="text-sm sm:text-base text-amber-300/80 mb-1 sm:mb-0">Current Price:</span>
          <span className="text-sm sm:text-base text-white font-medium">{currentPrice && typeof currentPrice === 'bigint' 
            ? Number(formatEther(currentPrice)).toFixed(6) 
            : '0'} BNB</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1">
          <span className="text-sm sm:text-base text-amber-300/80 mb-1 sm:mb-0">Available to Mint:</span>
          <span className="text-sm sm:text-base text-white font-medium">
            {calculateAvailableToMint()} Qatar
          </span>
        </div>
      </div>
    </div>
  );
}
