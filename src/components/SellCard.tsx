import { useState, useEffect } from 'react';
import { useContractWrite, usePrepareContractWrite, useContractRead, useAccount } from 'wagmi';
import contractInfo from '../contracts/Qatar.json';
import { parseEther, formatEther } from 'viem';

export function SellCard() {
  const [amount, setAmount] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [bnbAmount, setBnbAmount] = useState('0');
  const [showGuide, setShowGuide] = useState(false);
  
  // Get user wallet address
  const { address } = useAccount();
  
  // Get current price
  const { data: currentPrice } = useContractRead({
    address: contractInfo.address as `0x${string}`,
    abi: contractInfo.abi,
    functionName: 'getCurrentPrice',
  });

  // Get user token balance
  const { data: userBalance, refetch: refetchBalance } = useContractRead({
    address: contractInfo.address as `0x${string}`,
    abi: contractInfo.abi,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    enabled: Boolean(address),
    watch: true
  });

  // Calculate expected BNB amount when user inputs token amount
  useEffect(() => {
    if (currentPrice && typeof currentPrice === 'bigint' && amount) {
      try {
        const tokenAmount = parseEther(amount);
        const calculatedBnb = (tokenAmount * currentPrice) / BigInt(10 ** 18);
        // No sell fee, previously was 3%
        const finalBnb = calculatedBnb;
        setBnbAmount((Number(finalBnb) / 10**18).toFixed(4));
      } catch (error) {
        console.error('Error calculating BNB amount:', error);
        setBnbAmount('0');
      }
    } else {
      setBnbAmount('0');
    }
  }, [amount, currentPrice]);
  
  const { config, error: prepareError, isError: isPrepareError } = usePrepareContractWrite({
    address: contractInfo.address as `0x${string}`,
    abi: contractInfo.abi,
    functionName: 'sell',
    args: amount ? [parseEther(amount)] : undefined,
    enabled: Boolean(amount && parseFloat(amount) > 0)
  });
  
  const { 
    write: sellTokens, 
    isLoading, 
    isSuccess, 
    isError, 
    error 
  } = useContractWrite(config);

  const handleSell = () => {
    if (!amount || !sellTokens) return;
    try {
      setStatusMessage('Preparing transaction...');
      sellTokens();
    } catch (err) {
      console.error('Sell failed:', err);
      setStatusMessage('Sell failed, please try again');
    }
  };

  // Update status message
  useEffect(() => {
    if (isPrepareError) {
      setStatusMessage(`Transaction preparation failed: ${prepareError?.message || 'Please check amount'}`);
    } else if (isLoading) {
      setStatusMessage('Processing...');
    } else if (isSuccess) {
      setStatusMessage('Sell successful!');
      setAmount('');
    } else if (isError) {
      setStatusMessage(`Sell failed: ${error?.message || 'Unknown error'}`);
    }
  }, [isPrepareError, prepareError, isLoading, isSuccess, isError, error]);

  // No sell fee (updated to 0%)
  const fee = 0;

  const handleMaxAmount = async () => {
    try {
      // Get user token balance from wallet
      if (userBalance && typeof userBalance === 'bigint') {
        setAmount(formatEther(userBalance));
      } else {
        // If unable to get balance, notify user
        setStatusMessage('Unable to get your token balance, please ensure your wallet is connected');
      }
    } catch (error) {
      console.error('Failed to get maximum amount:', error);
      setStatusMessage('Failed to get token balance');
    }
  };

  return (
    <div className="app-card p-0 overflow-hidden">
      <div className="app-card-header">
        <div className="flex justify-between items-center">
          <h3 className="text-lg md:text-xl font-medium text-amber-300">Sell Qatar Tokens</h3>
          <button 
            onClick={() => setShowGuide(!showGuide)}
            className="text-white rounded-full w-6 h-6 flex items-center justify-center text-sm bg-amber-800 hover:bg-amber-700 transition-all border border-amber-600/50"
            aria-label="View sell guide"
          >
            ?
          </button>
        </div>
      </div>
      
      <div className="app-card-body">
        {showGuide && (
          <div className="mb-4 p-3 bg-amber-900/20 rounded-md text-sm border border-amber-800/30">
            <h4 className="font-semibold mb-1 text-amber-300">Sell Guide</h4>
            <ul className="list-disc list-inside text-amber-100/80 space-y-1">
              <li>No fee for sell operations</li>
              <li>Sell amount cannot exceed your holdings</li>
              <li>Each transaction requires a small Gas fee</li>
              <li>Wallet connection required for operation</li>
            </ul>
          </div>
        )}
        
        <div className="metrics-grid">
          <div className="metric-card">
            <span className="metric-label">Current Price</span>
            <span className="metric-value">{currentPrice && typeof currentPrice === 'bigint' ? (Number(currentPrice) / 10**18).toFixed(6) : '0'} BNB</span>
          </div>
          
          <div className="metric-card">
            <span className="metric-label">Expected to Receive</span>
            <span className="metric-value">{bnbAmount} BNB</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Your Balance</span>
            <span className="metric-value">{userBalance && typeof userBalance === 'bigint' ? formatEther(userBalance) : '0'} Qatar</span>
          </div>
        </div>
        
        <div className="my-4">
          <label className="block text-amber-300/80 mb-2">Sell Amount</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter Qatar amount"
              className="w-full bg-gray-800 border border-amber-900/30 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-600/50 focus:border-transparent"
              min="0"
              step="0.01"
              disabled={isLoading}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-300">Qatar</span>
          </div>
          
          <div className="mt-2 flex justify-end">
            <button 
              onClick={handleMaxAmount} 
              className="px-3 py-1 text-xs bg-amber-800 hover:bg-amber-700 rounded text-amber-100 transition-colors border border-amber-700/50"
              disabled={isLoading}
            >
              Max
            </button>
          </div>
        </div>
        
        <div className="p-3 rounded-md bg-amber-900/20 mb-4 flex items-center border border-amber-800/30">
          <svg className="w-5 h-5 text-amber-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-amber-100/80">No transaction fee, only network Gas fee required</span>
        </div>
        
        {statusMessage && (
          <div className={`p-3 rounded-md mb-4 flex items-center space-x-2 ${
            isSuccess ? 'bg-green-900/20 text-green-400 border border-green-800/30' : 
            isError || isPrepareError ? 'bg-red-900/20 text-red-400 border border-red-800/30' : 'bg-amber-900/20 text-amber-300 border border-amber-800/30'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d={isSuccess 
                ? "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                : "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"} 
                clipRule="evenodd" 
              />
            </svg>
            <span>{statusMessage}</span>
          </div>
        )}
        
        <button
          onClick={handleSell}
          className={`w-full py-3 rounded-md font-medium transition-all duration-200 ${
            isLoading 
              ? 'bg-gray-600 cursor-not-allowed text-gray-300' 
              : 'bg-gradient-to-r from-amber-700 to-red-800 hover:from-amber-600 hover:to-red-700 text-white border border-amber-500/50 shadow-md'
          }`}
          disabled={!amount || !sellTokens || isLoading}
        >
          {isLoading ? 'Selling...' : 'Sell'}
        </button>
      </div>
    </div>
  );
}

export default SellCard;
