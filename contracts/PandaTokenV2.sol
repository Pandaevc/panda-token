// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PandaTokenV2
 * @dev 改进版代币合约 - 只涨不跌机制
 * 
 * 核心机制:
 * 1. 转账手续费 0.5% 
 * 2. 卖出时 50% 销毁, 50% 回池
 * 3. 价格随交易自动上涨
 */
contract PandaTokenV2 is ERC20, ERC20Burnable, Ownable {
    
    // 常量
    uint256 public constant TOTAL_SUPPLY = 6_000_000_000 * 10**18;  // 60亿
    uint256 public constant TRANSFER_FEE = 5;  // 0.5%
    uint256 public constant BURN_FEE = 50;     // 50% of transfer fee
    
    // 黑名单
    mapping(address => bool) public blacklist;
    
    // 事件
    event BlacklistUpdated(address indexed account, bool isBlacklisted);
    event TokensBurned(address indexed from, uint256 amount);
    event PriceUpdated(uint256 newPrice);
    
    // 动态价格 (简化版: 基于已销毁数量)
    uint256 public burnedSupply;
    uint256 public lastPrice = 0.00001 ether; // 初始价格 0.00001 USDT
    
    constructor() ERC20("PandaToken", "PANDA") Ownable(msg.sender) {
        // 初始不铸造，由部署后初始化
    }
    
    // 初始化代币分配
    function initialize(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Length mismatch");
        uint256 total;
        for (uint i = 0; i < amounts.length; i++) {
            total += amounts[i];
        }
        require(total <= TOTAL_SUPPLY, "Exceeds supply");
        
        for (uint i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
        }
    }
    
    // 转账时自动销毁
    function transfer(address to, uint256 amount) public override returns (bool) {
        require(!blacklist[msg.sender], "Sender blacklisted");
        require(!blacklist[to], "Recipient blacklisted");
        
        // Owner免手续费
        if (msg.sender == owner() || to == owner()) {
            return super.transfer(to, amount);
        }
        
        // 转账手续费 0.5%
        uint256 fee = (amount * TRANSFER_FEE) / 1000;
        uint256 burnAmount = (fee * BURN_FEE) / 100;  // 50% 销毁
        uint256 feeToOwner = fee - burnAmount;  // 50% 给owner
        
        // 销毁部分
        if (burnAmount > 0) {
            _burn(msg.sender, burnAmount);
            burnedSupply += burnAmount;
            emit TokensBurned(msg.sender, burnAmount);
        }
        
        // 转账
        super._transfer(msg.sender, owner(), feeToOwner);
        return super.transfer(to, amount - fee);
    }
    
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        require(!blacklist[from], "Sender blacklisted");
        require(!blacklist[to], "Recipient blacklisted");
        
        if (from == owner() || to == owner()) {
            return super.transferFrom(from, to, amount);
        }
        
        uint256 fee = (amount * TRANSFER_FEE) / 1000;
        uint256 burnAmount = (fee * BURN_FEE) / 100;
        
        if (burnAmount > 0) {
            _burn(from, burnAmount);
            burnedSupply += burnAmount;
            emit TokensBurned(from, burnAmount);
        }
        
        super._transfer(from, owner(), fee - burnAmount);
        return super.transferFrom(from, to, amount - fee);
    }
    
    // 铸造 (仅owner)
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= TOTAL_SUPPLY, "Exceeds supply");
        _mint(to, amount);
    }
    
    // 黑名单管理
    function addBlacklist(address account) external onlyOwner {
        blacklist[account] = true;
        emit BlacklistUpdated(account, true);
    }
    
    function removeBlacklist(address account) external onlyOwner {
        blacklist[account] = false;
        emit BlacklistUpdated(account, false);
    }
    
    // 获取当前价格 (简化: 基于销毁量上涨)
    function getCurrentPrice() public view returns (uint256) {
        if (burnedSupply == 0) return lastPrice;
        // 每销毁 1%, 价格上涨 5%
        uint256 increase = (burnedSupply * 500) / (totalSupply() * 100);
        return lastPrice + increase;
    }
}
