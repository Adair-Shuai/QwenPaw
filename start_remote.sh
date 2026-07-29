#!/bin/bash
# ─── CatPaw 远程连接启动脚本 ───
# 用法: bash start_remote.sh
# 启动后，另一台电脑用浏览器访问 http://<本机IP>:8088 即可连接

# 启用认证（首次访问需要注册账号）
export QWENPAW_AUTH_ENABLED=true

# 允许跨域访问（允许其他机器通过浏览器访问）
export QWENPAW_CORS_ORIGINS="http://192.168.1.150:8088,http://localhost:8088,http://127.0.0.1:8088,tauri://localhost,https://tauri.localhost,http://tauri.localhost"

echo "============================================"
echo "  CatPaw 远程连接服务启动中..."
echo "============================================"
echo ""
echo "本机局域网 IP: 192.168.1.150"
echo "访问地址:"
echo "  本机:       http://localhost:8088"
echo "  其他电脑:   http://192.168.1.150:8088"
echo ""
echo "安全提示:"
echo "  - 认证已启用，首次访问需要注册账号"
echo "  - 仅同一局域网内的设备可访问"
echo "  - 按 Ctrl+C 停止服务"
echo ""
echo "============================================"
echo ""

# 启动后端，监听所有网络接口
qwenpaw app --host 0.0.0.0 --port 8088 --log-level info
