# 专家包发布

此目录维护可安装专家的源码与构建配方；`agents/` 继续保留旧专家模板。正式包仍进入现有 `ugsci-awesome-tools` 桶，桌面软件和组件继续使用 `ugsci-download`。

## 配置一次

1. 先交付含专家包安装器及新发布接口的 QwenPaw 版本，并部署发布服务。旧宿主没有安装 API；单靠 `core_min` 不能让旧宿主获得新功能。
2. 设置仓库变量 `UGSCI_EXPERT_TOOLCHAIN_REF`，值为包含 `prepare_expert_recipe.py`、`build_expert_release.py`、`seal_expert_release.py`、`publish_expert_release.py` 的 QwenPaw **完整 40 位提交 SHA**。不使用浮动分支。设置只读跨仓库 Secret `UGSCI_TOOLCHAIN_READ_TOKEN`，仅授权读取 QwenPaw。
3. 配置 `expert-release` Environment（建议启用维护者审核）。其 Secrets 为 `UGSCI_EXPERT_SIGNING_KEY`、`UGSCI_PUBLISH_TOKEN`；Variables 为 `UGSCI_EXPERT_PUBLIC_KEY`、`UGSCI_PUBLISH_SERVICE_URL`。公钥必须与客户端及服务端信任根一致。构建任务不持有签名私钥和发布凭证。
4. 旧模板目录导入任务需要可访问相同发布服务；配置该任务的 `UGSCI_PUBLISH_SERVICE_URL` 和管理员 `UGSCI_PUBLISH_TOKEN`，只能走服务写入 `agents/manifest.json`。不要让旧 `ossutil sync --delete` 或其他工具同时写入这个目录。发布服务继续复用已有 OSS 锁和回读校验。
5. 服务端 RAM 权限增加 `expert-packages/*`，保持 `agents/*` 和 `publisher-private/*` 所需权限。Secrets 必须通过 GitHub/服务器的秘密配置设置，不写进仓库。

## 制作及发布

复制 `version-demo/` 的结构。`payload/` 放说明、技能和 MCP 入口；`recipe.json` 声明身份、版本、工具契约、自检和平台；每个平台提供完整依赖锁。锁中每个直接/传递依赖均须固定版本及 SHA-256，且有适用的预构建 wheel。自有方法库先构建不可变 wheel，使用带摘要的固定地址写入锁。源码包和安装时现场编译不支持。

运行 Actions 的 **Build and publish expert package**，选择配方路径。默认 `publish=false`，只进行平台构建、离线环境安装与实际 MCP 自检，产物保留 14 天。选择 `publish=true` 才进入受保护的签名/发布阶段：

1. Windows、Apple Silicon 和 Intel macOS 分别构建对应声明的平台；任一失败都不签名发布。
2. 新的签名任务只检查产物，不执行专家代码，生成每个平台清单及签名的平台索引。
3. 发布服务重新验签、检查完整归档和嵌套依赖内容，预检所有版本冲突。
4. 不可覆盖地上传包，逐个回读检查，最后合并更新市场目录；现有其他作者和专家条目保留。

同一 ID/版本下的全部平台是一次完整发行。同版本重试仅接受完全相同内容；补平台、修改依赖或说明均需要增加版本。不要清理仍被已安装专家使用的历史摘要包。需要撤回时暂停新发布、保留证据并下架目录；自动吊销与原地升级回滚尚未交付，目录下架不等同于吊销已有签名。

`version-demo` 是发行流程演示，不代表现有油藏/PVT 模板已经转换。其 Python 3.11 配方可在 Windows 本地验收；其他平台仍须通过原生任务和桌面安装验收。GitHub 运行器选择依据其官方表：<https://docs.github.com/en/actions/reference/runners/github-hosted-runners>。
