# QwenPaw 项目依赖安装指南

## 当前状态

✅ **已完成:**
- Node.js 前端依赖已安装（console目录）
- Rust依赖已配置（Cargo.lock已存在）

⚠️ **需要完成:**
- Python 3.11+ 安装
- Python 项目依赖安装

## Python 环境升级指南

### 步骤 1: 安装 Python 3.11

**推荐版本:** Python 3.11.9（稳定版本）

**下载链接:**
- [官方下载页面](https://www.python.org/downloads/release/python-3119/)
- [直接下载](https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe)

**安装步骤:**
1. 下载 Python 3.11.9 安装程序
2. 以管理员身份运行安装程序
3. ✅ **重要：勾选 "Add Python to PATH"**
4. 选择 "Install Now"（默认安装位置）
5. 等待安装完成

### 步骤 2: 验证安装

```powershell
python --version
# 应该显示: Python 3.11.x

pip --version
# 应该显示pip版本信息
```

### 步骤 3: 安装项目依赖

```powershell
# 切换到项目根目录
cd C:/Users/75659/Documents/QwenPaw

# 安装项目依赖（开发模式）
pip install -e .

# 等待安装完成（可能需要几分钟）
```

### 步骤 4: 验证依赖安装

```powershell
# 检查Python依赖
pip list | findstr "qwenpaw agentscope"

# 检查Node.js依赖（在console目录）
cd C:/Users/75659/Documents/QwenPaw/console
npm list --depth=0
```

## 依赖完整性检查

### Python 依赖状态
- ✅ agentscope==2.0.4
- ✅ mcp>=1.13.0,<2.0.0
- ✅ 各种AI相关包（transformers, etc.）
- ✅ Web框架（uvicorn, fastapi）
- ✅ 安全组件（cryptography, keyring）
- ✅ 多媒体处理（pillow, onnxruntime）
- ✅ 以及各种技能包

### Node.js 依赖状态
- ✅ React 18.x
- ✅ Ant Design 5.x
- ✅ Tauri 2.x
- ✅ Vite 6.x
- ✅ TypeScript 5.x
- ✅ 各种UI组件和工具

## 故障排除

### Python 版本问题
```powershell
# 如果系统中有多个Python版本，使用Python启动器
py -3.11 --version
py -3.11 -m pip install -e .
```

### 权限问题
```powershell
# 如果遇到权限错误，尝试用户安装
pip install --user -e .
```

### 依赖冲突
```powershell
# 更新pip到最新版本
python -m pip install --upgrade pip

# 清理并重试
pip cache purge
pip install -e . --no-cache-dir
```

### 网络问题
```powershell
# 如果使用代理，配置代理
set HTTP_PROXY=http://your-proxy:port
set HTTPS_PROXY=http://your-proxy:port

# 或者使用国内的镜像源
pip install -e . -i https://pypi.tuna.tsinghua.edu.cn/simple
```

## 项目结构说明

```
QwenPaw/
├── console/                 # 前端项目 (React + TypeScript)
│   ├── node_modules/        # ✅ 已安装
│   └── src/
├── src/qwenpaw/            # 后端项目 (Python)
│   └── ...                 # ⚠️ 需要安装依赖
├── tests/                 # 测试代码
└── pyproject.toml         # Python项目配置
```

## 支持的Python版本

- **要求:** Python >= 3.11, < 3.14
- **推荐:** Python 3.11.x（最稳定）
- **不兼容:** Python 3.7-3.10

## 联系支持

如果遇到问题，请参考：
- [QwenPaw 官方文档](https://qwenpaw.agentscope.io/docs/)
- [GitHub Issues](https://github.com/agentscope-ai/QwenPaw/issues)
- [贡献指南](CONTRIBUTING.md)
