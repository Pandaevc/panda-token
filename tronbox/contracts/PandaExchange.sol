// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PandaExchange
 * @dev Token exchange contract - Key to Token conversion
 */
contract PandaExchange is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Token interfaces
    IERC20 public pandaToken;      // Our token
    IERC20 public usdtToken;       // USDT
    
    // Exchange rate (1 USDT = ? PANDA tokens)
    // 0.005 USDT per PANDA = 200 PANDA per USDT
    uint256 public exchangeRate = 200;  // 1 USDT = 200 PANDA
    
    // Key to USDT value mapping
    mapping(bytes32 => bool) public usedKeys;
    mapping(bytes32 => uint256) public keyValues;  // How much USDT value each key represents
    
    // Liquidity pool
    uint256 public liquidityPool;
    
    // Events
    event KeyRedeemed(address indexed user, bytes32 key, uint256 tokenAmount);
    event KeyExpanded(address indexed user, bytes32 key, uint256 multiplier, uint256 finalAmount);
    event LiquidityAdded(uint256 amount);
    event TokensSwapped(address indexed user, uint256 inAmount, uint256 outAmount);
    
    constructor(address _pandaToken, address _usdtToken) Ownable(msg.sender) {
        pandaToken = IERC20(_pandaToken);
        usdtToken = IERC20(_usdtToken);
    }
    
    /**
     * @dev Generate a key (for testing - in production, keys generated server-side)
     */
    function generateKey(address user, uint256 timestamp) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(user, timestamp, "PANDA_EVC"));
    }
    
    /**
     * @dev Set key value (only owner - called when electronic cigarette is sold)
     */
    function setKeyValue(bytes32 key, uint256 usdtValue) external onlyOwner {
        require(!usedKeys[key], "Key already used");
        keyValues[key] = usdtValue;
    }
    
    /**
     * @dev Batch set key values
     */
    function batchSetKeyValues(bytes32[] calldata keys, uint256[] calldata values) external onlyOwner {
        require(keys.length == values.length, "Length mismatch");
        for (uint256 i = 0; i < keys.length; i++) {
            require(!usedKeys[keys[i]], "Key already used");
            keyValues[keys[i]] = values[i];
        }
    }
    
    /**
     * @dev Redeem key for tokens (direct redemption)
     */
    function redeemKey(bytes32 key) external nonReentrant {
        require(!usedKeys[key], "Key already used");
        uint256 usdtValue = keyValues[key];
        require(usdtValue > 0, "Invalid key");
        
        // Mark key as used
        usedKeys[key] = true;
        
        // Calculate token amount
        uint256 tokenAmount = usdtValue * exchangeRate;
        
        // Mint tokens to user (assuming contract has enough tokens)
        require(pandaToken.balanceOf(address(this)) >= tokenAmount, "Insufficient liquidity");
        
        pandaToken.transfer(msg.sender, tokenAmount);
        
        emit KeyRedeemed(msg.sender, key, tokenAmount);
    }
    
    /**
     * @dev Redeem with 膨胀 (multiplier)
     */
    function redeemWithMultiplier(bytes32 key, uint256 multiplier) external nonReentrant returns (uint256) {
        require(!usedKeys[key], "Key already used");
        uint256 usdtValue = keyValues[key];
        require(usdtValue > 0, "Invalid key");
        
        // Validate multiplier (1-10)
        require(multiplier >= 1 && multiplier <= 10, "Invalid multiplier");
        
        // Mark key as used
        usedKeys[key] = true;
        
        // Calculate token amount with multiplier
        uint256 baseAmount = usdtValue * exchangeRate;
        
        // Random multiplier (in production, use Chainlink VRF for true randomness)
        // For now, use pseudo-random based on block data
        uint256 randomMultiplier = _getRandomMultiplier(multiplier);
        uint256 finalAmount = baseAmount * randomMultiplier;
        
        // Check liquidity
        require(pandaToken.balanceOf(address(this)) >= finalAmount, "Insufficient liquidity");
        
        // Transfer tokens
        pandaToken.transfer(msg.sender, finalAmount);
        
        emit KeyExpanded(msg.sender, key, randomMultiplier, finalAmount);
        
        return finalAmount;
    }
    
    /**
     * @dev Swap PANDA tokens for USDT
     */
    function swapToUSDT(uint256 tokenAmount) external nonReentrant {
        require(tokenAmount > 0, "Cannot swap 0");
        
        // Transfer tokens from user
        pandaToken.safeTransferFrom(msg.sender, address(this), tokenAmount);
        
        // Calculate USDT output (with fee)
        uint256 outputAmount = tokenAmount / exchangeRate;
        uint256 fee = outputAmount / 100; // 1% fee
        uint256 finalOutput = outputAmount - fee;
        
        require(usdtToken.balanceOf(address(this)) >= finalOutput, "Insufficient USDT liquidity");
        
        // Transfer USDT to user
        usdtToken.safeTransfer(msg.sender, finalOutput);
        
        // Burn or add to liquidity
        liquidityPool += fee;
        
        emit TokensSwapped(msg.sender, tokenAmount, finalOutput);
    }
    
    /**
     * @dev Add liquidity to pool
     */
    function addLiquidity(uint256 tokenAmount, uint256 usdtAmount) external onlyOwner {
        require(tokenAmount > 0 && usdtAmount > 0, "Invalid amounts");
        
        pandaToken.safeTransferFrom(msg.sender, address(this), tokenAmount);
        usdtToken.safeTransferFrom(msg.sender, address(this), usdtAmount);
        
        liquidityPool += usdtAmount;
        
        emit LiquidityAdded(usdtAmount);
    }
    
    /**
     * @dev Update exchange rate
     */
    function setExchangeRate(uint256 newRate) external onlyOwner {
        require(newRate > 0, "Invalid rate");
        exchangeRate = newRate;
    }
    
    /**
     * @dev Pseudo-random multiplier
     */
    function _getRandomMultiplier(uint256 maxMultiplier) internal view returns (uint256) {
        uint256 random = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            totalSwapped()
        )));
        
        return (random % maxMultiplier) + 1;
    }
    
    /**
     * @dev Get total tokens swapped
     */
    function totalSwapped() public view returns (uint256) {
        return pandaToken.balanceOf(address(this));
    }
    
    /**
     * @dev Emergency withdraw
     */
    function emergencyWithdraw(address token, address to, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(to, amount);
    }
}
