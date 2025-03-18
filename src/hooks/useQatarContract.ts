import { useEffect, useState } from 'react';
import { useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import contractInfo from '../contracts/Qatar.json';

export function useQatarContract() {
  const [mintAmount, setMintAmount] = useState<bigint | null>(null);
  const [mintHash, setMintHash] = useState<`0x${string}` | null>(null);

  // 读取当前价格
  const { 
    data: currentPrice,
    refetch: refetchPrice 
  } = useContractRead({
    address: contractInfo.address as `0x${string}`,
    abi: contractInfo.abi,
    functionName: 'getCurrentPrice',
  });

  // 读取已铸造代币总量
  const { 
    data: totalMinted,
    refetch: refetchMinted 
  } = useContractRead({
    address: contractInfo.address as `0x${string}`,
    abi: contractInfo.abi,
    functionName: 'getTotalMinted',
  });

  // 读取已销毁代币数量
  const { 
    data: burnedTokens,
    refetch: refetchBurned 
  } = useContractRead({
    address: contractInfo.address as `0x${string}`,
    abi: contractInfo.abi,
    functionName: 'getBurnedTokens',
  });

  // 准备铸造交易
  const { config: mintConfig } = usePrepareContractWrite({
    address: contractInfo.address as `0x${string}`,
    abi: contractInfo.abi,
    functionName: 'mint',
    value: mintAmount || BigInt(0),
    enabled: mintAmount !== null && mintAmount > BigInt(0),
  });

  // 执行铸造
  const {
    write: mintWrite,
    data: mintData,
    isLoading: isMintLoading,
    isSuccess: isMintSuccess,
    isError: isMintError,
    error: mintError
  } = useContractWrite(mintConfig);

  // 等待交易确认
  const { isSuccess: isMintConfirmed } = useWaitForTransaction({
    hash: mintData?.hash,
    onSuccess: () => {
      // 交易确认后刷新数据
      refetchPrice();
      refetchMinted();
      refetchBurned();
      setMintHash(mintData?.hash || null);
    }
  });

  const handleMint = (value: bigint) => {
    try {
      setMintAmount(value);
    } catch (error) {
      console.error("Error preparing mint transaction:", error);
    }
  };

  // 当 mintAmount 改变且 mintWrite 可用时，自动执行铸造
  useEffect(() => {
    if (mintAmount && mintWrite) {
      mintWrite();
    }
  }, [mintAmount, mintWrite]);

  // 格式化数据
  const formattedPrice = currentPrice ? formatEther(currentPrice as bigint) : '0';
  const formattedMinted = totalMinted ? formatEther(totalMinted as bigint) : '0';
  const formattedBurned = burnedTokens ? formatEther(burnedTokens as bigint) : '0';

  // 提供刷新方法，可以在需要的时候手动调用
  const refreshAll = () => {
    refetchPrice();
    refetchMinted();
    refetchBurned();
  };

  return {
    currentPrice,
    totalMinted,
    burnedTokens,
    formattedPrice,
    formattedMinted,
    formattedBurned,
    handleMint,
    isMintLoading,
    isMintSuccess,
    isMintError,
    mintError,
    isMintConfirmed,
    mintHash,
    refreshAll // 导出刷新方法
  };
}
