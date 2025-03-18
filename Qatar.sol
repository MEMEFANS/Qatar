// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Qatar is ERC20, Ownable, ReentrancyGuard {
    // 常量定义
    uint256 public constant TOTAL_SUPPLY = 1000000 * 10**18; // 100万总量
    uint256 public constant MIN_MINT_AMOUNT = 0.03 ether;    // 最小铸币量
    uint256 public constant MAX_MINT_AMOUNT = 1 ether;       // 最大铸币量
    uint256 public constant BNB_MILESTONE = 10 ether;        // 每10 BNB涨幅里程碑
    uint256 public constant TRANSACTION_FEE = 5;             // 0.5% 交易费
    uint256 public constant SELL_FEE = 0;                    // 0% 卖出费用
    uint256 public constant INITIAL_PRICE = 0.000158 ether;  // 初始铸币价格

    // 状态变量
    uint256 public currentPrice = INITIAL_PRICE;             // 当前铸币价格
    uint256 public totalBNBReceived;                         // 总收到的BNB
    uint256 public totalBNBRedeemed;                         // 总兑换的BNB
    uint256 public totalTokensMinted;                        // 已铸造的代币总量
    uint256 public burnedTokens;                             // 已销毁的代币数量
    address public burnPool;                                 // 销毁池地址

    // 事件定义
    event TokensMinted(address indexed user, uint256 amount, uint256 bnbAmount);
    event TokensBurned(address indexed from, uint256 amount);
    event TokensSold(address indexed user, uint256 tokenAmount, uint256 bnbAmount);
    event PriceUpdated(uint256 newPrice);

    // 构造函数
    constructor() ERC20("Qatar", "Qatar") Ownable(msg.sender) {
        burnPool = address(0x000000000000000000000000000000000000dEaD);
    }

    // 铸造功能
    function mint() external payable nonReentrant {
        require(msg.value >= MIN_MINT_AMOUNT, "Amount below minimum");
        require(msg.value <= MAX_MINT_AMOUNT, "Amount above maximum");
        
        uint256 tokensToMint = (msg.value * 10**18) / currentPrice;
        require(tokensToMint > 0, "Zero tokens");
        require(totalTokensMinted + tokensToMint <= TOTAL_SUPPLY, "Exceeds total supply");
        
        totalBNBReceived += msg.value;
        totalTokensMinted += tokensToMint;
        
        // 更新价格 - 使用净流入BNB计算
        updatePrice();
        
        _mint(msg.sender, tokensToMint);
        emit TokensMinted(msg.sender, tokensToMint, msg.value);
    }
    
    // 卖出代币功能
    function sell(uint256 tokenAmount) external nonReentrant {
        require(tokenAmount > 0, "Cannot sell zero tokens");
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient token balance");
        require(address(this).balance > 0, "Contract has no BNB");
        
        // 计算BNB数量，应用卖出费用
        uint256 bnbAmount = (tokenAmount * currentPrice) / 10**18;
        uint256 fee = (bnbAmount * SELL_FEE) / 1000; // 0% 卖出费用
        uint256 bnbToSend = bnbAmount - fee;
        
        require(address(this).balance >= bnbToSend, "Insufficient BNB in contract");
        
        // 销毁代币
        _burn(msg.sender, tokenAmount);
        burnedTokens += tokenAmount;
        
        // 发送BNB
        (bool success, ) = payable(msg.sender).call{value: bnbToSend}("");
        require(success, "Failed to send BNB");
        
        totalBNBRedeemed += bnbToSend; // 更新总兑换的BNB
        
        // 更新价格 - 卖出后重新计算价格
        updatePrice();
        
        emit TokensSold(msg.sender, tokenAmount, bnbToSend);
    }
    
    // 重写标准transfer函数
    function transfer(address to, uint256 amount) public override returns (bool) {
        address owner = _msgSender();
        require(owner != address(0), "Transfer from zero");
        require(to != address(0), "Transfer to zero");
        
        uint256 burnAmount = amount * TRANSACTION_FEE / 1000; // 计算0.5%的销毁量
        uint256 transferAmount = amount - burnAmount;        // 实际转账数量
        
        // 销毁部分
        super.transfer(burnPool, burnAmount);
        burnedTokens += burnAmount;
        emit TokensBurned(owner, burnAmount);
        
        // 转账部分
        bool success = super.transfer(to, transferAmount);
        return success;
    }
    
    // 重写标准transferFrom函数
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        require(from != address(0), "Transfer from zero");
        require(to != address(0), "Transfer to zero");
        
        uint256 burnAmount = amount * TRANSACTION_FEE / 1000; // 计算0.5%的销毁量
        uint256 transferAmount = amount - burnAmount;        // 实际转账数量
        
        // 使用allowance
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        
        // 销毁部分 - 使用super调用父类方法
        super._transfer(from, burnPool, burnAmount);
        burnedTokens += burnAmount;
        emit TokensBurned(from, burnAmount);
        
        // 转账部分 - 使用super调用父类方法
        super._transfer(from, to, transferAmount);
        return true;
    }
    
    // 提取特定金额的BNB
    function withdrawBNB(uint256 amount) external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance >= amount, "Insufficient balance");
        require(amount > 0, "Amount must be greater than 0");
        payable(owner()).transfer(amount);
    }
    
    // 提取全部BNB
    function withdrawAllBNB() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No BNB to withdraw");
        payable(owner()).transfer(balance);
    }
    
    // 查看当前价格
    function getCurrentPrice() external view returns (uint256) {
        return currentPrice;
    }
    
    // 查看已铸造代币数量
    function getTotalMinted() external view returns (uint256) {
        return totalTokensMinted;
    }
    
    // 查看已销毁代币数量
    function getBurnedTokens() external view returns (uint256) {
        return burnedTokens;
    }
    
    // 查看合约BNB余额
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // 查看总接收的BNB
    function getTotalBNBReceived() external view returns (uint256) {
        return totalBNBReceived;
    }
    
    // 查看总兑换的BNB
    function getTotalBNBRedeemed() external view returns (uint256) {
        return totalBNBRedeemed;
    }
    
    // 查看剩余可铸造代币量
    function getRemainingSupply() external view returns (uint256) {
        return TOTAL_SUPPLY - totalTokensMinted;
    }
    
    // 更新价格 - 使用净流入BNB计算
    function updatePrice() internal {
        if (totalBNBReceived <= totalBNBRedeemed) {
            // 如果净流入为负或零，价格回到初始值
            currentPrice = INITIAL_PRICE;
            emit PriceUpdated(currentPrice);
            return;
        }
        
        // 计算净流入BNB
        uint256 netBNBInflow = totalBNBReceived - totalBNBRedeemed;
        
        // 使用净流入计算里程碑数量
        uint256 milestoneCount = netBNBInflow / BNB_MILESTONE;
        uint256 newPrice = INITIAL_PRICE + (INITIAL_PRICE * 20 * milestoneCount / 100);
        
        if(currentPrice != newPrice) {
            currentPrice = newPrice;
            emit PriceUpdated(currentPrice);
        }
    }
}
