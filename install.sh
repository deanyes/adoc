#!/bin/bash
# ADoc 一键安装脚本

set -e

echo "🚀 Installing ADoc..."

# Clone 仓库
TEMP_DIR=$(mktemp -d)
git clone --depth 1 https://github.com/deanyes/adoc.git "$TEMP_DIR/adoc"
cd "$TEMP_DIR/adoc"

# 安装依赖并构建
npm install
npm run build

# 全局链接
npm link

echo ""
echo "✅ ADoc installed successfully!"
echo "   Run 'adoc --help' to get started."

# 清理
rm -rf "$TEMP_DIR"
