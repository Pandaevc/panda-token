# 智能合约信息

## 合约地址 (已修复)

### 新合约 (正确: 40亿)
| 合约 | 地址 | 状态 |
|------|------|------|
| PandaToken (新) | `TVnaGJ5hN2pZTKw5QiLFGXWxw1XZ9WTPTS` | ✅ 已部署 |
| PandaExchange | `TAwAwqnxxqXxgYvERkzweRPorumUcGkjTq` | 待部署 |

### 旧合约 (错误: 80亿 - 已废弃)
| 合约 | 地址 | 问题 |
|------|------|------|
| PandaToken (旧) | `TYXEZR9cnCU3X33F2RyQY3GYwRCjqyAdi3` | ⚠️ 铸造过量 |
| PandaToken (旧2) | `TX5rvELsh2wCigzS6R35gX1gQ2Ke7wRT7D` | ⚠️ 铸造过量 |

---

## 问题说明

**原合约问题**: 初始铸造80亿，超出最大供应40亿

**修复方案**: 重新部署合约，修正为初始铸造40亿

---

## 添加代币

在TP钱包中添加新合约:
```
TVnaGJ5hN2pZTKw5QiLFGXWxw1XZ9WTPTS
```

---

最后更新: 2026-02-21
