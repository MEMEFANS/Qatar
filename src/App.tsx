import React, { useState, useEffect } from 'react';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';
import { publicProvider } from '@wagmi/core/providers/public';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import MintCard from './components/MintCard';
import { TokenInfo } from './components/TokenInfo';
import SellCard from './components/SellCard';
import TokenEconomicsDashboard from './components/TokenEconomicsDashboard';
import UserHoldings from './components/UserHoldings';
import InvestmentTools from './components/InvestmentTools';

import './styles/main.css';

// Define navigation items
const navItems = [
  { id: 'token-info', label: 'Token Info', icon: '📊' },
  { id: 'token-economics', label: 'Token Economics', icon: '📈' },
  { id: 'buy-tokens', label: 'Buy', icon: '💰' },
  { id: 'sell-tokens', label: 'Sell', icon: '🔄' },
  { id: 'my-holdings', label: 'My Holdings', icon: '👤' },
  { id: 'investment-tools', label: 'Investment', icon: '🔧' },
];

// 创建一个QueryClient实例
const queryClient = new QueryClient();

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('token-info');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Detect scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Scroll to active section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 70;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setActiveSection(id);
  };

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
    chains
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900/20 via-gray-900 to-amber-950/30 text-white flex flex-col">
      <WagmiConfig config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {/* 顶部导航栏 - 中东土豪风格 */}
          <nav className={`sticky top-0 py-3 px-4 z-50 backdrop-blur-md bg-opacity-90 bg-gradient-to-r from-amber-900 to-amber-800 border-b-2 border-amber-500 ${isScrolled ? 'shadow-lg shadow-amber-900/30' : ''}`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="mr-3 text-amber-300 hover:text-amber-100"
                >
                  <img src="/menu-icon.svg" alt="Menu" className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-amber-300 drop-shadow-md">Qatar</h1>
                  <p className="text-xs text-amber-200">Qatar Token on BSC Chain</p>
                </div>
              </div>
              <div className="text-right">
                <w3m-button balance="show" />
              </div>
            </div>
          </nav>
            
          {/* 侧边栏导航 - 中东土豪风格 */}
          <div className={`fixed top-16 left-0 bottom-0 w-64 bg-gradient-to-b from-amber-900 to-amber-800 border-r-2 border-amber-500 shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-40`}>
            <div className="flex flex-col py-4 h-full">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    scrollToSection(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`flex items-center py-3 px-4 ${activeSection === item.id ? 'bg-amber-800' : 'hover:bg-amber-800/50'}`}
                >
                  <span className={`text-xl mr-3 ${activeSection === item.id ? 'text-yellow-300' : 'text-amber-200'}`}>
                    {item.icon}
                  </span>
                  <span className={`${activeSection === item.id ? 'text-yellow-300 font-medium' : 'text-amber-200'}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* 添加遮罩层，点击时关闭侧边栏 */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-30"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          )}
          
          {/* 内容区域 - 中东土豪风格 */}
          <main className="flex-1 overflow-auto p-4 pb-20 bg-pattern-qatar">
            <div className="mx-auto">
              <div className="space-y-6 py-2">
                {/* Token Info Section */}
                <section id="token-info" className="scroll-section bg-gradient-to-r from-gray-900/80 to-amber-950/80 rounded-lg p-4 border border-amber-700/30 shadow-lg">
                  <div className="section-header mb-3 pb-2 border-b border-amber-700/50 flex items-center">
                    <div className="w-6 h-6 mr-2 bg-amber-500 rounded-full flex items-center justify-center text-amber-950 text-xs">QT</div>
                    <h2 className="text-lg font-bold text-amber-300">Token Info</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-3 mb-5">
                    <TokenInfo />
                  </div>
                </section>
                
                {/* Token Economics Dashboard */}
                <section id="token-economics" className="scroll-section bg-gradient-to-r from-gray-900/80 to-amber-950/80 rounded-lg p-4 border border-amber-700/30 shadow-lg">
                  <div className="section-header mb-3 pb-2 border-b border-amber-700/50 flex items-center">
                    <div className="w-6 h-6 mr-2 bg-amber-500 rounded-full flex items-center justify-center text-amber-950 text-xs">QT</div>
                    <h2 className="text-lg font-bold text-amber-300">Token Economics</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-3 mb-5">
                    <TokenEconomicsDashboard />
                  </div>
                </section>
                
                {/* Buy Section (MINT) */}
                <section id="buy-tokens" className="scroll-section bg-gradient-to-r from-gray-900/80 to-amber-950/80 rounded-lg p-4 border border-amber-700/30 shadow-lg">
                  <div className="section-header mb-3 pb-2 border-b border-amber-700/50 flex items-center">
                    <div className="w-6 h-6 mr-2 bg-amber-500 rounded-full flex items-center justify-center text-amber-950 text-xs">QT</div>
                    <h2 className="text-lg font-bold text-amber-300">Buy Tokens</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-3 mb-5">
                    <MintCard />
                  </div>
                </section>
                
                {/* Sell Section */}
                <section id="sell-tokens" className="scroll-section bg-gradient-to-r from-gray-900/80 to-amber-950/80 rounded-lg p-4 border border-amber-700/30 shadow-lg">
                  <div className="section-header mb-3 pb-2 border-b border-amber-700/50 flex items-center">
                    <div className="w-6 h-6 mr-2 bg-amber-500 rounded-full flex items-center justify-center text-amber-950 text-xs">QT</div>
                    <h2 className="text-lg font-bold text-amber-300">Sell Tokens</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-3 mb-5">
                    <SellCard />
                  </div>
                </section>
                
                {/* User Holdings Section */}
                <section id="my-holdings" className="scroll-section bg-gradient-to-r from-gray-900/80 to-amber-950/80 rounded-lg p-4 border border-amber-700/30 shadow-lg">
                  <div className="section-header mb-3 pb-2 border-b border-amber-700/50 flex items-center">
                    <div className="w-6 h-6 mr-2 bg-amber-500 rounded-full flex items-center justify-center text-amber-950 text-xs">QT</div>
                    <h2 className="text-lg font-bold text-amber-300">Your Holdings</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-3 mb-5">
                    <UserHoldings />
                  </div>
                </section>
                
                {/* Investment Tools Section */}
                <section id="investment-tools" className="scroll-section bg-gradient-to-r from-gray-900/80 to-amber-950/80 rounded-lg p-4 border border-amber-700/30 shadow-lg">
                  <div className="section-header mb-3 pb-2 border-b border-amber-700/50 flex items-center">
                    <div className="w-6 h-6 mr-2 bg-amber-500 rounded-full flex items-center justify-center text-amber-950 text-xs">QT</div>
                    <h2 className="text-lg font-bold text-amber-300">Investment Tools</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-3 mb-5">
                    <InvestmentTools />
                  </div>
                </section>
                
                {/* Footer */}
                <footer className="mt-8 text-center text-xs text-amber-300/60 pb-16 border-t border-amber-700/30 pt-4">
                  <p>&copy; 2025 Qatar Token. All rights reserved.</p>
                </footer>
              </div>
            </div>
          </main>
        </QueryClientProvider>
      </WagmiConfig>
    </div>
  );
}

export default App;
