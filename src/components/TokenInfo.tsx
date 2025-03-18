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

  // 格式化大数字，在移动端时截断显示
  const formatLargeNumber = (value: string) => {
    if (!value) return '0';
    
    // 检查是否为移动设备 (简单检测窗口宽度)
    const isMobile = window.innerWidth < 640;
    
    // 如果是数字格式的字符串，进行格式化
    if (!isNaN(Number(value.replace(/,/g, '')))) {
      const num = Number(value.replace(/,/g, ''));
      if (isMobile && num > 10000) {
        // 移动端对大数字使用K/M表示
        return num >= 1000000 
          ? (num / 1000000).toFixed(2) + 'M' 
          : (num / 1000).toFixed(2) + 'K';
      }
      // 对于较小的数字或PC端，使用标准格式
      return num.toLocaleString();
    }
    
    // 如果不是标准数字格式，直接返回
    return value;
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6 rounded-lg border border-amber-900/30 shadow-lg">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-amber-300">Token Information</h2>
      <div className="space-y-2 sm:space-y-3">
        <div className="flex justify-between items-center py-1 border-b border-amber-900/20">
          <span className="text-sm text-amber-300/80">Total Supply:</span>
          <span className="text-sm text-white font-medium truncate max-w-[50%] text-right">1,000,000 Qatar</span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-amber-900/20">
          <span className="text-sm text-amber-300/80">Minted:</span>
          <span className="text-sm text-white font-medium truncate max-w-[50%] text-right">{formatLargeNumber(formattedMinted)} Qatar</span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-amber-900/20">
          <span className="text-sm text-amber-300/80">Burned:</span>
          <span className="text-sm text-white font-medium truncate max-w-[50%] text-right">{formatLargeNumber(formattedBurned)} Qatar</span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-amber-900/20">
          <span className="text-sm text-amber-300/80">Current Price:</span>
          <span className="text-sm text-white font-medium truncate max-w-[50%] text-right">
            {currentPrice && typeof currentPrice === 'bigint' 
              ? Number(formatEther(currentPrice)).toFixed(6) 
              : '0'} BNB
          </span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="text-sm text-amber-300/80">Available to Mint:</span>
          <span className="text-sm text-white font-medium truncate max-w-[50%] text-right">{formatLargeNumber(calculateAvailableToMint())} Qatar</span>
        </div>
      </div>
    </div>
  );
}
