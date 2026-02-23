// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PandaToken
 * @dev PandaToken - 只涨不跌代币
 * 
 * 代币分配 (60亿):
 * - 挖矿池: 40亿 (66.7%) - 电子烟+推荐+游戏
 * - 基金会: 10亿 (16.7%) - 12个月线性释放
 * - 底池: 10亿 (16.7%) - 上交易所做市
 */
contract PandaToken is ERC20, ERC20Burnable, Ownable {
    
    // ============ 常量 ============
    uint256 public constant TOTAL_SUPPLY = 6_000_000_000 * 10**18;  // 60亿
    uint256 public constant MINING_POOL = 4_000_000_000 * 10**18;   // 40亿 (挖矿)
    uint256 public constant FOUNDATION = 1_000_000_000 * 10**18;    // 10亿 (基金会)
    uint256 public constant LIQUIDITY_POOL = 1_000_000_000 * 10**18; // 10亿 (底池)
    
    // 转账费率
    uint256 public transferFeePercent = 5; // 0.5%
    
    // 黑名单
    mapping(address => bool) public blacklist;
    
    // 事件
    event BlacklistUpdated(address indexed account, bool isBlacklisted);
    event TokensMinted(address indexed to, uint256 amount);
    
    // 基金会释放
    uint256 public foundationReleased;
    uint256 public foundationStartTime;
    uint256 public constant FOUNDATION_DURATION = 365 days;
    
    constructor() ERC20("PandaToken", "PANDA") Ownable(msg.sender) {
        foundationStartTime = block.timestamp;
    }
    
    // ============ 铸造 ============
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= TOTAL_SUPPLY, "Exceeds total supply");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    function mintBatch(address[] calldata to, uint256[] calldata amounts) external onlyOwner {
        require(to.length == amounts.length, "Length mismatch");
        uint256 total;
        for (uint i = 0; i < amounts.length; i++) {
            total += amounts[i];
        }
        require(totalSupply() + total <= TOTAL_SUPPLY, "Exceeds total supply");
        
        for (uint i = 0; i < to.length; i++) {
            _mint(to[i], amounts[i]);
            emit TokensMinted(to[i], amounts[i]);
        }
    }
    
    // ============ 转账 ============
    function transfer(address to, uint256 amount) public override returns (bool) {
        require(!blacklist[msg.sender], "Sender blacklisted");
        require(!blacklist[to], "Recipient blacklisted");
        
        // Owner免手续费
        if (msg.sender == owner() || to == owner()) {
            return super.transfer(to, amount);
        }
        
        uint256 fee = (amount * transferFeePercent) / 1000;
        super._transfer(msg.sender, owner(), fee);
        return super.transfer(to, amount - fee);
    }
    
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        require(!blacklist[from], "Sender blacklisted");
        require(!blacklist[to], "Recipient blacklisted");
        
        if (from == owner() || to == owner()) {
            return super.transferFrom(from, to, amount);
        }
        
        uint256 fee = (amount * transferFeePercent) / 1000;
        super._transfer(from, owner(), fee);
        return super.transferFrom(from, to, amount - fee);
    }
    
    // ============ 黑名单 ============
    function addBlacklist(address account) external onlyOwner {
        blacklist[account] = true;
        emit BlacklistUpdated(account, true);
    }
    
    function removeBlacklist(address account) external onlyOwner {
        blacklist[account] = false;
        emit BlacklistUpdated(account, false);
    }
    
    // ============ 基金会释放 ============
    function getReleasableFoundation() public view returns (uint256) {
        if (block.timestamp >= foundationStartTime + FOUNDATION_DURATION) {
            return FOUNDATION - foundationReleased;
        }
        uint256 released = (FOUNDATION * (block.timestamp - foundationStartTime)) / FOUNDATION_DURATION;
        return released - foundationReleased;
    }
    
    function releaseFoundation() external onlyOwner {
        uint256 releasable = getReleasableFoundation();
        require(releasable > 0, "Nothing to release");
        foundationReleased += releasable;
        _mint(owner(), releasable);
    }
}
