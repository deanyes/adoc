#!/bin/bash
# ADoc 一键安装脚本

set -e

INSTALL_DIR="${HOME}/.adoc"

echo "🚀 Installing ADoc to ${INSTALL_DIR}..."

# 清理旧安装
rm -rf "${INSTALL_DIR}"

# Clone 仓库
git clone --depth 1 https://github.com/deanyes/adoc.git "${INSTALL_DIR}"
cd "${INSTALL_DIR}"

# 安装依赖并构建
npm install --production=false
npm run build

# 创建全局命令链接
mkdir -p "${HOME}/.local/bin"
ln -sf "${INSTALL_DIR}/bin/adoc.js" "${HOME}/.local/bin/adoc"
ln -sf "${INSTALL_DIR}/bin/mcp-server.js" "${HOME}/.local/bin/adoc-mcp"
chmod +x "${INSTALL_DIR}/bin/adoc.js" "${INSTALL_DIR}/bin/mcp-server.js"

echo ""
echo "✅ ADoc installed successfully!"
echo ""
echo "Add ~/.local/bin to PATH if not already:"
echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
echo ""
echo "Then run: adoc --help"
