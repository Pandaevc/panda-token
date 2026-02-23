# 熊猫闪充海外代币项目 - 使用指南

## 项目文件位置

```
/Users/gaodelong/.openclaw/workspace/
├── 熊猫闪充_A轮融资BP.html          # 融资BP
├── logo.png                          # 官网logo
├── logo-white.png                    # 白色logo
├── details.webp                      # 产品详情图
├── overseas-project/
│   ├── frontend/
│   │   ├── index.html               # 代币DApp网站
│   │   └── shop.html                # 电子烟购买网站
│   ├── backend/
│   │   └── server.js                # 后端API服务
│   ├── contracts/                    # 智能合约
│   ├── hardhat.config.js
│   └── README.md
```

## 如何查看网站

### 方法1：直接在浏览器打开
```bash
# 打开融资BP
open /Users/gaodelong/.openclaw/workspace/熊猫闪充_A轮融资BP.html

# 打开代币DApp网站
open /Users/gaodelong/.openclaw/workspace/overseas-project/frontend/index.html

# 打开电子烟购买网站
open /Users/gaodelong/.openclaw/workspace/overseas-project/frontend/shop.html
```

### 方法2：启动本地服务器
```bash
cd /Users/gaodelong/.openclaw/workspace/overseas-project/frontend
python3 -m http.server 8080
# 然后访问 http://localhost:8080
```

## 启动后端API

```bash
cd /Users/gaodelong/.openclaw/workspace/overseas-project/backend
npm install express cors ethers
node server.js
```

## 智能合约部署

```bash
cd /Users/gaodelong/.openclaw/workspace/overseas-project

# 编译合约
npm run compile

# 部署到本地测试网
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

---

## 当前开发进度

| 项目 | 状态 | 说明 |
|------|------|------|
| 融资BP | ✅ 完成 | HTML版本，含官网图片 |
| 智能合约 | ✅ 完成 | 4个合约已编译 |
| 前端-代币网站 | ✅ 完成 | 质押+兑换界面 |
| 前端-购买网站 | ✅ 完成 | 电子烟销售 |
| 后端API | ✅ 完成 | 订单+支付+密钥 |
| 白皮书 | ⏳ 待开发 | - |
| 合约审计 | ⏳ 待安排 | - |
