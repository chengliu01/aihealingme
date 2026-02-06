#!/bin/bash

echo "🚀 启动 Healing Audio AI 后端服务器"
echo "=================================="
echo ""

# 检查 MongoDB 是否运行
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB 未运行"
    echo ""
    echo "请先启动 MongoDB："
    echo ""
    echo "方式 1 - 使用 Homebrew（推荐）:"
    echo "  brew services start mongodb-community@6.0"
    echo ""
    echo "方式 2 - 使用 Docker:"
    echo "  docker run -d -p 27017:27017 --name mongodb mongo:6.0"
    echo ""
    echo "方式 3 - 手动启动:"
    echo "  mongod --config /usr/local/etc/mongod.conf"
    echo ""
    exit 1
fi

echo "✅ MongoDB 正在运行"
echo ""

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
    echo ""
fi

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "⚠️  未找到 .env 文件，从 .env.example 复制..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件"
    echo ""
fi

echo "🔥 启动开发服务器..."
echo ""
npm run dev
