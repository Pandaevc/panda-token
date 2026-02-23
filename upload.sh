#!/bin/bash
# 拖给QQ/微信发给我，或者复制粘贴

echo "仓库URL是什么？"
echo "比如: https://github.com/Pandaevc/panda-token"
read REPO

if [ -z "$REPO" ]; then
    echo "请提供仓库URL"
    exit 1
fi

# Extract owner and repo
OWNER=$(echo $REPO | sed 's|https://github.com/||' | cut -d'/' -f1)
REPO_NAME=$(echo $REPO | sed 's|https://github.com/||' | cut -d'/' -f2)

echo "准备上传到 $OWNER/$REPO_NAME"

# Initialize git if needed
if [ ! -d .git ]; then
    git init
fi

# Configure git
git config user.email "panda@evc.com"
git config user.name "Panda"

# Add remote
git remote add origin $REPO.git 2>/dev/null || true

# Add files
git add frontend/index.html frontend/shop.html test_page.html key_generator.html admin_panel.html
git add README.md

# Commit
git commit -m "PandaToken DApp"

# Push (will prompt for auth)
git branch -M main
git push -u origin main

echo "完成!"
