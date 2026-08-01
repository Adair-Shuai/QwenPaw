Windows 侧的代码已经比较干净（单运行时、排除 whisper/torch、删插件 node_modules、LZMA、WebView2 走 bootstrapper 不打包），但仍有优化空间。按收益排序：

Windows 侧现状（已做的瘦身）
项	状态
whisper/torch（~2GB）	✅ 已排除（build_pyinstaller.ps1:106-110）
PyInstaller 冻结副本	✅ 已去掉，单运行时方案（避免双份 numpy/Pillow）
插件 node_modules	✅ 安装后已删除（L146-163）
NSIS 压缩	✅ lzma（tauri.conf.json:74）
WebView2	✅ downloadBootstrapper，不打包运行时
高收益（立即可做）
1. 预装包裁剪 scipy + matplotlib —— 预计省 200~400MB（安装后）


# build_pyinstaller.ps1:126
"numpy pandas scipy matplotlib requests openpyxl python-pptx"
scipy 安装后 ~100-150MB，matplotlib ~80-120MB，是当前除 torch 外的最大头。
关键问题：后端是否真的在启动路径上 import 它们？ 如果只是"处理 Excel/画图"这类低频功能，可以改成运行时按需 pip install（脚本注释里已经这么处理 whisper："Whisper can still be installed at runtime via pip if needed"——同样的思路可复制）。
保留核心：numpy pandas openpyxl python-pptx python-docx requests。
2. 安装后清理运行时垃圾 —— 预计省 100~200MB

在 build_pyinstaller.ps1 安装完依赖后（L127 之后）增加清理：
删全部 __pycache__ 和 *.pyc
删 pip 缓存目录 %TEMP% 与 ~/.cache/pip
删 python-runtime/python/Lib/site-packages 下的 *.dist-info 里的测试/文档（可选，收益小）
实测 PyInstaller 后目录里 .pyc 经常累计上百 MB。
3. Node 运行时瘦身 —— 省 20~40MB

stage_node_runtime.py 解包完整 Node v22 发行版。实际只需要 node.exe + npx 相关文件。可在 stage 后删除 include/、share/、*.lib、npm-cli.js 以外的大量文件，只保留运行所需。
如果插件系统只用 Node 跑 JS 脚本，甚至可以只留 node.exe。
中收益
4. 按需下载可选组件 —— 直降 100MB+

officecli（30-100MB）是否所有用户必用？可改为"首次使用 Office 转换时自动下载"，与 whisper 同理。权衡：牺牲首启离线能力。
5. NSIS solid 压缩 —— 安装包再小 ~5-10%

tauri.conf.json 已是 lzma，NSIS 还有 solid 模式（整个安装器当作一个数据块压缩，压缩率更高）。Tauri 支持通过 nsis 配置的 compression 已固定 lzma，若要 solid 需要自定义 NSIS 模板或在 nsis-hooks.nsh 里调整，收益一般、风险中等，可放最后。
6. 前端 dist 已确认无 sourcemap（vite.config.ts:375 production 关闭）——无需处理。

Windows 特有约束提醒
NSIS 2GB 硬限制：所有优化最终都服务于"安装包 < 2GB"这条红线。建议在 CI 增加体积断言（PACKAGING_REVIEW.md 的 O8），当 *-setup.exe > 1.8GB 时直接失败，避免再次踩 #12345 编译错误。
升级安装包（updater）：Tauri 的 updater 用 NSIS 生成的差分包不是真正的增量，体积优化同样惠及升级下载。
建议落地顺序
本次发布：清理 .pyc/pip 缓存（改一个脚本，零风险）
评估：检查后端代码里 scipy/matplotlib 的真实 import 路径，若可运行时安装则裁剪（收益最大，需要验证功能）
下个版本：Node 瘦身 + officecli 按需下载（需要产品决策）
现状体积构成（macOS 侧为例）
组成	估算体积	说明
PyInstaller onedir（含全部依赖）	1~2GB+	macOS 用 -e ".[full]" 包含 whisper→torch
预装通用 Python 包	300~500MB	numpy/pandas/scipy/matplotlib/Pillow 等
Node v22 运行时	~50MB	完整发行版原样打包
OfficeCLI	30~100MB	必需（Office 文档转换）
前端 dist	1020MB	已确认 production 无 sourcemap
高收益（立即可做）
1. macOS 排除 whisper/torch —— 最大头，预计省 1~2GB

build_pyinstaller.sh:71 用 .[full]，而 Windows 侧已经聪明地用 .[local,codex,qoder] 规避了 whisper。
whisper 在 audio_transcription.py 中是延迟导入（import whisper 在函数内），属于可选功能，不进包也不影响主功能。
同步处理 qwenpaw.spec：去掉 collect_data_files("whisper")（L74）、*collect_submodules("whisper")（L216）、metadata 里的 "openai-whisper"（L151）。
2. 预装包按需裁剪 —— 预计省 200~400MB

build_pyinstaller.sh:163 一次性预装 numpy+pandas+scipy+matplotlib+Pillow 等。scipy 与 matplotlib 是大头（各 100MB+）。
建议：只保留实际会用的（pandas、openpyxl、python-docx、python-pptx、Pillow、numpy、requests），scipy/matplotlib 移到"首次使用时自动 pip 安装"（已有内置 python-runtime 可做这件事）。
3. 双份 Python 依赖去重（macOS）

macOS 目前是 PyInstaller 冻结一份 + python-runtime 预装一份，numpy/Pillow 等大包被打了两次。
Windows 侧已经是"单运行时"方案（build_win_pyinstaller.ps1 直接靠 bundled runtime 跑，不冻结）。macOS 可评估对齐：彻底去掉 PyInstaller 冻结，统一用 python-runtime 直跑，体积可再降 30%+。
中收益
4. Node 运行时瘦身 —— 省 15~30MB

stage_node_runtime.py 解包完整发行版。实际只需要 node + npx 及少量 lib。可只保留 bin/、lib/node_modules/npm 必需部分，删除 include/、share/、文档等。
5. 二进制 strip —— 省 50~150MB

qwenpaw.spec 中 strip=False（L242/261/275）。Python 的 .so/.dylib 符号表巨大。CI 上开 strip=True 能显著缩包（macOS 注意签名顺序：先 strip 再 codesign）。
6. 清理 PyInstaller 冗余数据

_data_dirs 与 collect_tree(CONSOLE_DIST) 是全量拷贝。可在打产前删 __pycache__、.pyc、测试目录。
低收益 / 权衡项
压缩算法：NSIS 已用 lzma（tauri.conf.json L74），可再试 /SOLID lzma（固体压缩，安装包更小但安装变慢）。
运行时按需下载：Node/OfficeCLI 改首启按需拉取，体积直降 80~150MB，但牺牲离线体验和首启速度——不建议默认开启，可做成可选开关。
UPX 压缩：spec 注释已明确 UPX 触发杀软误报，不要开。
建议落地顺序
立即：macOS 排除 whisper/torch（改动 3 处，收益最大）
本次发布：预装包裁剪 + strip + Node 瘦身
下个大版本：评估 macOS 对齐 Windows 的单运行时方案，彻底去掉 PyInstaller 冻结副本