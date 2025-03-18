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
  // Prioritize wallets we want users to see and use
  featuredWalletIds: [
    'f2436c67184f158d1beda5df53298ee84abfc367581e4505134b5bcf5f46697d', // OKX Wallet
    '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927', // OKX Web3 Wallet
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // TokenPocket
    '20459438007b75f4f4acb98bf29aa3b800550309646d375da5fd4aac6c2a2c66', // TokenPocket
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // WalletConnect
  ],
  excludeWalletIds: [
    'ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18', // Coinbase
    '0b415a746fb9ee99cce155c2ceca0c6f6061b1dbca2d722b3ba16381d0562150', // MetaMask
    'd01c5bf5949c5b56f50a1da3628b8045ef4471cf5d3ceac33387619d35fed52c', // Ledger Live
    'cfb1742f22a9165f204b7f27613357a1153e21dd8b10e90943c2317fe9bd6439', // Crypto.com
    '5864e2ced7c293ed18ac35e0db085c09ed567d67346ccb6f58a0327a75137489', // Coinbase Wallet
    '7c998ead4436d945859e62641035059570650d83821c09df3932a8a0b51e7cf5', // MetaMask
    '8cecad66f28b67178e422419217ed0c4f667a10c2b4b5072cd431d26c18fcc66', // Trust
    'bc03dd6fd92e8555a5335baf091af6e7f96d67fcd3503b596850272c9a8a8f1f', // Crypto.com DeFi
    '9df9eb6f4886e33225704e80c3a0c4d78e9c4a628c043879a6d2bcc96304e51f', // Browser Wallet
  ],
  includeWalletIds: [
    'f2436c67184f158d1beda5df53298ee84abfc367581e4505134b5bcf5f46697d', // OKX Wallet
    '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927', // OKX Web3 Wallet
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // TokenPocket
    '20459438007b75f4f4acb98bf29aa3b800550309646d375da5fd4aac6c2a2c66', // TokenPocket
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // WalletConnect
  ],
  defaultChain: bscTestnet,
});

const queryClient = new QueryClient();

// Define navigation items
const navItems = [
  { id: 'token-info', label: 'Token Info', icon: '📊' },
  { id: 'token-economics', label: 'Token Economics', icon: '📈' },
  { id: 'buy-tokens', label: 'Buy', icon: '💰' },
  { id: 'sell-tokens', label: 'Sell', icon: '💸' },
  { id: 'my-holdings', label: 'My Holdings', icon: '👨‍💼' },
  { id: 'investment-tools', label: 'Investment', icon: '🔧' },
];

function App() {
  const [isMobile, setIsMobile] = useState(false); // Default false to avoid server-side rendering issues
  const [sidebarOpen, setSidebarOpen] = useState(false); // 默认移动端下侧边栏关闭
  const [activeSection, setActiveSection] = useState('token-info');
  const [isScrolled, setIsScrolled] = useState(false);

  // Safely check window size after component mount
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // 降低为768px以捕获更多移动设备
      setIsMobile(mobile);
      // 仅在非移动端下才默认打开侧边栏
      if (!mobile && !sidebarOpen) {
        setSidebarOpen(true);
      } else if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
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
  }, [sidebarOpen]); // 添加sidebarOpen作为依赖

  // Scroll to active section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // 添加一点偏移以考虑固定导航栏
      const headerOffset = 70;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
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
          <nav className={`app-navbar py-2 sm:py-3 px-3 sm:px-4 md:py-4 md:px-6 z-10 backdrop-blur-md bg-opacity-90 bg-gray-900 border-b border-amber-800 ${isScrolled ? 'shadow-lg shadow-amber-900/20' : ''}`}>
            <div className="container mx-auto flex justify-between items-center">
              <div className="flex items-center">
                {isMobile && (
                  <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)} 
                    className="mr-3 sm:mr-4 text-xl sm:text-2xl text-amber-400 focus:outline-none"
                    aria-label={sidebarOpen ? "Close Menu" : "Open Menu"}
                  >
                    {sidebarOpen ? '✕' : '☰'}
                  </button>
                )}
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold page-title text-amber-400">Qatar</h1>
                  <p className="text-xs sm:text-sm md:text-base text-amber-200">Qatar Token on BSC Chain</p>
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
              <div className="py-4 sm:py-6">
                {/* Qatar title banner - moved inside sidebar */}
                <div className="text-center py-4 sm:py-6 mb-4 bg-gradient-to-r from-amber-900 to-red-900 rounded-lg mx-4 border border-amber-600 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRoLTJWMGgydjM0em0tNCAwVjBoLTJ2MzRoMnptLTYgMFYwaC0ydjM0aDJ6bS02IDBoLTJWMGgydjM0em0tNiAwVjBoLTJ2MzRoMnptLTYgMFYwaC0ydjM0aDJ6Ii8+PHBhdGggZD0iTTAgMzZoMzR2LTJIMHYyem0wLTRoMzR2LTJIMHYyem0wLTZoMzR2LTJIMHYyem0wLTZoMzR2LTJIMHYyem0wLTZoMzR2LTJIMHYyeiIvPjwvZz48L2c+PC9zdmc+')]"></div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-wider text-amber-300">Qatar</h1>
                </div>
                
                <div className="space-y-1 px-4">
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
                <div className="mt-6 sm:mt-8 px-4 py-3 mx-4 bg-opacity-30 bg-amber-900 rounded-lg border border-amber-800">
                  <h4 className="text-xs sm:text-sm font-semibold mb-2 text-amber-300">Wallet Connection Help</h4>
                  <p className="text-xs text-amber-100">
                    Click the connect button in the top right corner and select your wallet type to connect. If you encounter issues, refresh the page and try again.
                  </p>
                </div>
              </div>
            </aside>
            
            {/* Mobile overlay - click to close sidebar */}
            {isMobile && sidebarOpen && (
              <div 
                className="mobile-overlay active" 
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
              />
            )}
            
            {/* Main content area */}
            <main className={`flex-1 transition-all duration-300 ease-in-out overflow-auto p-3 sm:p-4 md:p-6 ${sidebarOpen && !isMobile ? 'ml-64' : 'ml-0'}`}>
              <div className="max-w-md mx-auto px-3 sm:max-w-xl md:max-w-3xl">
                <div className="space-y-4 sm:space-y-6 md:space-y-8 py-2 sm:py-4">
                  {/* Token Info Section */}
                  <section id="token-info" className="scroll-section">
                    <div className="section-header mb-3 sm:mb-4 pb-2 border-b border-amber-900/30">
                      <h2 className="text-xl sm:text-2xl font-bold text-amber-300">Token Info</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 mb-4 sm:mb-6">
                      <TokenInfo />
                    </div>
                  </section>
                  
                  {/* Token Economics Dashboard */}
                  <section id="token-economics" className="scroll-section">
                    <div className="section-header mb-3 sm:mb-4 pb-2 border-b border-amber-900/30">
                      <h2 className="text-xl sm:text-2xl font-bold text-amber-300">Token Economics</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 mb-4 sm:mb-6">
                      <TokenEconomicsDashboard />
                    </div>
                  </section>
                  
                  {/* Investments Section */}
                  <section id="investments" className="scroll-section">
                    <div className="section-header mb-3 sm:mb-4 pb-2 border-b border-amber-900/30">
                      <h2 className="text-xl sm:text-2xl font-bold text-amber-300">Investments</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6">
                      <InvestmentTools />
                    </div>
                  </section>
                  
                  {/* User Holdings Section */}
                  <section id="user-holdings" className="scroll-section">
                    <div className="section-header mb-3 sm:mb-4 pb-2 border-b border-amber-900/30">
                      <h2 className="text-xl sm:text-2xl font-bold text-amber-300">Your Holdings</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 mb-4 sm:mb-6">
                      <UserHoldings />
                    </div>
                  </section>
                  
                  {/* Trading Section */}
                  <section id="trading" className="scroll-section">
                    <div className="section-header mb-3 sm:mb-4 pb-2 border-b border-amber-900/30">
                      <h2 className="text-xl sm:text-2xl font-bold text-amber-300">Trading</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div className="order-1 lg:order-1">
                        <MintCard />
                      </div>
                      <div className="order-2 lg:order-2">
                        <SellCard />
                      </div>
                    </div>
                  </section>
                  
                  {/* Footer */}
                  <footer className="mt-8 sm:mt-12 text-center text-sm text-amber-300/60 pb-4">
                    <p>&copy; 2025 Qatar Token. All rights reserved.</p>
                  </footer>
                </div>
              </div>
            </main>
          </div>
        </div>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export default App;
