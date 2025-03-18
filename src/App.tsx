import { createWeb3Modal } from '@web3modal/wagmi/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import MintCard from './components/MintCard';
import { TokenInfo } from './components/TokenInfo';
import SellCard from './components/SellCard';
import TokenEconomicsDashboard from './components/TokenEconomicsDashboard';
import UserHoldings from './components/UserHoldings';
import InvestmentTools from './components/InvestmentTools';
import { useState, useEffect } from 'react';

// Configure wagmi
const projectId = 'a8353b198592b0c96047933e3b13dca9';

const { chains, publicClient } = configureChains(
  [bscTestnet],
  [publicProvider()]
);

// Configure injected connector specifically for OKX Wallet and others
const injectedConnector = new InjectedConnector({
  chains,
  options: {
    name: (detectedName) => {
      // Ensure string type is returned
      if (typeof detectedName === 'string') {
        if (detectedName === 'OKX Wallet') return 'OKX Wallet';
        if (detectedName) return detectedName;
      }
      return 'Injected Wallet';
    },
    shimDisconnect: true,
  },
});

const walletConnectConnector = new WalletConnectConnector({
  chains,
  options: {
    projectId,
    showQrModal: true,
    metadata: {
      name: 'Qatar DApp',
      description: 'Qatar Token on BSC Chain',
      url: window.location.origin,
      icons: ['https://walletconnect.com/walletconnect-logo.png']
    }
  },
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    injectedConnector,
    walletConnectConnector
  ],
  publicClient,
});

// Configure Web3Modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  themeMode: 'dark',
  // Only display wallets we want, matching the design
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // WalletConnect
    'f2436c67184f158d1beda5df53298ee84abfc367581e4505134b5bcf5f46697d', // OKX Wallet
    '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927', // OKX Web3 Wallet
    'c4f79cc6b69a1e070b57cfcf53216b887041d770937671ec5fbd82d697210a9a', // Phantom
  ],
  // Must exclude other wallets to avoid displaying unspecified wallets
  excludeWalletIds: [
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // TokenPocket
    'ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18', // Coinbase
    '0b415a746fb9ee99cce155c2ceca0c6f6061b1dbca2d722b3ba16381d0562150', // MetaMask
    'efb3438f118d2176dc491ccd7858fbc6c1a05dd454d10e8e3e52dbd51e3adc9e', // Trust Wallet
    'd01c5bf5949c5b56f50a1da3628b8045ef4471cf5d3ceac33387619d35fed52c', // Ledger Live
    'cfb1742f22a9165f204b7f27613357a1153e21dd8b10e90943c2317fe9bd6439', // Crypto.com
    '20459438007b75f4f4acb98bf29aa3b800550309646d375da5fd4aac6c2a2c66', // TokenPocket
    '5864e2ced7c293ed18ac35e0db085c09ed567d67346ccb6f58a0327a75137489', // Coinbase Wallet
    '7c998ead4436d945859e62641035059570650d83821c09df3932a8a0b51e7cf5', // MetaMask
    '8cecad66f28b67178e422419217ed0c4f667a10c2b4b5072cd431d26c18fcc66', // Trust
    'bc03dd6fd92e8555a5335baf091af6e7f96d67fcd3503b596850272c9a8a8f1f', // Crypto.com DeFi
    '9df9eb6f4886e33225704e80c3a0c4d78e9c4a628c043879a6d2bcc96304e51f', // Browser Wallet
    // Add other wallet IDs you don't want to display
  ],
  includeWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // WalletConnect
    'f2436c67184f158d1beda5df53298ee84abfc367581e4505134b5bcf5f46697d', // OKX Wallet
    '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927', // OKX Web3 Wallet
    'c4f79cc6b69a1e070b57cfcf53216b887041d770937671ec5fbd82d697210a9a', // Phantom
  ],
  defaultChain: bscTestnet,
});

const queryClient = new QueryClient();

// Define navigation items
const navItems = [
  { id: 'token-info', label: 'Token Info', icon: '📊' },
  { id: 'token-economics', label: 'Token Economics', icon: '📈' },
  { id: 'buy-tokens', label: 'Buy Tokens', icon: '💰' },
  { id: 'sell-tokens', label: 'Sell Tokens', icon: '💸' },
  { id: 'my-holdings', label: 'My Holdings', icon: '👨‍💼' },
  { id: 'investment-tools', label: 'Investment Tools', icon: '🔧' },
];

function App() {
  const [isMobile, setIsMobile] = useState(false); // Default false to avoid server-side rendering issues
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('token-info');
  const [isScrolled, setIsScrolled] = useState(false);

  // Safely check window size after component mount
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    
    // Check immediately
    checkMobile();
    
    // Add event listener
    window.addEventListener('resize', checkMobile);
    
    // Listen for scroll events to add navbar shadow effect
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Empty dependency array, only run on component mount

  // Scroll to active section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setActiveSection(id);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Prevent sidebar scroll-through
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobile, sidebarOpen]);

  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
          {/* Top navigation bar - only shows hamburger menu on mobile */}
          <nav className={`app-navbar py-3 px-4 md:py-4 md:px-6 sticky top-0 z-10 backdrop-blur-md bg-opacity-80 bg-gray-900 border-b border-amber-800 ${isScrolled ? 'shadow-lg shadow-amber-900/20' : ''}`}>
            <div className="container mx-auto flex justify-between items-center">
              <div className="flex items-center">
                {isMobile && (
                  <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)} 
                    className="mr-4 text-2xl text-amber-400 focus:outline-none"
                    aria-label={sidebarOpen ? "Close Menu" : "Open Menu"}
                  >
                    {sidebarOpen ? '✕' : '☰'}
                  </button>
                )}
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold page-title text-amber-400">Qatar</h1>
                  <p className="text-sm md:text-base text-amber-200">Qatar Token on BSC Chain</p>
                </div>
              </div>
              <div className="text-right">
                <w3m-button balance="show" />
              </div>
            </div>
          </nav>
          
          <div className="flex flex-1 relative">
            {/* Sidebar navigation */}
            <aside className={`app-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
              <div className="py-4">
                {/* Qatar title banner - moved inside sidebar */}
                <div className="text-center py-6 mb-4 bg-gradient-to-r from-amber-900 to-red-900 rounded-lg mx-4 border border-amber-600 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRoLTJWMGgydjM0em0tNCAwVjBoLTJ2MzRoMnptLTYgMFYwaC0ydjM0aDJ6bS02IDBoLTJWMGgydjM0em0tNiAwVjBoLTJ2MzRoMnptLTYgMFYwaC0ydjM0aDJ6Ii8+PHBhdGggZD0iTTAgMzZoMzR2LTJIMHYyem0wLTRoMzR2LTJIMHYyem0wLTZoMzR2LTJIMHYyem0wLTZoMzR2LTJIMHYyem0wLTZoMzR2LTJIMHYyeiIvPjwvZz48L2c+PC9zdmc+')]"></div>
                  <h1 className="text-3xl font-bold tracking-wider text-amber-300">Qatar</h1>
                </div>
                
                <div className="space-y-2 px-4">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`app-nav-item ${activeSection === item.id ? 'active bg-gradient-to-r from-amber-900 to-red-800 border-l-2 border-amber-400' : 'hover:bg-gray-800 hover:border-l-2 hover:border-amber-600'}`}
                    >
                      <span className="mr-3 text-amber-400">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
                
                {/* Sidebar help information */}
                <div className="mt-8 px-4 py-3 mx-4 bg-opacity-30 bg-amber-900 rounded-lg border border-amber-800">
                  <h4 className="text-sm font-semibold mb-2 text-amber-300">Wallet Connection Help</h4>
                  <p className="text-xs text-amber-100">
                    Click the connect button in the top right corner and select your wallet type to connect. If you encounter issues, refresh the page and try again.
                  </p>
                </div>
              </div>
            </aside>
            
            {/* Modal background - click to close mobile sidebar */}
            {isMobile && sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
              />
            )}
            
            {/* Main content area */}
            <main className={`app-main-content ${!isMobile && sidebarOpen ? 'with-sidebar' : 'full-width'}`}>
              <div className="container mx-auto px-4 py-6">
                {/* Background pattern for luxury feel */}
                <div className="fixed inset-0 z-0 opacity-5 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJnb2xkIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zMCAzMGMwLTEzLjA0NiA2LjU0My0yMCAxNS0yMHYyYy07LjM2NSAwLTEzIDYuMjY5LTEzIDE4IDAgMTEuNzMxIDUuNjM1IDE4IDEzIDE4djJjLTguNDU3IDAgMTUtNi45NTQtMTUtMjB6bTAgMGMwIDEzLjA0Ni06LjU0MyAyMC0xNSAyMHYtMmM3LjM2NSAwIDEzLTYuMjY5IDEzLTE4IDAtMTEuNzMxLTUuNjM1LTE4LTEzLTE4di0yYzguNDU3IDAgMTUgNi45NTQgMTUgMjB6Ii8+PC9nPjwvc3ZnPg==')]"></div>
                
                {/* Main content area */}
                <div className="space-y-10 relative z-10">
                  {/* Token info section */}
                  <section id="token-info" className="app-section fade-in">
                    <h2 className="section-title text-amber-300 border-b border-amber-900 pb-2">Token Info</h2>
                    <div className="app-card bg-gradient-to-br from-gray-900 to-gray-800 border border-amber-900/30 shadow-lg shadow-amber-900/10">
                      <div className="app-card-body">
                        <TokenInfo />
                      </div>
                    </div>
                  </section>
                  
                  {/* Token economics */}
                  <section id="token-economics" className="app-section fade-in">
                    <h2 className="section-title text-amber-300 border-b border-amber-900 pb-2">Token Economics</h2>
                    <div className="app-card bg-gradient-to-br from-gray-900 to-gray-800 border border-amber-900/30 shadow-lg shadow-amber-900/10">
                      <div className="app-card-body">
                        <TokenEconomicsDashboard />
                      </div>
                    </div>
                  </section>
                  
                  {/* Buy tokens */}
                  <section id="buy-tokens" className="app-section fade-in">
                    <h2 className="section-title text-amber-300 border-b border-amber-900 pb-2">Buy Tokens</h2>
                    <div className="app-card bg-gradient-to-br from-gray-900 to-gray-800 border border-amber-900/30 shadow-lg shadow-amber-900/10">
                      <div className="app-card-body">
                        <MintCard />
                      </div>
                    </div>
                  </section>
                  
                  {/* Sell tokens */}
                  <section id="sell-tokens" className="app-section fade-in">
                    <h2 className="section-title text-amber-300 border-b border-amber-900 pb-2">Sell Tokens</h2>
                    <div className="app-card bg-gradient-to-br from-gray-900 to-gray-800 border border-amber-900/30 shadow-lg shadow-amber-900/10">
                      <div className="app-card-body">
                        <SellCard />
                      </div>
                    </div>
                  </section>
                  
                  {/* My holdings */}
                  <section id="my-holdings" className="app-section fade-in">
                    <h2 className="section-title text-amber-300 border-b border-amber-900 pb-2">My Holdings</h2>
                    <div className="app-card bg-gradient-to-br from-gray-900 to-gray-800 border border-amber-900/30 shadow-lg shadow-amber-900/10">
                      <div className="app-card-body">
                        <UserHoldings />
                      </div>
                    </div>
                  </section>
                  
                  {/* Investment tools */}
                  <section id="investment-tools" className="app-section fade-in">
                    <h2 className="section-title text-amber-300 border-b border-amber-900 pb-2">Investment Tools</h2>
                    <div className="app-card bg-gradient-to-br from-gray-900 to-gray-800 border border-amber-900/30 shadow-lg shadow-amber-900/10">
                      <div className="app-card-body">
                        <InvestmentTools />
                      </div>
                    </div>
                  </section>
                </div>

                {/* Footer information area */}
                <footer className="mt-16 text-center text-amber-400 pb-10 fade-in">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-amber-900"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-gray-900 px-4 text-sm">2025 Qatar</span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center space-x-2">
                    <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                    <div className="w-2 h-2 bg-red-800 rounded-full"></div>
                    <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                  </div>
                </footer>
              </div>
            </main>
            
            {/* Mobile overlay to close sidebar when clicking outside */}
            {isMobile && sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-10" 
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </div>
        </div>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export default App;
