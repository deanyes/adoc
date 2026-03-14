#!/bin/bash
set -e

if command -v adoc &> /dev/null; then
  echo "✅ ADoc 已安装: $(adoc --version)"
  exit 0
fi

echo "📦 安装 ADoc..."

INSTALL_DIR="${HOME}/.adoc"
rm -rf "$INSTALL_DIR"

git clone --depth 1 https://github.com/deanyes/adoc.git "$INSTALL_DIR"
cd "$INSTALL_DIR"
npm install
npm run build
npm link

echo "✅ ADoc 安装完成"
adoc --version
