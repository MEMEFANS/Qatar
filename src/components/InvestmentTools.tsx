import React, { useState, useEffect } from 'react';
import { useContractRead, useAccount, useNetwork, usePublicClient } from 'wagmi';
import contractInfo from '../contracts/Qatar.json';

const InvestmentTools: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const publicClient = usePublicClient();
  
  const [bnbAmount, setBnbAmount] = useState<string>('0.1');
  const [tokenAmount, setTokenAmount] = useState<string>('0');
  const [futureValue, setFutureValue] = useState<string>('0');
  const [projectedReturn, setProjectedReturn] = useState<string>('0');
  const [returnPercentage, setReturnPercentage] = useState<string>('0');
  const [milestones, setMilestones] = useState<number>(1);
  const [purchaseHistory, setPurchaseHistory] = useState<Array<{block: number; tokens: string; bnb: string; price: string}>>([]);
  const [averagePrice, setAveragePrice] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Get current price
  const { data: currentPrice, refetch: refetchPrice } = useContractRead({
    address: contractInfo.address as `0x${string}`,
    abi: contractInfo.abi,
    functionName: 'getCurrentPrice',
    watch: true // Add watch to auto-update data
  });

  // Get initial price
  const { data: initialPrice } = useContractRead({
    address: contractInfo.address as `0x${string}`,
    abi: contractInfo.abi,
    functionName: 'INITIAL_PRICE',
  });

  // Get BNB milestone
  const { data: bnbMilestone } = useContractRead({
    address: contractInfo.address as `0x${string}`,
    abi: contractInfo.abi,
    functionName: 'BNB_MILESTONE',
  });

  // Add function to refresh data
  const refreshData = () => {
    refetchPrice();
  };

  // Calculate token amount - according to contract logic: tokensToMint = (msg.value * 10**18) / currentPrice
  useEffect(() => {
    if (currentPrice && typeof currentPrice === 'bigint' && bnbAmount) {
      try {
        const bnbAmountWei = BigInt(Math.floor(parseFloat(bnbAmount) * 10**18));
        const calculatedTokens = (bnbAmountWei * BigInt(10 ** 18)) / currentPrice;
        setTokenAmount((Number(calculatedTokens) / 10**18).toFixed(2));
      } catch (error) {
        console.error('Error calculating token amount:', error);
        setTokenAmount('0');
      }
    }
  }, [bnbAmount, currentPrice]);

  // Calculate future value and projected return - based on 20% price increase per 10 BNB in contract
  useEffect(() => {
    if (currentPrice && typeof currentPrice === 'bigint' && milestones >= 0 && tokenAmount && 
        initialPrice && typeof initialPrice === 'bigint') {
      try {
        // Use the same price calculation logic as the contract
        // Contract price formula: INITIAL_PRICE + (INITIAL_PRICE * 20 * milestoneCount / 100)
        const futurePrice = initialPrice + (initialPrice * BigInt(20 * milestones) / BigInt(100));
        
        // Calculate BNB amount based on sell logic in contract: bnbAmount = (tokenAmount * price) / 10**18
        const tokensInWei = BigInt(Math.floor(parseFloat(tokenAmount) * 10**18));
        const value = (tokensInWei * futurePrice) / BigInt(10 ** 18);
        
        // No sell fee, consistent with SELL_FEE=0 in contract
        const finalValue = value;
        
        const futureValueStr = (Number(finalValue) / 10**18).toFixed(4);
        setFutureValue(futureValueStr);
        
        // Calculate projected return
        const initialInvestment = parseFloat(bnbAmount);
        const projectedValue = parseFloat(futureValueStr);
        const absoluteReturn = projectedValue - initialInvestment;
        const percentage = initialInvestment > 0 ? (absoluteReturn / initialInvestment) * 100 : 0;
        
        setProjectedReturn(absoluteReturn.toFixed(4));
        setReturnPercentage(percentage.toFixed(0));
      } catch (error) {
        console.error('Error calculating future value:', error);
        setFutureValue('0');
        setProjectedReturn('0');
        setReturnPercentage('0');
      }
    }
  }, [currentPrice, tokenAmount, milestones, bnbAmount, initialPrice]);

  // Fetch purchase history
  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      if (!address || !isConnected || !publicClient || !chain) return;
      
      setIsLoading(true);
      try {
        // Temporarily use mock data, replace with actual data when contract is deployed and has transaction records
        setTimeout(() => {
          const mockHistory = [
            {
              block: 12345678,
              tokens: "100.00",
              bnb: "0.0500",
              price: "0.0005"
            },
            {
              block: 12345600,
              tokens: "50.00",
              bnb: "0.0230",
              price: "0.0004"
            }
          ];
          
          setPurchaseHistory(mockHistory);
          setAveragePrice("0.00045");
          setIsLoading(false);
        }, 1000);
        
        // Note: The following code can be enabled after contract deployment
        /*
        // Get contract's Mint event
        const logs = await publicClient.getLogs({
          address: contractInfo.address as `0x${string}`,
          event: parseAbiItem('event TokensMinted(address indexed user, uint256 amount, uint256 bnbAmount)'),
          args: {
            user: address
          },
          fromBlock: 'earliest'
        });
        
        const history = await Promise.all(logs.map(async (log) => {
          const block = await publicClient.getBlock({ blockHash: log.blockHash });
          
          // Extract information from event
          const tokens = log.args.amount || BigInt(0);
          const bnb = log.args.bnbAmount || BigInt(0);
          
          // Calculate price
          let price = BigInt(0);
          if (tokens > BigInt(0) && bnb > BigInt(0)) {
            price = (bnb * BigInt(10 ** 18)) / tokens;
          }
            
          return {
            block: Number(log.blockNumber),
            tokens: (Number(tokens) / 10**18).toFixed(2),
            bnb: (Number(bnb) / 10**18).toFixed(4),
            price: (Number(price) / 10**18).toFixed(4)
          };
        }));
        
        // Sort by block number
        history.sort((a, b) => b.block - a.block);
        setPurchaseHistory(history);
        
        // Calculate average purchase price
        if (history.length > 0) {
          const totalBnb = history.reduce((sum, item) => sum + parseFloat(item.bnb), 0);
          const totalTokens = history.reduce((sum, item) => sum + parseFloat(item.tokens), 0);
          
          if (totalTokens > 0) {
            setAveragePrice((totalBnb / totalTokens).toFixed(4));
          }
        }
        */
      } catch (error) {
        console.error('Error fetching purchase history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPurchaseHistory();
  }, [address, isConnected, publicClient, chain]);

  // Utility function: Format BigInt to ether unit string
  const formatEther = (value: bigint): string => {
    return (Number(value) / 10**18).toFixed(4);
  };

  const handleBnbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Restrict input range to 0.03 - 1 BNB, consistent with MIN_MINT_AMOUNT and MAX_MINT_AMOUNT in contract
    const value = parseFloat(e.target.value);
    if (isNaN(value)) {
      setBnbAmount('0.03');
    } else if (value < 0.03) {
      setBnbAmount('0.03');
    } else if (value > 1) {
      setBnbAmount('1');
    } else {
      setBnbAmount(e.target.value);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 shadow-lg border border-amber-900/30">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-bold text-amber-300">Investment Analysis Tool</h2>
        <button 
          onClick={refreshData}
          className="px-2 py-1 rounded-md bg-amber-700 hover:bg-amber-600 text-white text-xs border border-amber-500/50"
          title="Refresh Data"
        >
          Refresh Data
        </button>
      </div>
      
      {/* Investment Simulator */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-3 text-amber-200 border-b border-amber-900/50 pb-1">Investment Simulator</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-3 gap-3">
          <div className="w-full sm:w-auto sm:flex-1">
            <label className="block text-xs text-amber-300/80 mb-1">BNB Investment Amount (0.03-1)</label>
            <input
              type="number"
              min="0.03"
              max="1"
              step="0.01"
              value={bnbAmount}
              onChange={handleBnbChange}
              className="w-full bg-gray-800 border border-amber-900/50 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div className="hidden sm:block w-8 text-center text-amber-400 pt-5">=</div>
          <div className="w-full sm:w-auto sm:flex-1 mt-2 sm:mt-0">
            <label className="block text-xs text-amber-300/80 mb-1">Expected Token Amount</label>
            <div className="bg-gray-800 border border-amber-900/50 rounded px-3 py-2 text-white">
              {tokenAmount} Qatar
            </div>
          </div>
        </div>
        <div className="text-xs text-amber-300/70 mt-1">
          Based on current price: {currentPrice && typeof currentPrice === 'bigint' ? formatEther(currentPrice) : '0'} BNB / Qatar
        </div>
      </div>
      
      {/* Return Calculator */}
      <div className="mb-6 border-t border-amber-900/30 pt-4">
        <h3 className="text-md font-medium mb-3 text-amber-200 border-b border-amber-900/50 pb-1">Return Calculator</h3>
        <div className="mb-3">
          <label className="block text-xs text-amber-300/80 mb-1">Number of Price Increases</label>
          <input
            type="range"
            min="0"
            max="101"
            value={milestones}
            onChange={(e) => setMilestones(parseInt(e.target.value))}
            className="w-full accent-amber-600"
          />
          <div className="flex justify-between text-xs text-amber-300/70 mt-1">
            <span>Current</span>
            <span>{milestones} price increases</span>
            <span>101 price increases</span>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-amber-900/50 rounded-lg p-3 mb-3 shadow-inner">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="mb-2 sm:mb-0">
              <div className="text-amber-300/80 mb-1">Investment Amount</div>
              <div className="text-white font-medium">{bnbAmount} BNB</div>
            </div>
            <div className="mb-2 sm:mb-0">
              <div className="text-amber-300/80 mb-1">Expected Future Price</div>
              <div className="text-white font-medium">
                {initialPrice && typeof initialPrice === 'bigint'
                  ? ((Number(initialPrice) + (Number(initialPrice) * 0.2 * milestones)) / 10**18).toFixed(6)
                  : '0'} BNB / Qatar
              </div>
            </div>
            <div className="mb-2 sm:mb-0">
              <div className="text-amber-300/80 mb-1">Investment Value After Price Increase</div>
              <div className="text-white font-medium">{futureValue} BNB</div>
            </div>
            <div>
              <div className="text-amber-300/80 mb-1">Expected Return</div>
              <div className={`font-medium ${parseFloat(projectedReturn) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {parseFloat(projectedReturn) > 0
                  ? `+${projectedReturn} BNB (${returnPercentage}%)`
                  : `${projectedReturn} BNB (${returnPercentage}%)`}
              </div>
            </div>
          </div>
        </div>
        <div className="text-xs text-amber-300/70 mt-2">
          Note: No sell fee, consistent with contract
        </div>
      </div>
      
      {/* Purchase History */}
      <div className="border-t border-amber-900/30 pt-4">
        <h3 className="text-md font-medium mb-3 text-amber-200 border-b border-amber-900/50 pb-1">My Purchase History</h3>
        
        {isLoading ? (
          <div className="text-center py-4 text-amber-300/50">Loading...</div>
        ) : purchaseHistory.length > 0 ? (
          <>
            <div className="bg-gray-800 border border-amber-900/50 rounded-lg p-3 mb-3">
              <div className="text-xs text-amber-300/80 mb-1">Average Purchase Price</div>
              <div className="text-lg sm:text-xl font-bold text-amber-300">{averagePrice} BNB / Qatar</div>
            </div>
            
            <div className="space-y-2">
              {purchaseHistory.map((item, index) => (
                <div key={index} className="bg-gray-800 border border-amber-900/50 rounded p-2 text-xs">
                  <div className="flex flex-col sm:flex-row sm:justify-between mb-1">
                    <span className="text-amber-300/70">Block #{item.block}</span>
                    <span className="text-white font-medium mt-1 sm:mt-0">{item.tokens} Qatar</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="text-amber-300/70">Spent {item.bnb} BNB</span>
                    <span className="text-amber-300/70 mt-1 sm:mt-0">Price {item.price} BNB/Qatar</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-amber-300/50">
            {isConnected ? 'No purchase records' : 'Please connect your wallet first'}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentTools;
