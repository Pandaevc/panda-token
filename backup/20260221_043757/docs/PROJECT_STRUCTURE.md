# PandaToken 项目结构文档

## 📁 项目概览

```
overseas-project/
├── frontend/                 # 前端页面
│   ├── index.html           # DApp主页面 (质押、兑换、推荐)
│   └── shop.html            # 电子烟商店 (购买、订单)
├── backend/                 # 后端API
│   ├── server.js            # Express API服务
│   ├── package.json         # 依赖配置
│   └── vercel.json         # Vercel部署配置
└── README.md                # 项目说明
```

---

## 📄 文件功能说明

### 前端文件

| 文件 | 功能 | 访问地址 |
|------|------|----------|
| `index.html` | DApp主页面 | /index.html |
| `shop.html` | 电子烟购买商店 | /shop.html |

#### index.html 功能模块
- 钱包连接 (TP Wallet/TronLink)
- 质押功能 (30/60/90天, 15%/45%/90%年化)
- 密钥兑换代币
- Turbo释放 (直接/30天/60天)
- Swap兑换
- 推荐系统 (生成推广链接)
- 弹窗Modal提示

#### shop.html 功能模块
- 产品展示 (熊猫智能电子烟 Pro, $70)
- 老虎机动画
- 推荐奖励展示 (+500 PANDA)
- 购买表单 (收货信息、USDT支付)
- 订单提交 (POST到后端API)
- 弹窗Modal提示

### 后端文件

| 文件 | 功能 |
|------|------|
| `server.js` | Express API服务 (订单管理、推荐统计) |
| `package.json` | Node.js依赖配置 |
| `vercel.json` | Vercel部署配置 |

---

## 🔗 API接口

| 接口 | 方法 | 功能 |
|------|------|------|
| `/` | GET | API状态 |
| `/api/orders` | POST | 创建订单 |
| `/api/orders/:id` | GET | 查询订单 |
| `/api/referrals/:code` | GET | 推荐统计 |

---

## 🗂️ 部署信息

| 服务 | 地址 |
|------|------|
| **GitHub仓库** | https://github.com/Pandaevc/panda-token |
| **前端 (GitHub Pages)** | https://pandaevc.github.io/panda-token/ |
| **DApp** | https://pandaevc.github.io/panda-token/index.html |
| **商店** | https://pandaevc.github.io/panda-token/shop.html |
| **后端API (Vercel)** | https://panda-token-d6bckkwli-pandaevc.vercel.app |

---

## 📊 产品框架图

```
┌─────────────────────────────────────────────────────────────┐
│                      PandaToken 项目                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐              │
│  │   官方网站 (GitHub Pages)   │    │   后端API (Vercel)   │              │
│  │  pandaevc.github.io/panda-token  │  │  panda-token-xxx   │              │
│  └────────┬────────┘    └────────┬────────┘              │
│           │                      │                        │
│           ▼                      ▼                        │
│  ┌─────────────────┐    ┌─────────────────┐              │
│  │   index.html    │    │   /api/orders   │              │
│  │   (DApp)       │    │   /api/referrals│              │
│  └────────┬────────┘    └─────────────────┘              │
│           │                                             │
│           ▼                                             │
│  ┌─────────────────┐    ┌─────────────────┐              │
│  │   shop.html    │    │    TRON网络     │              │
│  │   (电子烟商店) │    │  (智能合约)     │              │
│  └─────────────────┘    └─────────────────┘              │
│                                                             │
└─────────────────────────────────────────────────────────────┘

用户流程:
1. 访问 shop.html → 购买电子烟 ($70 USDT)
2. 获得密钥 → 在 index.html 兑换代币
3. 质押代币 → 获得收益 (15%-90%年化)
4. 推荐用户 → 获得 500 PANDA/ 人
```

---

## 🔐 注册账号

| 网站 | 用途 | 状态 |
|------|------|------|
| GitHub | 代码托管 | ✅ 已有 |
| Vercel | 后端部署 | ✅ 已部署 |
| TokenPocket (TP钱包) | 钱包连接 | 用户自行安装 |

---

最后更新: 2026-02-21
