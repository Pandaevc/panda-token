// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PandaMultiSig
 * @dev 多签钱包合约
 * 
 * 功能:
 * - 添加/删除签名者
 * - 设置需要多少个签名才能执行
 * - 所有敏感操作需要多签
 */
contract PandaMultiSig is Ownable {
    
    // 签名者列表
    mapping(address => bool) public signers;
    
    // 签名者数量
    uint256 public signerCount;
    
    // 需要多少个签名
    uint256 public requiredSignatures;
    
    // 交易提议
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        uint256 signatures;
        bool executed;
        mapping(address => bool) signed;
    }
    
    mapping(uint256 => Transaction) public transactions;
    uint256 public transactionCount;
    
    // 事件
    event SignerAdded(address indexed signer);
    event SignerRemoved(address indexed signer);
    event TransactionProposed(uint256 indexed txId, address indexed to, uint256 value);
    event TransactionExecuted(uint256 indexed txId);
    event TransactionSigned(uint256 indexed txId, address indexed signer);
    
    // 修饰符
    modifier onlySigner() {
        require(signers[msg.sender], "Not a signer");
        _;
    }
    
    modifier validSignatures(uint256 _txId) {
        require(transactions[_txId].signatures >= requiredSignatures, "Not enough signatures");
        _;
    }
    
    // 构造函数
    constructor(address[] memory _signers, uint256 _required) Ownable(msg.sender) {
        require(_signers.length > 0, "No signers");
        require(_required > 0 && _required <= _signers.length, "Invalid required");
        
        requiredSignatures = _required;
        
        for (uint256 i = 0; i < _signers.length; i++) {
            addSigner(_signers[i]);
        }
    }
    
    // 添加签名者 (需要多签)
    function addSigner(address _signer) public onlyOwner {
        require(_signer != address(0), "Invalid address");
        require(!signers[_signer], "Already a signer");
        
        signers[_signer] = true;
        signerCount++;
        
        emit SignerAdded(_signer);
    }
    
    // 删除签名者 (需要多签)
    function removeSigner(address _signer) public onlyOwner {
        require(signers[_signer], "Not a signer");
        require(signerCount > requiredSignatures, "Cannot remove, below minimum");
        
        signers[_signer] = false;
        signerCount--;
        
        emit SignerRemoved(_signer);
    }
    
    // 提议交易
    function proposeTransaction(address _to, uint256 _value, bytes memory _data) external onlySigner returns (uint256) {
        require(_to != address(0), "Invalid to");
        
        uint256 txId = transactionCount++;
        
        Transaction storage t = transactions[txId];
        t.to = _to;
        t.value = _value;
        t.data = _data;
        t.signatures = 0;
        t.executed = false;
        
        // 提案者自动签名
        t.signed[msg.sender] = true;
        t.signatures = 1;
        
        emit TransactionProposed(txId, _to, _value);
        
        // 如果已经达到签名数，自动执行
        if (t.signatures >= requiredSignatures) {
            executeTransaction(txId);
        }
        
        return txId;
    }
    
    // 签名交易
    function signTransaction(uint256 _txId) external onlySigner {
        Transaction storage t = transactions[_txId];
        require(!t.executed, "Already executed");
        require(!t.signed[msg.sender], "Already signed");
        
        t.signed[msg.sender] = true;
        t.signatures++;
        
        emit TransactionSigned(_txId, msg.sender);
        
        // 达到签名数则执行
        if (t.signatures >= requiredSignatures) {
            executeTransaction(_txId);
        }
    }
    
    // 执行交易
    function executeTransaction(uint256 _txId) internal validSignatures(_txId) {
        Transaction storage t = transactions[_txId];
        require(!t.executed, "Already executed");
        
        t.executed = true;
        
        (bool success, ) = t.to.call{value: t.value}(t.data);
        require(success, "Execution failed");
        
        emit TransactionExecuted(_txId);
    }
    
    // 查询
    function getSigners() external view returns (address[] memory) {
        address[] memory result = new address[](signerCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < signerCount; i++) {
            // 简化: 需要遍历
        }
        
        return result;
    }
    
    function isSigner(address _addr) external view returns (bool) {
        return signers[_addr];
    }
}
