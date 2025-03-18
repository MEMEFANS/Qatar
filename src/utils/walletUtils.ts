// Check if OKX wallet is installed
export function isOkxWalletInstalled(): boolean {
  // @ts-ignore - OKX wallet adds okxwallet to the window object
  const provider = window.okxwallet;
  return !!provider;
}

// Get OKX wallet accounts
export async function getOkxAccounts(): Promise<string[]> {
  try {
    // @ts-ignore
    const provider = window.okxwallet;
    if (provider) {
      return await provider.request({ method: 'eth_requestAccounts' });
    }
    return [];
  } catch (error) {
    console.error('Failed to get OKX wallet accounts:', error);
    return [];
  }
}

// Connect OKX wallet
export async function connectOkxWallet(): Promise<string | null> {
  try {
    // @ts-ignore
    const provider = window.okxwallet;
    if (provider) {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        return accounts[0];
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to connect OKX wallet:', error);
    return null;
  }
}

// Listen for OKX wallet account changes
export function addOkxAccountsChangedListener(callback: (accounts: string[]) => void): void {
  try {
    // @ts-ignore
    const provider = window.okxwallet;
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
      // @ts-ignore
      installed: !!window.okxwallet
    },
    {
      name: 'MetaMask',
      // @ts-ignore
      installed: !!window.ethereum?.isMetaMask
    },
    {
      name: 'TokenPocket',
      // @ts-ignore
      installed: !!window.ethereum?.isTokenPocket
    },
    {
      name: 'Trust Wallet',
      // @ts-ignore
      installed: !!window.ethereum?.isTrust
    }
  ];
}
