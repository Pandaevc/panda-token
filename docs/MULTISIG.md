# 多签(Multi-Sig)合约说明

## 方案1: PandaManager (推荐)

### 部署时可设置
- 基金会地址
- 底池地址
- 多签成员列表

### 部署后可修改
```solidity
// 添加多签成员
contract.addMultiSig(address)

// 移除多签成员
contract.removeMultiSig(address)

// 修改基金会地址
contract.setFoundation(address)

// 修改底池地址
contract.setLiquidity(address)
```

---

## 方案2: PandaMultiSig (完整多签)

### 部署参数
```solidity
constructor(address[] signers, uint256 required)
```

### 功能
- 3/5 多签: 5个成员，需3人签名才能转账
- 任何操作需多签
- 提案 → 签名 → 执行

---

## 📋 当前状态

| 合约 | 状态 |
|------|------|
| PandaManager.sol | ✅ 已创建 |
| PandaMultiSig.sol | ✅ 已创建 |

---

## 🔄 部署时设置

```javascript
// 部署时传入多签地址
const Manager = await ethers.getContractFactory("PandaManager");
const manager = await Manager.deploy();

// 设置地址
await manager.setFoundation(wallet1Address);
await manager.setLiquidity(exchangeAddress);
await manager.addMultiSig(wallet1Address);
await manager.addMultiSig(wallet2Address);
await manager.addMultiSig(wallet3Address);
```

---

## 部署后修改

只要你是owner，可以随时添加/删除多签成员！

