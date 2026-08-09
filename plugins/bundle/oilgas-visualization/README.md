# Oil & Gas Visualization Plugin

油气三维可视化插件 — QwenPaw 插件，提供储层网格、井轨迹、剖面、测井曲线和管网的 3D 可视化能力。

## 功能

- **储层 3D 视图**：Three.js WebGL 渲染，支持 ROFF/EGRID 网格、属性着色、单元拾取
- **时间步动画**：UNRST 动态属性（压力、饱和度）按时间步切换
- **剖面生成**：沿折线生成垂直 curtain 剖面
- **井/层面基础对象**：统一 manifest 契约支持井轨迹和规则层面 JSON 导入
- **管网可视化**：CSV/Arrow 管网数据 3D 线/管渲染
- **测井曲线**：LAS/DLIS 格式多曲线读取和渲染
- **性能基准**：P50/P95/P99 帧时间测量 + 内存泄漏检测
- **工程分析基础**：单元 I/J/K 与坐标详情、属性统计、属性 CSV 导出
- **Agent 工具**：7 个结构化工具 + Viewer Command Bridge
- **Web Worker**：二进制解码和颜色计算在 Worker 线程
- **安全**：路径遍历防护、符号链接检查、原子 manifest 写入

## 安装

```bash
# 在 QwenPaw 中安装
QwenPaw > 插件管理 > 安装 > 选择路径
```

## 依赖

- **必选**：Python 3.11+（随 QwenPaw 提供）
- **可选**：xtgeo（ROFF/EGRID 读取）、lasio（LAS 读取）、dlisio（DLIS 读取）、pyarrow（Arrow 格式）

可选依赖缺失时插件仍可启动，仅对应格式不可用。

## 架构

```
plugins/bundle/oilgas-visualization/
├── plugin.json              # 插件清单
├── plugin.py                # 后端入口（注册路由+工具）
├── backend/
│   ├── api.py               # 16 个 API 端点
│   ├── models.py            # Pydantic 模型
│   ├── settings.py          # 配置
│   ├── security.py          # 路径安全
│   ├── tools.py             # Agent 工具 + Command Bridge
│   ├── readers/             # 7 个格式 reader
│   ├── converters/          # 5 个几何转换器
│   ├── jobs/                # 异步导入任务
│   └── cache/               # 缓存系统
├── contracts/               # 数据契约 schema
├── ui/
│   ├── dist/                # 构建产物
│   │   ├── index.js         # 轻量 bootstrap (4.4 KB)
│   │   └── viewer-runtime.js # Three.js 引擎 (474 KB)
│   └── src/                 # 前端源码
│       ├── bootstrap/       # 路由/菜单/Workspace
│       ├── viewer/          # 渲染引擎
│       │   ├── index.tsx    # Three.js 引擎
│       │   ├── api/         # API 客户端
│       │   ├── contracts/   # 类型契约
│       │   ├── stores/      # 全局状态
│       │   ├── engines/     # 引擎接口
│       │   ├── panels/      # UI 面板
│       │   ├── workers/     # Web Worker
│       │   ├── benchmark/   # 性能基准
│       │   └── app/         # 视图路由
└── skills/                  # Agent 技能引导
```

## API 端点

| 方法 | 路径 | 用途 |
|------|------|------|
| GET | /health | 健康检查 + 能力 + 数据集列表 |
| GET | /capabilities | 可用解析器 |
| GET | /manifest | 数据集目录 |
| GET | /resource/{filename} | 二进制资源 (Range) |
| POST | /imports | 创建导入任务 |
| GET | /imports/{id} | 任务状态 |
| GET | /imports/{id}/events | SSE 进度 |
| POST | /imports/{id}/cancel | 取消任务 |
| GET | /datasets | 数据集列表 |
| GET | /datasets/{id}/manifest | 单数据集 manifest |
| GET | /datasets/{id}/stats | 属性统计 |
| GET | /datasets/{id}/cells/{cell} | 单元详情 |
| GET | /datasets/{id}/export | JSON/CSV 导出 |
| GET | /datasets/{id}/resources/{rid} | 单数据集资源 |
| DELETE | /datasets/{id}/cache | 清除缓存 |
| POST | /datasets/{id}/intersections | 生成剖面 |
| GET | /benchmarks | 基准结果列表 |
| POST | /benchmarks | 保存基准结果 |

## 开发

```bash
cd ui && npm install
npm run build  # 构建 dist/
```
