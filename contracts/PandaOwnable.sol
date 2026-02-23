// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PandaManager
 * @dev 可升级的管理合约
 * 
 * 用途:
 * - 管理多签地址列表
 * - 可通过owner添加/删除
 * - 所有资金操作需要多签
 */
contract PandaManager is Ownable {
    
    // 多签地址列表
    address[] public multiSigAddresses;
    mapping(address => bool) public isMultiSig;
    
    // 基金会地址
    address public foundationAddress;
    // 底池地址  
    address public liquidityAddress;
    
    // 事件
    event MultiSigAdded(address indexed addr);
    event MultiSigRemoved(address indexed addr);
    event FoundationSet(address indexed addr);
    event LiquiditySet(address indexed addr);
    
    constructor() Ownable(msg.sender) {}
    
    // 添加多签地址
    function addMultiSig(address _addr) external onlyOwner {
        require(_addr != address(0), "Invalid address");
        require(!isMultiSig[_addr], "Already added");
        
        multiSigAddresses.push(_addr);
        isMultiSig[_addr] = true;
        
        emit MultiSigAdded(_addr);
    }
    
    // 移除多签地址
    function removeMultiSig(address _addr) external onlyOwner {
        require(isMultiSig[_addr], "Not a multi-sig");
        
        isMultiSig[_addr] = false;
        
        // 从数组中移除
        for (uint256 i = 0; i < multiSigAddresses.length; i++) {
            if (multiSigAddresses[i] == _addr) {
                multiSigAddresses[i] = multiSigAddresses[multiSigAddresses.length - 1];
                multiSigAddresses.pop();
                break;
            }
        }
        
        emit MultiSigRemoved(_addr);
    }
    
    // 设置基金会地址
    function setFoundation(address _addr) external onlyOwner {
        foundationAddress = _addr;
        emit FoundationSet(_addr);
    }
    
    // 设置底池地址
    function setLiquidity(address _addr) external onlyOwner {
        liquidityAddress = _addr;
        emit LiquiditySet(_addr);
    }
    
    // 查询多签数量
    function getMultiSigCount() external view returns (uint256) {
        return multiSigAddresses.length;
    }
    
    // 查询是否为多签
    function checkMultiSig(address _addr) external view returns (bool) {
        return isMultiSig[_addr];
    }
}
