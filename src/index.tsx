import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/main.css'; 
import App from './App';

// 检查window.ethereum是否已被定义，防止重复定义
if (!window.ethereum) {
  // 只有在未定义时才尝试初始化
  try {
    // 尝试初始化ethereum相关代码
  } catch (error) {
    console.warn('Failed to initialize ethereum object:', error);
  }
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
