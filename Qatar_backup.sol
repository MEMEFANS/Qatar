// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Qatar is ERC20, Ownable, ReentrancyGuard {
    uint256 public constant TOTAL_SUPPLY = 1000000 * 10**18; // 100万总量
    uint256 public constant MIN_MINT_AMOUNT = 0.03 ether;    // 最小铸币量
    uint256 public constant MAX_MINT_AMOUNT = 1 ether;       // 最大铸币量
    uint256 public constant BNB_MILESTONE = 10 ether;        // 每10 BNB涨幅里程碑
    uint256 public constant TRANSACTION_FEE = 5;             // 0.5% 交易费
    uint256 public constant SELL_FEE = 0;                    // 0% 卖出费用
    
    uint256 public constant INITIAL_PRICE = 0.000158 ether;  // 初始铸币价格（常量）
    uint256 public currentPrice = INITIAL_PRICE;             // 当前铸币价格
    uint256 public totalBNBReceived;                         // 总收到的BNB
    uint256 public totalTokensMinted;                        // 已铸造的代币总量
    uint256 public burnedTokens;                             // 已销毁的代币数量
    
    address public burnPool;                                 // 销毁池地址
    
    event TokensMinted(address indexed user, uint256 amount, uint256 bnbAmount);
    event TokensBurned(address indexed from, uint256 amount);
    event TokensSold(address indexed user, uint256 tokenAmount, uint256 bnbAmount);
    event PriceUpdated(uint256 newPrice);
    
    constructor() ERC20("Qatar", "Qatar") Ownable(msg.sender) {
        burnPool = address(0x000000000000000000000000000000000000dEaD);
    }
    
    function mint() external payable nonReentrant {
        require(msg.value >= MIN_MINT_AMOUNT, "Amount below minimum");
        require(msg.value <= MAX_MINT_AMOUNT, "Amount above maximum");
        
        uint256 tokensToMint = (msg.value * 10**18) / currentPrice;
        require(tokensToMint > 0, "Zero tokens");
        require(totalTokensMinted + tokensToMint <= TOTAL_SUPPLY, "Exceeds total supply");
        
        totalBNBReceived += msg.value;
        totalTokensMinted += tokensToMint;
        
        // 每达到10 BNB涨幅20%（简单累加，非复利）
        uint256 milestoneCount = totalBNBReceived / BNB_MILESTONE;
        uint256 newPrice = INITIAL_PRICE + (INITIAL_PRICE * 20 * milestoneCount / 100);
        
        if(currentPrice != newPrice) {
            currentPrice = newPrice;
            emit PriceUpdated(currentPrice);
        }
        
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
        
        emit TokensSold(msg.sender, tokenAmount, bnbToSend);
    }
    
    // 自定义转账处理函数
    function _customTransfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal {
        require(sender != address(0), "Transfer from zero");
        require(recipient != address(0), "Transfer to zero");
        
        uint256 burnAmount = amount * TRANSACTION_FEE / 1000;  // 0.5% 销毁
        uint256 transferAmount = amount - burnAmount;
        
        super._transfer(sender, burnPool, burnAmount);
        super._transfer(sender, recipient, transferAmount);
        
        burnedTokens += burnAmount;
        emit TokensBurned(sender, burnAmount);
    }
    
    // 重写公共transfer函数
    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        _customTransfer(_msgSender(), recipient, amount);
        return true;
    }
    
    // 重写公共transferFrom函数
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public virtual override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(sender, spender, amount);
        _customTransfer(sender, recipient, amount);
        return true;
    }
    
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
}
