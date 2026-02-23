# 智能合约说明

## 📋 合约列表

### 1. PandaTokenV2
- 地址: (待部署)
- 功能:
  - 总量: 60亿 PANDA
  - 转账手续费: 0.5%
  - 50% 销毁机制
  - 黑名单功能

### 2. PandaExchangeV2
- 地址: (待部署)
- 功能:
  - 密钥兑换 (+5% 价格)
  - 卖出功能 (+3% 价格)
  - 底池管理
  - 不开放买入!

---

## 🔄 核心机制

### 只涨不跌

```
1. 密钥兑换 → 从储备转出PANDA → 价格+5%
2. 卖出 → 获得USDT → 价格上涨+3%
3. 转账 → 0.5%手续费 → 50%销毁
```

### 价格公式
```
价格 = USDT储备 / PANDA储备
```

---

## 📊 测试结果

```
✅ Total Supply: 60亿 PANDA
✅ Transfer Fee: 0.5% (50% burn)
✅ Exchange Pool: 10亿 PANDA + 1万 USDT
✅ Initial Price: $0.00001
```

---

## 🚀 部署顺序

1. 部署 PandaTokenV2
2. 部署 PandaExchangeV2
3. 初始化底池
4. 添加密钥
5. 验证TRONSCAN
