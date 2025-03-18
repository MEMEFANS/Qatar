// 检查OKX钱包是否安装
export function isOkxWalletInstalled(): boolean {
  const { ethereum } = window as any;
  
  if (!ethereum) return false;
  
  // 检查是否有OKX钱包提供商
  return (
    ethereum.isOKExWallet ||
    ethereum.isOKXWallet ||
    (ethereum.providers && 
      ethereum.providers.some((provider: any) => 
        provider.isOKExWallet || provider.isOKXWallet
      )
    )
  );
}

// 连接到OKX钱包
export async function connectOkxWallet(): Promise<string | null> {
  try {
    const { ethereum } = window as any;
    
    if (!ethereum) {
      console.error('Ethereum object not found, OKX wallet not detected');
      return null;
    }
    
    // 确定使用哪个提供商
    let provider = ethereum;
    
    // 如果有多个提供商，找到OKX钱包提供商
    if (ethereum.providers) {
      const okxProvider = ethereum.providers.find((p: any) => p.isOKExWallet || p.isOKXWallet);
      if (okxProvider) {
        provider = okxProvider;
      }
    }
    
    // 请求账户
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    
    if (accounts && accounts.length > 0) {
      return accounts[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error connecting to OKX wallet:', error);
    throw error;
  }
}

// 安全地获取ethereum对象
export function getSafeEthereumProvider() {
  const { ethereum } = window as any;
  
  if (!ethereum) {
    console.warn('No ethereum provider found');
    return null;
  }
  
  return ethereum;
}

// 处理多提供商情况
export function getPreferredProvider() {
  const { ethereum } = window as any;
  
  if (!ethereum) return null;
  
  // 如果有providers数组，尝试找到OKX或TP钱包
  if (ethereum.providers && Array.isArray(ethereum.providers)) {
    // 优先选择OKX钱包
    const okxProvider = ethereum.providers.find((p: any) => p.isOKExWallet || p.isOKXWallet);
    if (okxProvider) return okxProvider;
    
    // 其次选择TokenPocket
    const tpProvider = ethereum.providers.find((p: any) => p.isTokenPocket);
    if (tpProvider) return tpProvider;
    
    // 如果都没有，返回第一个provider
    return ethereum.providers[0];
  }
  
  // 如果没有providers数组，直接返回ethereum
  return ethereum;
}

// Get OKX wallet accounts
export async function getOkxAccounts(): Promise<string[]> {
  try {
    const provider = getPreferredProvider();
    if (provider) {
      return await provider.request({ method: 'eth_requestAccounts' });
    }
    return [];
  } catch (error) {
    console.error('Failed to get OKX wallet accounts:', error);
    return [];
  }
}

// Listen for OKX wallet account changes
export function addOkxAccountsChangedListener(callback: (accounts: string[]) => void): void {
  try {
    const provider = getPreferredProvider();
    if (provider && provider.on) {
      provider.on('accountsChanged', callback);
    }
  } catch (error) {
    console.error('Failed to add OKX wallet accounts change listener:', error);
  }
}

// Detect common wallet providers
export function detectWalletProviders(): { name: string; installed: boolean }[] {
  return [
    {
      name: 'OKX Wallet',
      installed: isOkxWalletInstalled()
    },
    {
      name: 'MetaMask',
      installed: !!getSafeEthereumProvider()?.isMetaMask
    },
    {
      name: 'TokenPocket',
      installed: !!getSafeEthereumProvider()?.isTokenPocket
    },
    {
      name: 'Trust Wallet',
      installed: !!getSafeEthereumProvider()?.isTrust
    }
  ];
}
