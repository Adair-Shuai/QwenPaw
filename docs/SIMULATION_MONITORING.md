# 数模运行中心与结果监测

数模任务启动后，工具结果附带持久的 `ugsci_simulation` 引用。聊天卡片可以展开实时结果、打开会话右侧“数模监测”，或进入 `/run-center?run_id=...`。三个入口共用 Run Center 的 `SimulationMonitor`。历史卡片默认折叠，不为所有旧任务建立后台连接。

## 已接入的结果链路

- ECLIPSE、OPM Flow 与兼容格式：摘要向量、井曲线及已有日志指标；EGRID/GRID、INIT、完整 UNRST 报告步自动转换为场图。场图可选属性、报告步与“跟随最新”，更新时保留视角。
- CMG IMEX/GEM/STARS：复用现有文本、CSV、SR3 读取器采集曲线；场图仅在终态读取同 case 的稳定 SR3，提取可读的全部实际时间步。不同 CMG 版本的 SR3 布局仍需工程文件验证，运行中场数据不声称支持 SWMR。
- OPM Flow 增加 `opm_flow` 适配器。引擎管理中配置实际 flow 可执行路径，或通过 `OPM_FLOW_EXECUTABLE` 提供。需要自行已有可运行的求解器环境；本实现不安装 OPM、WSL 或商业许可证。
- 未支持的结果格式给出原因，继续保留已有日志和最后可用快照。COMSOL 原生 MPH 的数值提取仍依赖导出文件或专用读取器。

## 持续监测与后处理

后台按约 5 秒采集稳定的同名 case 文件，不依赖浏览器保持打开。SQLite 保存完整已解析曲线及快照，前端使用 SSE 通知并以约 3 秒轮询兜底；求解器终止后继续等待最终结果归档。页面显示最近数据时间、采集状态、失败原因及重试入口。旧任务可主动“重新采集结果”。

曲线支持变量／井筛选、缩放、按单位分图和完整单序列 CSV 下载。缺测用 null 断线，未知单位不推断为 SI；时间回退保留断点。界面约 600 点的采样用于展示，CSV 读取持久化完整序列。在线曲线源文件限制为单文件 128 MiB、一次采集总计 256 MiB，超限显示警告，不伪装成完整读取。

UNRST 仅发布完整 ENDSOL 边界内的场；写到一半或转换失败时保留上一版本。新增输出发布到 `WORKING_DIR/ugsci/visualization`，数模快照存于作业库旁的 `simulation-results`，原文件不改写。源文件重新运行后，早于本次任务的动态输出被排除；静态网格与初始属性可复用。当前浏览器渲染仍受客户端内存和 GPU 限制，超大网格的远程分块／服务端渲染尚未实现。

运行中心原有日志、任务控制、模型及研究功能保留。通用任务恢复不代表模拟器断点续算；没有确认可用的模拟器恢复能力时，暂停／恢复控件禁用。

## 组件与接口

- [Apache ECharts](https://echarts.apache.org/)：采用 SVG 曲线、动态数据更新与缩放，单独懒加载产物，保留缺测断线。
- [XTGeo](https://xtgeo.readthedocs.io/) 与 [resfo](https://github.com/equinor/resfo)：读取油藏网格及完整二进制报告步。沿用工程格式读取器，避免让语言模型解析二进制数组。
- [h5py](https://docs.h5py.org/)：读取稳定 SR3/HDF5 快照。
- [OPM Flow](https://opm-project.org/?page_id=955)：复用 Eclipse 兼容输入输出，独立适配启动命令。
- [ResInsight](https://resinsight.org/) 与 [ParaView/trame](https://kitware.github.io/trame/)：参考任务、曲线、场图分工；本次未嵌入其运行时。后续超大网格可考虑远程渲染服务。

结果 API：`GET /api/ugsci/sim/jobs/{run_id}/results` 只读取持久快照；`GET .../results/export?series_id=...` 导出完整序列；`POST .../results/refresh` 显式启动采集。结果路由使用宿主解析并验证的 Agent 作用域。场图沿用既有可视化目录 API；这不是多租户存储隔离方案。

共享 UI：`window.QwenPaw.runCenter.SimulationMonitor` 接收 `runId`、`scope:{agentId,chatId}` 与可选 `compact`。查看器通过 `refresh-dataset` 更新同一实例，静态脚本采用重新验证缓存，避免长期缓存旧协议。

## 验证与运行依赖

`pip install -e '.[test]'` 提供真实合成格式的回归依赖；运行环境按需安装 `xtgeo>=4.27,<5`、`resfo>=5,<6`、`h5py>=3.10,<4`。VTK 导入还需要 `meshio>=5.3,<6`。这些依赖已在本次开发虚拟环境验证，不表示所有用户安装环境均已具备。

固定门禁为 `console/npm run test:fork-features`、console 与插件类型检查、`python scripts/verify_fork_regressions.py`。新增测试加载真实发布 JS 与真实 ECharts，后端读取真实合成工程格式。合成文件验证提取、传输和呈现，不证明商业许可证、真实工程计算收敛、生产规模性能或跨平台安装包均已验证。

## 按任务生成 OpenUI 展示

运行中心将任务类型、已产生的结果和展示意图分开处理。自动模式依据 operation、阶段、成果和结果结构选择面板；助手可根据用户要求保存一个声明式展示方案。OpenUI 负责布局，曲线与场图继续绑定真实结果服务。数据轮询不会触发额外模型请求。

| 任务与实际结果 | 展示重点 |
| --- | --- |
| 数值模拟 | 状态、井曲线、收敛指标、可用场图 |
| 批量研究／方案分析 | 已返回的指标、结构化结果、阶段和成果 |
| 文件导入 | 导入状态、阶段、质量警告和输出成果 |
| 工作流／报告 | 执行阶段、已生成成果与来源 |
| 未识别任务 | 可读的结果、阶段和成果；不推断不存在的物理量 |

可以在聊天中要求“这个任务优先展示注采气曲线”“把压力场放到前面”“按标签页组织结果”。助手先调用 `get_run_presentation` 读取任务与可用数据绑定，再通过 `set_run_presentation` 选择面板、标题、顺序和默认筛选。模型生成的是展示意图，数值和单位仍来自任务结果。具体语言理解效果取决于当前 Agent 的模型。

展示方案独立持久化，编辑带 revision 检查。用户可在面板内调整展示重点及布局并保存；已有手动曲线筛选和场图视角优先于自动默认值。警告、失败信息和运行控制始终可见。OpenUI 未启用时使用基础布局，任务监测继续可用。

扩展接口为 `window.QwenPaw.openui.TaskLayout`：通过官方 OpenUI Renderer 和受控 `TaskPanel` 组件组合宿主面板。标题、面板内容及可见性使用独立数据上下文，切换标签页保留已挂载组件。禁用或重载 OpenUI 会撤销共享渲染能力。

`GET /api/run-center/runs/{run_id}/presentation` 返回当前方案、revision、组件目录和可用绑定；`PUT` 接受 `{plan, expected_revision}`。方案版本为 `version: 1`，支持 stack、tabs、dashboard，以及 overview、metrics、curves、fields、stages、table、artifacts、provenance 面板。可选绑定仅选择已有 series／metric ID 和场属性，不接受结果数值、任意 API、脚本或求解指令。展示编辑有独立记录，不改变求解器生命周期。
