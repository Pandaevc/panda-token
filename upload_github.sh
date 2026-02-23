#!/bin/bash
# 上传DApp到GitHub

echo "=== PandaToken GitHub 上传 ==="

# 1. 检查是否安装gh
if ! command -v gh &> /dev/null; then
    echo "安装 gh CLI..."
    brew install gh
fi

# 2. 登录GitHub (会弹出浏览器)
echo "请在浏览器中登录GitHub"
gh auth login

# 3. 创建仓库
echo "创建仓库..."
gh repo create panda-token --public --source=. --clone=false

# 4. 推送
echo "推送代码..."
git add .
git commit -m "PandaToken DApp - $(date)"
git push -u origin main

echo "完成!"
echo "访问 https://pandaevc.github.io/panda-token"
