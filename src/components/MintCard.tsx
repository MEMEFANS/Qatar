import { useState, useEffect } from 'react';
import { useQatarContract } from '../hooks/useQatarContract';
import { parseEther, formatEther } from 'viem';

const MintCard = () => {
  const [bnbAmount, setBnbAmount] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  
  const { 
    currentPrice, 
    handleMint, 
    isMintLoading, 
    isMintSuccess, 
    isMintError, 
    mintError,
    isMintConfirmed,
    refreshAll
  } = useQatarContract();

  // Validate input amount
  const validateAmount = (amount: string) => {
    const MIN_AMOUNT = 0.03;
    const MAX_AMOUNT = 1;
    const numAmount = Number(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      return 'Please enter a valid amount';
    }
    
    if (numAmount < MIN_AMOUNT) {
      return `Minimum purchase amount is ${MIN_AMOUNT} BNB`;
    }
    
    if (numAmount > MAX_AMOUNT) {
      return `Maximum purchase amount is ${MAX_AMOUNT} BNB`;
    }
    
    return '';
  };

  // Process minting
  const processMint = () => {
    const error = validateAmount(bnbAmount);
    if (error) {
      setStatusMessage(error);
      return;
    }
    
    try {
      const bnbAmountWei = parseEther(bnbAmount);
      handleMint(bnbAmountWei);
      setStatusMessage('Submitting...');
    } catch (e) {
      console.error('Minting error:', e);
      setStatusMessage('Minting failed, please try again');
    }
  };

  // Update status message
  useEffect(() => {
    if (isMintLoading) {
      setStatusMessage('Processing...');
    } else if (isMintSuccess) {
      setStatusMessage('Minting successful!');
      // Don't clear input immediately, wait for transaction confirmation
    } else if (isMintError) {
      setStatusMessage(`Minting failed: ${mintError?.message || 'Unknown error'}`);
    }
  }, [isMintLoading, isMintSuccess, isMintError, mintError]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isMintConfirmed) {
      setBnbAmount(''); // Reset input
      setStatusMessage('Transaction confirmed, tokens minted!');
      // Refresh all data
      refreshAll();
    }
  }, [isMintConfirmed, refreshAll]);

  // Format tokens with appropriate decimals or abbreviations for mobile
  const formatTokens = (amount: number): string => {
    const isMobile = window.innerWidth < 640;
    if (isMobile && amount > 10000) {
      return amount >= 1000000 
        ? (amount / 1000000).toFixed(2) + 'M'
        : (amount / 1000).toFixed(2) + 'K';
    }
    return amount.toFixed(2);
  };

  // Calculate expected token amount
  const [expectedTokens, setExpectedTokens] = useState('0');
  
  useEffect(() => {
    if (bnbAmount && currentPrice && typeof currentPrice === 'bigint' && currentPrice > 0) {
      // According to contract logic: tokensToMint = (msg.value * 10**18) / currentPrice
      const bnbAmountWei = parseEther(bnbAmount);
      const calculatedTokens = Number(formatEther(bnbAmountWei * BigInt(10 ** 18) / currentPrice));
      setExpectedTokens(formatTokens(calculatedTokens));
    } else {
      setExpectedTokens('0');
    }
  }, [bnbAmount, currentPrice]);

  return (
    <div className="app-card p-0 overflow-hidden">
      <div className="app-card-header">
        <div className="flex justify-between items-center">
          <h3 className="text-lg md:text-xl font-medium text-amber-300">Buy Qatar Tokens</h3>
          <button 
            onClick={() => setShowGuide(!showGuide)}
            className="text-white rounded-full w-6 h-6 flex items-center justify-center text-sm bg-amber-800 hover:bg-amber-700 transition-all border border-amber-600/50"
            aria-label="View minting guide"
          >
            ?
          </button>
        </div>
      </div>
      
      <div className="app-card-body">
        {showGuide && (
          <div className="mb-4 p-3 bg-amber-900/20 rounded-md text-sm border border-amber-800/30">
            <h4 className="font-semibold mb-1 text-amber-300">Minting Guide</h4>
            <ul className="list-disc list-inside text-amber-100/80 space-y-1">
              <li>BNB amount must be between 0.03 and 1</li>
              <li>Each mint calculates tokens based on current price</li>
              <li>Price increases after successful minting</li>
              <li>Wallet connection required for operation</li>
            </ul>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-800 p-3 rounded-lg border border-amber-900/20">
            <span className="text-xs text-amber-300/80 block mb-1">Current Price</span>
            <span className="text-sm sm:text-base font-semibold text-amber-300 truncate block">
              {currentPrice && typeof currentPrice === 'bigint' 
                ? Number(formatEther(currentPrice)).toFixed(6) 
                : '0.000158'} BNB
            </span>
          </div>
          
          <div className="bg-gray-800 p-3 rounded-lg border border-amber-900/20">
            <span className="text-xs text-amber-300/80 block mb-1">Expected to Receive</span>
            <span className="text-sm sm:text-base font-semibold text-amber-300 truncate block">
              {expectedTokens} Qatar
            </span>
          </div>
        </div>
        
        <div className="my-4">
          <label className="block text-amber-300/80 mb-2 text-sm">BNB Amount (0.03-1)</label>
          <div className="relative">
            <input
              type="number"
              value={bnbAmount}
              onChange={(e) => setBnbAmount(e.target.value)}
              placeholder="Enter BNB amount"
              className="w-full bg-gray-800 border border-amber-900/30 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-600/50 focus:border-transparent"
              min="0.03"
              max="1"
              step="0.01"
              disabled={isMintLoading}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-300 text-sm">BNB</span>
          </div>
          
          <div className="mt-2 grid grid-cols-4 gap-2">
            <button 
              onClick={() => setBnbAmount('0.03')} 
              className="px-2 py-1 text-xs bg-amber-800 hover:bg-amber-700 rounded text-amber-100 transition-colors border border-amber-700/50"
              disabled={isMintLoading}
            >
              Min
            </button>
            <button 
              onClick={() => setBnbAmount('0.1')} 
              className="px-2 py-1 text-xs bg-amber-800 hover:bg-amber-700 rounded text-amber-100 transition-colors border border-amber-700/50"
              disabled={isMintLoading}
            >
              0.1
            </button>
            <button 
              onClick={() => setBnbAmount('0.5')} 
              className="px-2 py-1 text-xs bg-amber-800 hover:bg-amber-700 rounded text-amber-100 transition-colors border border-amber-700/50"
              disabled={isMintLoading}
            >
              0.5
            </button>
            <button 
              onClick={() => setBnbAmount('1')} 
              className="px-2 py-1 text-xs bg-amber-800 hover:bg-amber-700 rounded text-amber-100 transition-colors border border-amber-700/50"
              disabled={isMintLoading}
            >
              Max
            </button>
          </div>
        </div>
        
        {statusMessage && (
          <div className={`p-3 rounded-md mb-4 flex items-center space-x-2 text-sm ${
            isMintSuccess ? 'bg-green-900/20 text-green-400 border border-green-800/30' : 
            isMintError ? 'bg-red-900/20 text-red-400 border border-red-800/30' : 'bg-amber-900/20 text-amber-300 border border-amber-800/30'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d={isMintSuccess 
                ? "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                : "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"} 
                clipRule="evenodd" 
              />
            </svg>
            <span className="truncate">{statusMessage}</span>
          </div>
        )}
        
        <button
          onClick={processMint}
          className={`w-full py-3 rounded-md font-medium transition-all duration-200 ${
            isMintLoading 
              ? 'bg-gray-600 cursor-not-allowed text-gray-300' 
              : 'bg-gradient-to-r from-amber-700 to-red-800 hover:from-amber-600 hover:to-red-700 text-white border border-amber-500/50 shadow-md'
          }`}
          disabled={!bnbAmount || Number(bnbAmount) < 0.03 || Number(bnbAmount) > 1 || isMintLoading}
        >
          {isMintLoading ? 'Minting...' : 'Mint'}
        </button>
      </div>
    </div>
  );
};

export default MintCard;
