// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PandaToken
 * @dev PandaToken - Only Up Token with burn mechanism
 */
contract PandaToken is ERC20, ERC20Burnable, Ownable {
    
    // Maximum supply (40 billion tokens)
    uint256 public constant MAX_SUPPLY = 40_000_000_000 * 10**18;
    
    // Blacklist mapping
    mapping(address => bool) public blacklist;
    
    // Transfer fee percentage (0.5%)
    uint256 public transferFeePercent = 50; // 50 = 0.5% (basis points)
    
    // Events
    event BlacklistUpdated(address indexed account, bool isBlacklisted);
    event TransferFeeUpdated(uint256 newFee);
    event TokensBurned(address indexed from, uint256 amount);
    
    constructor() ERC20("PandaToken", "PANDA") Ownable(msg.sender) {
        // Initial supply for team/early investors (8 billion - 20%)
        _mint(msg.sender, 8_000_000_000 * 10**18);
    }
    
    /**
     * @dev Override transfer with blacklist and fee check
     */
    function transfer(address to, uint256 amount) public override returns (bool) {
        require(!blacklist[msg.sender], "Sender is blacklisted");
        require(!blacklist[to], "Recipient is blacklisted");
        
        // No fee for owner (liquidity operations)
        if (msg.sender == owner() || to == owner()) {
            return super.transfer(to, amount);
        }
        
        // Calculate fee
        uint256 fee = (amount * transferFeePercent) / 10000;
        uint256 amountAfterFee = amount - fee;
        
        // Transfer fee to contract (for burning/liquidity)
        super._transfer(msg.sender, owner(), fee);
        
        // Transfer remaining
        return super.transfer(to, amountAfterFee);
    }
    
    /**
     * @dev Override transferFrom with blacklist and fee check
     */
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        require(!blacklist[from], "Sender is blacklisted");
        require(!blacklist[to], "Recipient is blacklisted");
        
        // No fee for owner
        if (from == owner() || to == owner()) {
            return super.transferFrom(from, to, amount);
        }
        
        uint256 fee = (amount * transferFeePercent) / 10000;
        uint256 amountAfterFee = amount - fee;
        
        super._transfer(from, owner(), fee);
        
        return super.transferFrom(from, to, amountAfterFee);
    }
    
    /**
     * @dev Add address to blacklist
     */
    function addBlacklist(address account) external onlyOwner {
        blacklist[account] = true;
        emit BlacklistUpdated(account, true);
    }
    
    /**
     * @dev Remove address from blacklist
     */
    function removeBlacklist(address account) external onlyOwner {
        blacklist[account] = false;
        emit BlacklistUpdated(account, false);
    }
    
    /**
     * @dev Update transfer fee
     */
    function setTransferFee(uint256 newFee) external onlyOwner {
        require(newFee <= 500, "Fee too high (max 5%)");
        transferFeePercent = newFee;
        emit TransferFeeUpdated(newFee);
    }
    
    /**
     * @dev Burn tokens (override to emit event)
     */
    function burn(uint256 amount) public override {
        super.burn(amount);
        emit TokensBurned(msg.sender, amount);
    }
    
    /**
     * @dev Get current circulating supply
     */
    function circulatingSupply() external view returns (uint256) {
        return totalSupply() - balanceOf(address(0));
    }
}
