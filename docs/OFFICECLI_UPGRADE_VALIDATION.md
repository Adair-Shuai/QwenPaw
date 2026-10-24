# OfficeCLI 引擎升级与预览回归

2026-10-20 校核，官方最新发布为 [v1.0.157](https://github.com/iOfficeAI/OfficeCLI/releases/tag/v1.0.157)。

## 修复与适配

- 桌面构建不再查询 latest 失败后静默退回旧版本。所有平台使用 `scripts/pack-tauri/officecli-release.json` 的同一审核版本，核对官方 SHA-256，并执行二进制 `--version`。命中本地版本标记也不能跳过校验；新引擎验证成功后才替换旧文件。
- CSV 导入增加 `delimiter`、`decimal`，导入后通过现有保存及读回流程核实写入；Word 表单内容控件可用 `office_view_document(mode="forms")` 查询。现有工具保留原接口，新增参数可选。
- 合并和批处理使用独立临时文件，避免并发调用覆盖同名 JSON；成功、失败和序列化异常均清理临时文件。
- 工作区默认 Office 渲染器提供“文档阅读／打印版式”。保留 OfficeCLI 完整 HTML、批注和脚本沙箱；打印提供翻页、缩放，失败时提示并退回阅读，仍可切换重试。
- 两种预览均携带 Agent／会话／项目作用域；晚到的旧请求不能替换当前预览。切换文件或会话重置打印状态并释放图像资源。
- `.docm/.xlsm/.pptm` 进入 Office 引擎预览；不将宏文件交给普通 OOXML 浏览器兼容解析器。编辑保留宏负载，不执行宏，不扩展为宏文件新建或模板合并承诺。

## 固定验证入口

```powershell
python scripts/pack-tauri/stage_officecli.py --dest console/src-tauri/binaries/officecli
python -m pytest tests/system/test_officecli_engine.py -q
python -m pytest tests/unit/agents/tools/test_office_tools.py tests/unit/routers/test_workspace_office.py -q
python scripts/verify_update_regressions.py
cd console
npm run test:fork-features
npx tsc -b --noEmit
```

真实引擎测试不模拟 CLI，也不因缺少引擎而跳过：覆盖三种文档的工具创建、写入、保存后重新打开及 HTML 只读预览，CSV 小数与分隔符、Word 批注、宏负载保留和内容控件查询。测试只生成临时合成文档，不使用业务原件。常规 CI 的 Python 3.11 和 nightly 各平台 Python 3.11 均执行真实引擎测试。

前端清单保护实际注册的 Office 渲染器，以及阅读／打印往返、截图失败后重试、缩放和会话切换。版本锁、缓存篡改、错误哈希、错误实际版本、校验失败保留旧引擎均有打包回归。

## 本机验证边界

本轮结果：真实引擎测试 7 项通过；Office 工具、路由及引擎打包单元回归 76 项通过；自有功能 31 个文件、583 项通过；更新回归 261 项通过、1 项跳过；TypeScript 类型检查与生产构建通过。新增真实引擎测试及前端预览测试均未跳过。更新回归中的跳过项来自既有平台条件，未改变其跳过规则。

Windows 已运行真实 v1.0.157；另生成 Word HTML 截图并检查批注标识。Mac／Linux 的下载哈希已固定，真实执行由 CI 矩阵验证，本机结果不能替代这些平台的执行结果。截图的原生 Word 路径仍依赖系统 Word；HTML 截图依赖可用浏览器。旧 `.doc` 专用插件授权与分发规则保持原样。

此项修改尚不代表已重新发布桌面安装包或已更新用户现有安装。
