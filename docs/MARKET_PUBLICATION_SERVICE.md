# UGSci 市场加载、MCP 连接与 OSS 发布

## 用户入口

- 扩展 → UGSci：技能、MCP、人才目录分别显示，后台更新缓存。每次先显示 24 张卡片；搜索覆盖完整目录，“显示更多”继续追加。各目录可手动刷新，失败保留已有内容。
- MCP 市场 → 连接／管理连接：填写服务要求的字段，OAuth 服务在浏览器完成登录后返回，页面继续检测可用工具。只有工具检测通过才显示“已连接”。可重开授权页、取消等待、更新凭证或重新检测。尚未授权的新增 OAuth 连接保持禁用。
- 扩展 → 发布 UGSci 应用：选择本机已安装应用或 ZIP，检查包、确认公开内容，再投稿。更新必须保留 ID 并提高 `plugin.json` 的版本号。
- 扩展 → UGSci → 人才市场 → 发布 / 更新专家：填写公开模板或导入模板 JSON，检查归属及版本，再投稿。模板只包含公开元数据、提示词与推荐技能名称，不从本机专家自动读取聊天、记忆、知识文件或模型凭证。

“本地标准包”“已上传 OSS 待审核”“已公开发布”是不同状态。未配置远端服务时，本机打包不会上传 OSS；界面必须明确说明。普通用户使用管理员分配的投稿凭证，不需要也不应获得 OSS AccessKey。

## 部署发布服务

服务源码为 `src/qwenpaw/publisher_service.py`，部署在受控服务器。使用本仓库 Python 运行环境，额外安装官方 `oss2` 包，运行：

```sh
python -m uvicorn qwenpaw.publisher_service:app --host 127.0.0.1 --port 8090
```

在前方配置 HTTPS 反向代理，并限制请求大小、连接速率与并发。服务端 JSON 请求上限为 360 MiB（ZIP 上限 256 MiB，Base64 会增加体积），代理超时需要覆盖上传和读回校验。不要直接把本机运行时管理 API 暴露为公开投稿入口。

通过服务器的秘密管理或受限环境配置以下值，不要提交到仓库或打进桌面包：

| 配置 | 用途 |
| --- | --- |
| `OSS_ACCESS_KEY_ID` / `OSS_ACCESS_KEY_SECRET` | 仅服务端持有的 RAM 凭证 |
| `OSS_ENDPOINT` | 两桶所处区域的 HTTPS OSS endpoint |
| `OSS_APPS_BUCKET` | 应用／插件桶，现有默认市场读取 `ugsci-download` |
| `OSS_EXPERTS_BUCKET` | 专家桶，现有默认市场读取 `ugsci-awesome-tools` |
| `UGSCI_PUBLISH_IDENTITIES` | 投稿者及管理员身份 JSON 数组，存 token 的 SHA-256，不存明文 token |

必须明确配置上表的两个桶；服务不回退到单个 `OSS_BUCKET`，避免成功写入错误市场。服务需要在对应桶内访问 `publisher-private/*`；应用桶还需要 `files/plugins/*`、`metadata/plugins/index.json` 及只读 `metadata/index.json`；专家桶还需要 `agents/*`。按这些路径限制 RAM 权限，允许必要的 GetObject、PutObject、DeleteObject（写入锁清理）、GetObjectAcl、PutObjectAcl 和 GetBucketVersioning。应用桶主目录的 `products.plugins.index_url` 必须指向 `/metadata/plugins/index.json`，服务会预检此项，避免写入市场不可见的目录。

身份配置格式：

```json
[
  {"namespace":"alice","role":"contributor","token_sha256":"SHA256_OF_RANDOM_CONTRIBUTOR_TOKEN"},
  {"namespace":"market-admin","role":"admin","token_sha256":"SHA256_OF_DIFFERENT_RANDOM_ADMIN_TOKEN"}
]
```

使用密码学随机 token，单独、安全地交付给对应用户。投稿者的 ID 必须以自己的 namespace 加 `-` 开头，例如 `alice-reservoir`；更新还要匹配市场中记录的拥有者。管理员凭证能直接发布，只交给管理人员。撤销身份记录即可阻止后续请求。可用 `GET /v1/identity` 携带 `Authorization: Bearer <token>` 检查 namespace 和角色，不返回凭证明文。

客户端运行时只需以下非秘密地址（并重启运行时）：

```text
UGSCI_SUBMISSION_ENDPOINT=https://YOUR-PUBLISH-HOST/v1/submissions
UGSCI_PUBLISH_ENDPOINT=https://YOUR-PUBLISH-HOST/v1/releases
```

输入的投稿凭证仅在当前发布窗口中使用，随请求传给配置的发布服务，不写入浏览器 localStorage。必须使用 HTTPS；本地调试只允许回环 HTTP。

## 投稿、审核和更新

1. 投稿服务重新检查归属、版本、ZIP 内容和摘要；客户端预检不能替代服务端校验。
2. 投稿包及回执写入 `publisher-private/submissions/<namespace>/<kind>/<id>/<version>.*`，对象 ACL 为 private，公开市场目录保持不变。
3. 管理员核对回执及包内容，通过 `POST /v1/approve/<namespace>/<kind>/<id>/<version>` 携带管理员 Bearer token 审核发布。`kind` 为 `app`、`plugin` 或 `expert`。管理员也可使用 `/v1/releases` 直接发布。
4. 服务写入版本化公开内容，读回字节核对，再更新对应市场目录。专家发布生成 `expert.json`、`AGENTS.md`、`skills.json`，与市场安装入口兼容。
5. 同一版本不同内容返回冲突；相同内容重试可复用回执。低于已发布版本的更新被拒绝。已经发布的其他条目必须保留。

应用包和专家提示词会公开供用户下载使用，审核应检查知识产权、恶意代码和遗漏的私人信息。程序拒绝已知的敏感目录、密钥文件及专家模板中的运行时字段；这不等于能识别所有可能隐藏在普通源文件或提示词里的秘密。

内置 `document-forms` 应用有专门的模板完整性及隐私校验门禁，通用发布器拒绝绕过它（包括管理员直接发布）。继续使用受保护的专用发布流程，并遵守下述目录写入互斥约束。

## 写入一致性与恢复

每个桶用 `publisher-private/catalog-write.lock` 串行化写入，依赖 OSS 的 `x-oss-forbid-overwrite`。该机制不适用于已开启或暂停版本控制的桶，服务会拒绝这些配置；不要为启用本功能自动改变现有桶的版本控制设置。

所有市场写入工具应走此服务，旧发布脚本不要同时修改同一目录。服务会在覆盖目录前核对读取版本，但不能替任意外部写入器提供事务保证。进程被强制终止时可能留下锁；管理员确认没有活跃写入后，检查包、目录和回执，再恢复锁并重试。不要配置自动定时删除写入锁。

参考官方 [PutObject 参数](https://www.alibabacloud.com/help/en/oss/developer-reference/putobject)。MCP 交互参考 WorkBuddy 的 [连接器说明](https://open.workbuddy.cn/docs/connector)，具体服务是否支持标准 OAuth、客户端注册及权限，仍以该服务的接入要求为准。

## 验证范围

固定前端回归包含真实两份发布 bundle 的独立加载、分批卡片、全目录搜索、刷新失败保留、MCP 授权和连接状态；后端回归包含缓存慢网与去重、OAuth 会话隔离／取消，以及通过真实 HTTP 路由进行的投稿、审核、更新、归属、版本、私有对象和读回失败验证。OSS 测试使用隔离的存储边界，未使用真实用户凭证或向线上桶提交测试内容。部署后仍需在受控测试命名空间完成 HTTPS、RAM 权限和真实 OSS 端到端验收。
