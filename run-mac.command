#!/bin/zsh
cd "$(dirname "$0")"

echo ""
echo "=== 一家三口出国读博规划筛选器：本地启动 ==="
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "没有检测到 Node.js。"
  echo "请先打开 https://nodejs.org/ 下载并安装 LTS 版本。"
  echo "安装完成后，重新双击本文件。"
  echo ""
  read "pause?按回车键退出..."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "没有检测到 npm。"
  echo "请重新安装 Node.js LTS：https://nodejs.org/"
  echo ""
  read "pause?按回车键退出..."
  exit 1
fi

echo "Node 版本：$(node -v)"
echo "npm 版本：$(npm -v)"
echo ""

if [ ! -d "node_modules" ] || [ ! -d "client/node_modules" ] || [ ! -d "server/node_modules" ]; then
  echo "正在安装依赖，第一次会慢一点..."
  npm run install:all
  if [ $? -ne 0 ]; then
    echo ""
    echo "依赖安装失败。请把上面的报错截图发给我。"
    read "pause?按回车键退出..."
    exit 1
  fi
fi

echo ""
echo "正在启动项目..."
echo "启动成功后，请打开：http://localhost:5173"
echo "如果浏览器没有自动打开，请手动复制上面的地址。"
echo ""

(sleep 3 && open "http://localhost:5173") &
npm run dev
