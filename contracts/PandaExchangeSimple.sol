// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PandaExchange
 * @dev 电子烟挖矿合约 - 预生成密钥版本
 * 
 * 模型:
 * - 每个电子烟在生产时预生成30个密钥
 * - 密钥嵌入电子烟设备中
 * - 用户每天使用电子烟可获得1个密钥
 * - 每个密钥可兑换100代币
 * - 密钥用完或30天后设备过期
 */
contract PandaExchange is ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    address public owner;
    IERC20 public pandaToken;
    IERC20 public usdtToken;
    
    // AMM池
    uint256 public tokenReserve;
    uint256 public usdtReserve;
    
    // ==================== 预生成密钥系统 ====================
    
    // 密钥是否有效
    mapping(bytes32 => bool) public validKeys;
    // 密钥是否已使用
    mapping(bytes32 => bool) public usedKeys;
    // 密钥对应的代币数量 (默认100)
    mapping(bytes32 => uint256) public keyValues;
    
    // ==================== 设备系统 (可选) ====================
    
    struct Device {
        address owner;
        uint256 startTime;
        uint256 totalKeysClaimed;
        bool active;
    }
    
    mapping(bytes32 => Device) public devices;
    
    // ==================== 事件 ====================
    
    event KeysAdded(bytes32[] keys, uint256 value);
    event DeviceRegistered(bytes32 indexed deviceId, address indexed owner);
    event KeyRedeemed(address indexed user, bytes32 key, uint256 amount);
    event TokensSwapped(address indexed user, uint256 inAmount, uint256 outAmount);
    event PriceUpdated(uint256 newPrice);
    
    // ==================== 构造函数 ====================
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    // ==================== 初始化 ====================
    
    function setTokens(address _pandaToken, address _usdtToken) external onlyOwner {
        pandaToken = IERC20(_pandaToken);
        usdtToken = IERC20(_usdtToken);
        tokenReserve = 1000000000 * 1e18;
        usdtReserve = 5000000 * 1e6;
    }
    
    // ==================== 密钥管理 (Admin) ====================
    
    /**
     * @dev 批量添加预生成密钥
     * 电子烟生产时调用，嵌入30个密钥
     * @param keys 密钥数组
     * @param value 每个密钥的代币数量 (默认100e18)
     */
    function addKeys(bytes32[] calldata keys, uint256 value) external onlyOwner {
        for (uint i = 0; i < keys.length; i++) {
            if (!validKeys[keys[i]]) {
                validKeys[keys[i]] = true;
                keyValues[keys[i]] = value;
            }
        }
        emit KeysAdded(keys, value);
    }
    
    /**
     * @dev 添加单个密钥
     */
    function addKey(bytes32 key, uint256 value) external onlyOwner {
        validKeys[key] = true;
        keyValues[key] = value;
    }
    
    /**
     * @dev 检查密钥是否有效
     */
    function isValidKey(bytes32 key) external view returns (bool) {
        return validKeys[key] && !usedKeys[key];
    }
    
    // ==================== 设备注册 (可选) ====================
    
    /**
     * @dev 注册电子烟设备
     * @param deviceId 设备ID
     */
    function registerDevice(bytes32 deviceId) external {
        require(devices[deviceId].startTime == 0, "Device already registered");
        
        devices[deviceId] = Device({
            owner: msg.sender,
            startTime: block.timestamp,
            totalKeysClaimed: 0,
            active: true
        });
        
        emit DeviceRegistered(deviceId, msg.sender);
    }
    
    // ==================== 用户操作 ====================
    
    /**
     * @dev 使用密钥兑换代币
     * 用户从电子烟获取密钥后调用
     * @param key 密钥
     */
    function redeemKey(bytes32 key) external nonReentrant {
        // 验证密钥
        require(validKeys[key], "Invalid key");
        require(!usedKeys[key], "Key already used");
        
        // 标记为已使用
        usedKeys[key] = true;
        
        // 获取密钥对应的代币数量 (默认100)
        uint256 tokenAmount = keyValues[key];
        if (tokenAmount == 0) {
            tokenAmount = 100 * 1e18; // 默认100代币
        }
        
        // 从池子转代币给用户
        require(pandaToken.balanceOf(address(this)) >= tokenAmount, "Insufficient tokens in pool");
        pandaToken.transfer(msg.sender, tokenAmount);
        
        emit KeyRedeemed(msg.sender, key, tokenAmount);
    }
    
    /**
     * @dev 批量兑换密钥 (可选)
     */
    function redeemKeys(bytes32[] calldata keys) external nonReentrant {
        for (uint i = 0; i < keys.length; i++) {
            bytes32 key = keys[i];
            if (validKeys[key] && !usedKeys[key]) {
                usedKeys[key] = true;
                uint256 tokenAmount = keyValues[key];
                if (tokenAmount == 0) tokenAmount = 100 * 1e18;
                
                if (pandaToken.balanceOf(address(this)) >= tokenAmount) {
                    pandaToken.transfer(msg.sender, tokenAmount);
                    emit KeyRedeemed(msg.sender, key, tokenAmount);
                }
            }
        }
    }
    
    // ==================== Swap (出售代币) ====================
    
    /**
     * @dev 出售代币换取USDT
     * AMM价格机制
     */
    function swapToUSDT(uint256 tokenAmount) external nonReentrant {
        require(tokenAmount > 0, "Cannot swap 0");
        
        // 获取用户代币
        pandaToken.safeTransferFrom(msg.sender, address(this), tokenAmount);
        
        // AMM计算: 根据储备计算价格
        uint256 usdtOut = (usdtReserve * tokenAmount) / (tokenReserve + tokenAmount);
        uint256 fee = usdtOut / 100; // 1% 手续费
        uint256 finalOutput = usdtOut - fee;
        
        require(usdtToken.balanceOf(address(this)) >= finalOutput, "Insufficient USDT");
        
        // 更新储备 (价格上涨)
        tokenReserve += tokenAmount;
        usdtReserve -= finalOutput;
        
        // 转给用户
        usdtToken.safeTransfer(msg.sender, finalOutput);
        
        emit TokensSwapped(msg.sender, tokenAmount, finalOutput);
        emit PriceUpdated(getCurrentPrice());
    }
    
    // ==================== 价格查询 ====================
    
    function getCurrentPrice() public view returns (uint256) {
        return (usdtReserve * 1e12) / tokenReserve;
    }
    
    // ==================== 流动性 ====================
    
    function addLiquidity(uint256 tokenAmount, uint256 usdtAmount) external onlyOwner {
        require(tokenAmount > 0 && usdtAmount > 0, "Invalid amounts");
        
        pandaToken.safeTransferFrom(msg.sender, address(this), tokenAmount);
        usdtToken.safeTransferFrom(msg.sender, address(this), usdtAmount);
        
        tokenReserve += tokenAmount;
        usdtReserve += usdtAmount;
    }
    
    // ==================== 紧急 ====================
    
    function emergencyWithdraw(address token, address to, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(to, amount);
    }
}
