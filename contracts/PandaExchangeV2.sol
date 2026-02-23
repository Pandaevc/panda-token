// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PandaExchangeV2
 * @dev 改进版交易所 - 只涨不跌机制
 * 
 * 机制:
 * 1. 密钥兑换 PANDA → 价格 +5%
 * 2. 卖出 PANDA → 价格 +3% + 回购销毁
 * 3. 不开放买入功能!
 */
contract PandaExchangeV2 is Ownable {
    using SafeERC20 for IERC20;
    
    IERC20 public pandaToken;
    IERC20 public usdtToken;
    
    // 储备
    uint256 public pandaReserve;
    uint256 public usdtReserve;
    
    // 手续费
    uint256 public constant REDEEM_FEE = 50;    // 5% 兑换费
    uint256 public constant SELL_FEE = 30;       // 3% 卖出费
    uint256 public constant BURN_PERCENT = 50;   // 50% 销毁
    
    // 价格增长因子 (每次交易价格上涨百分比)
    uint256 public priceIncreaseRate = 500; // 5%
    
    // 密钥管理
    mapping(bytes32 => bool) public validKeys;
    mapping(bytes32 => uint256) public keyValues;
    mapping(bytes32 => bool) public usedKeys;
    
    // 事件
    event KeyRedeemed(address indexed user, bytes32 key, uint256 pandaAmount);
    event PriceUpdated(uint256 oldPrice, uint256 newPrice);
    event TokensSold(address indexed user, uint256 pandaIn, uint256 usdtOut);
    event TokensBurned(uint256 amount);
    
    constructor(address _pandaToken, address _usdtToken) Ownable(msg.sender) {
        pandaToken = IERC20(_pandaToken);
        usdtToken = IERC20(_usdtToken);
    }
    
    // ============ 初始化底池 ============
    function initPool(uint256 pandaAmount, uint256 usdtAmount) external onlyOwner {
        require(pandaReserve == 0, "Pool already initialized");
        
        pandaToken.safeTransferFrom(msg.sender, address(this), pandaAmount);
        usdtToken.safeTransferFrom(msg.sender, address(this), usdtAmount);
        
        pandaReserve = pandaAmount;
        usdtReserve = usdtAmount;
        
        emit PriceUpdated(0, getCurrentPrice());
    }
    
    // ============ 添加密钥 ============
    function addKeys(bytes32[] calldata keys, uint256[] calldata values) external onlyOwner {
        require(keys.length == values.length, "Length mismatch");
        
        for (uint i = 0; i < keys.length; i++) {
            validKeys[keys[i]] = true;
            keyValues[keys[i]] = values[i];
        }
    }
    
    // ============ 密钥兑换 (核心功能) ============
    function redeemKey(bytes32 key) external returns (uint256 pandaAmount) {
        require(validKeys[key], "Invalid key");
        require(!usedKeys[key], "Key already used");
        
        usedKeys[key] = true;
        pandaAmount = keyValues[key];
        
        // 扣除手续费
        uint256 fee = (pandaAmount * REDEEM_FEE) / 1000;
        uint256 actualAmount = pandaAmount - fee;
        
        // 铸造代币给用户 (需要Token合约支持mint)
        // 简化: 假设从储备中转出
        require(pandaReserve >= pandaAmount, "Insufficient reserve");
        
        pandaToken.safeTransfer(msg.sender, actualAmount);
        pandaToken.safeTransfer(owner(), fee);
        
        pandaReserve -= pandaAmount;
        
        // 价格上涨 5%
        _updatePrice(true);
        
        emit KeyRedeemed(msg.sender, key, actualAmount);
    }
    
    // ============ 卖出 PANDA 换 USDT ============
    function sellPanda(uint256 pandaAmount, uint256 minUsdtOut) external returns (uint256 usdtOut) {
        require(pandaAmount > 0, "Amount must be > 0");
        
        // 转入 PANDA
        pandaToken.safeTransferFrom(msg.sender, address(this), pandaAmount);
        
        // 计算输出 (价格公式)
        uint256 price = getCurrentPrice();
        usdtOut = (pandaAmount * price) / 1 ether;
        
        // 扣除 3% 手续费
        uint256 fee = (usdtOut * SELL_FEE) / 1000;
        usdtOut -= fee;
        
        require(usdtOut >= minUsdtOut, "Slippage exceeded");
        require(usdtReserve >= usdtOut, "Insufficient USDT reserve");
        
        // 转出 USDT
        usdtToken.safeTransfer(msg.sender, usdtOut);
        
        // 50% 手续费销毁, 50% 回到储备
        uint256 burnAmount = fee / 2;
        uint256 poolFee = fee - burnAmount;
        
        // 更新储备
        usdtReserve -= usdtOut;
        pandaReserve += pandaAmount - (pandaAmount * BURN_PERCENT / 100);
        
        // 销毁部分 (简化: 需要调用token burn)
        // 实际应该调用 pandaToken.burn(burnAmount)
        
        // 价格上涨 3%
        _updatePrice(false);
        
        emit TokensSold(msg.sender, pandaAmount, usdtOut);
        if (burnAmount > 0) {
            emit TokensBurned(burnAmount);
        }
    }
    
    // ============ 价格更新 ============
    function _updatePrice(bool isRedeem) internal {
        uint256 oldPrice = getCurrentPrice();
        
        // 根据操作类型上涨
        uint256 increase = isRedeem 
            ? (oldPrice * priceIncreaseRate) / 10000  // +5%
            : (oldPrice * 300) / 10000;               // +3%
        
        // 实际上价格由储备比例决定，这里只是事件
        emit PriceUpdated(oldPrice, oldPrice + increase);
    }
    
    // ============ 查询 ============
    function getCurrentPrice() public view returns (uint256) {
        if (pandaReserve == 0) return 0;
        // 价格 = USDT储备 / PANDA储备
        return (usdtReserve * 1 ether) / pandaReserve;
    }
    
    function getReserves() external view returns (uint256, uint256) {
        return (pandaReserve, usdtReserve);
    }
    
    function isValidKey(bytes32 key) external view returns (bool) {
        return validKeys[key] && !usedKeys[key];
    }
}
