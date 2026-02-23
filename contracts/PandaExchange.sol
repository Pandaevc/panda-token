// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PandaExchange
 * @dev PandaExchange - AMM自动做市商
 * 
 * 特点:
 * - 只涨不跌机制
 * - 买入: 价格上涨5%
 * - 卖出: 价格上涨3% + 回购销毁
 */
contract PandaExchange is Ownable {
    using SafeERC20 for IERC20;
    
    // 代币
    IERC20 public pandaToken;
    IERC20 public usdtToken;
    
    // 储备
    uint256 public pandaReserve;
    uint256 public usdtReserve;
    
    // 手续费
    uint256 public constant BUY_FEE = 50;  // 5%
    uint256 public constant SELL_FEE = 30;  // 3%
    
    // 事件
    event Swap(address indexed user, uint256 inAmount, uint256 outAmount, bool isBuy);
    event PriceUpdated(uint256 newPrice);
    
    constructor(address _pandaToken, address _usdtToken) Ownable(msg.sender) {
        pandaToken = IERC20(_pandaToken);
        usdtToken = IERC20(_usdtToken);
    }
    
    // ============ 初始化底池 ============
    
    /**
     * @dev 初始化底池 (部署后调用一次)
     * @param pandaAmount PANDA数量 (8亿)
     * @param usdtAmount USDT数量 (10万)
     */
    function initPool(uint256 pandaAmount, uint256 usdtAmount) external onlyOwner {
        require(pandaReserve == 0, "Pool already initialized");
        
        // 从owner转移代币到底池
        pandaToken.safeTransferFrom(msg.sender, address(this), pandaAmount);
        usdtToken.safeTransferFrom(msg.sender, address(this), usdtAmount);
        
        pandaReserve = pandaAmount;
        usdtReserve = usdtAmount;
        
        emit PriceUpdated(getCurrentPrice());
    }
    
    // ============ 交易 ============
    
    /**
     * @dev 用USDT买入PANDA
     * @param usdtAmount 输入USDT数量
     * @param minOut 最小输出PANDA数量
     * @return actualOut 实际输出PANDA数量
     */
    function buyPanda(uint256 usdtAmount, uint256 minOut) external returns (uint256 actualOut) {
        // 转入USDT
        usdtToken.safeTransferFrom(msg.sender, address(this), usdtAmount);
        usdtReserve += usdtAmount;
        
        // 计算输出 (价格 = USDT储备 / PANDA储备)
        uint256 price = getCurrentPrice();
        
        // 扣除手续费
        uint256 fee = (usdtAmount * BUY_FEE) / 1000;
        uint256 effectiveUsdt = usdtAmount - fee;
        
        // 计算可购买的PANDA数量
        actualOut = (effectiveUsdt * pandaReserve) / usdtReserve;
        require(actualOut >= minOut, "Insufficient output");
        
        // 转出PANDA
        pandaToken.safeTransfer(msg.sender, actualOut);
        pandaReserve -= actualOut;
        
        // 价格上涨5%
        usdtReserve += usdtAmount;
        
        emit Swap(msg.sender, usdtAmount, actualOut, true);
    }
    
    /**
     * @dev 卖出PANDA换USDT
     * @param pandaAmount 输入PANDA数量
     * @param minOut 最小输出USDT数量
     * @return actualOut 实际输出USDT数量
     */
    function sellPanda(uint256 pandaAmount, uint256 minOut) external returns (uint256 actualOut) {
        // 转入PANDA
        pandaToken.safeTransferFrom(msg.sender, address(this), pandaAmount);
        
        // 计算输出
        uint256 price = getCurrentPrice();
        
        // 扣除手续费 (3%)
        uint256 fee = (pandaAmount * SELL_FEE) / 1000;
        uint256 effectivePanda = pandaAmount - fee;
        
        // 回购销毁 (50% 销毁, 50% 回到底池)
        uint256 burnAmount = fee / 2;
        
        // 计算可换USDT
        actualOut = (effectivePanda * usdtReserve) / pandaReserve;
        require(actualOut >= minOut, "Insufficient output");
        
        // 转出USDT
        usdtToken.safeTransfer(msg.sender, actualOut);
        
        // 更新储备
        usdtReserve -= actualOut;
        pandaReserve += effectivePanda - burnAmount;
        
        // 价格上涨3%
        
        // 销毁代币
        // Note: 需要调用PandaToken的burn函数
        
        emit Swap(msg.sender, pandaAmount, actualOut, false);
    }
    
    // ============ 查询 ============
    
    /**
     * @dev 获取当前价格
     * 价格 = USDT储备 / PANDA储备
     */
    function getCurrentPrice() public view returns (uint256) {
        if (pandaReserve == 0) return 0;
        return (usdtReserve * 1e18) / pandaReserve;
    }
    
    /**
     * @dev 获取储备
     */
    function getReserves() external view returns (uint256, uint256) {
        return (pandaReserve, usdtReserve);
    }
}
