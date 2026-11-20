# 工作日程 0.2.0

在 UGSci 的应用列表打开“工作日程”，页面地址为 `/apps/research-agenda`。源码位于本目录，运行时通过 PawApp 注册后端和宿主 React 页面。

## 使用

1. 粘贴聊天记录或会议纪要，也可以选择、拖入或粘贴截图。支持 PNG、JPEG、WebP，最多四张，每张 4MB。
2. 填写记录中的姓名或昵称及记录日期。记录日期用于解释“明天”“周五”等约定。
3. 点击“整理成待办”。当前专家配置的模型读取材料，提出事项、负责人、时间和待反馈关系。
4. 在左右对照页面核对来源。每条任务可改名称、截止日、计划日、负责人、归属和预计用时。勾选后保存，也可以选择无需新增。
5. 在事项列表更新进度，在等待反馈中查看联系人或复制跟进草稿。点击“安排当天工作”查看排期预览。

材料和任务保存到宿主工作目录 `apps/research-agenda/<账户与专家摘要>/agenda.sqlite3`。刷新后可继续核对材料。来源变更、取消和历史依据保留；重复确认幂等，已变化的任务会阻止过期方案覆盖。可导出完整 JSON 备份。旧版独立网页的本地存储保留，原 `ui/index.html` 提供旧数据下载入口。

## 同类产品调研与实现取舍

调研日期为 2026-11-17。下表依据产品官网与官方使用文档，未把营销介绍当作实测结论。

| 产品 | 参考的做法 | 本版实现 |
| --- | --- | --- |
| Motion | 邮件转任务，提取标题、优先级、期限和预计时长 | 接收文字与截图，输出结构化候选，未知截止日保持为空 |
| Granola | 从承诺中识别行动，关联负责人、交付物与来源 | 每条候选保留逐字引文，截图保存识别文字与原图 |
| Lindy | 将会议行动与后续跟进串联 | 单独记录等待联系人，提供跟进消息草稿 |
| Tasklet | 在日常渠道中接收请求，保留工作上下文 | 先实现统一投递入口及材料记录，后续可接消息渠道 |
| Sunsama | 结合已有工作起草日计划，再审核调整 | 已确认工作参与排期，安排午休和活动间缓冲 |
| Reclaim | 日历变更前展示预览，发现时间冲突 | 保留固定会议，提示冲突及容量不足 |

来源链接

- [Motion Email Integration](https://www.usemotion.com/blog/email-integration)
- [Granola Meeting action items](https://www.granola.ai/blog/meeting-action-items-ai-extraction)
- [Lindy Product](https://www.lindy.ai/product)
- [Tasklet Guide](https://tasklet.ai/learn/guide)
- [Sunsama Daily Planning](https://help.sunsama.com/docs/usage-guides/daily-planning/)
- [Reclaim Chat overview](https://help.reclaim.ai/en/articles/17124965-reclaim-chat-overview-ai-assistant-for-your-calendar)

## 第一版范围

模型提取支持文字和图片，图片能力取决于当前专家所选模型。材料只用于模型单次分析，无工具执行。服务器核对文本引文；图片引文核对的是模型识别稿，需要人工对照原图。

主动提示在应用打开时及每分钟刷新，展示逾期、当日到期、待确认材料和等待反馈。等待超过三天未更新显示跟进提示。当前外部消息渠道、后台推送和日历同步尚待接入。

排期使用可解释的规则，按截止日期、优先级和科研类别查找空档。工作时间暂定 09:00—18:00，午休 12:00—13:30，任务间缓冲 15 分钟。时间块为预览，按最新事项重新计算。预估工时和不确定日期可在保存前修改。

## 开发与回归

- `node plugins/apps/research-agenda/build.mjs`
- `.venv/Scripts/python.exe -m pytest plugins/apps/research-agenda/tests/test_agenda.py -q -p no:cacheprovider`
- 在 console 目录运行 `node node_modules/vitest/vitest.mjs run src/plugins/researchAgenda.test.tsx`

行为测试已登记前后端固定清单。验证记录保存在 `.codex-tmp/research-agenda`。

## 本轮验证记录

宿主原有固定前端回归 243 套、3688 项通过；本应用新增挂载行为回归 5 项单独通过。Console 类型检查、插件构建、格式和 Python 静态检查通过。后端应用专项 10 项通过。新增套件及关键用例登记到原清单，前端清单为 244 套，后端清单为 267 套；后端全量未执行。

通过本地运行中的 UGSci 应用列表实际打开 0.2.0，真实模型完成聊天提取、截图识别、确认保存、会议改期及刷新恢复。日程预览核对改期会议为 2026-11-19 16:00，保留 revision=2 和原始来源。安装副本的三份后端源码、前端产物及 manifest 与仓库一致。

当前默认专家下保留四条“示例 · 基金申请”工作事项和三份合成验收材料，供试用核对。主界面、截图识别画面及验证日志位于 `.codex-tmp/research-agenda`。后台主动推送、外部日历同步、跨设备同步与生产安装包验证仍待实施。
