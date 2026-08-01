---
name: office-documents
description: "使用 officecli 工具创建、读取、修改 Word/Excel/PowerPoint 文档。当需要创建 .docx/.xlsx/.pptx 文件、编辑文档内容、查看文档截图、验证格式或合并模板时触发。包括：从零创建演示文稿/报告/表格；修改现有文档的元素属性；截图查看渲染效果；验证文档格式正确性。"
license: Proprietary. LICENSE.txt has complete terms
metadata:
  builtin_skill_version: "1.0"
  qwenpaw:
    emoji: "📄"
---

# Office 文档操作（OfficeCLI）

## 前置依赖

- **officecli**：AI 专用的 Office 处理工具，支持 Word/Excel/PPT 的创建、修改及高保真渲染
- 安装地址：https://github.com/iOfficeAI/OfficeCLI/releases
- 如果 officecli 未安装，所有 office_* 工具会返回友好错误提示

## 工具清单

### 默认工具（默认启用）

| 工具 | 用途 | 写权限 |
|------|------|--------|
| `office_create_document` | 创建空白文档 | 是 |
| `office_add_element` | 添加元素（幻灯片/形状/段落/工作表等） | 是 |
| `office_set_properties` | 设置元素属性 | 是 |
| `office_get_element` | 获取元素详情 | 否 |
| `office_query_elements` | 查询元素（CSS 选择器） | 否 |
| `office_remove_element` | 删除元素 | 是 |
| `office_view_document` | 查看文档（outline/html/issues） | 否 |
| `office_view_screenshot` | 截图查看渲染效果 | 否 |
| `office_validate_document` | 验证文档格式 | 否 |
| `office_merge_template` | 合并模板数据 | 是 |
| `office_batch_operations` | 批量操作 | 是 |

### 高级工具（按需启用，`enabled_by_default=False`）

这些工具默认不加载，以减少工具选择的认知开销。需要精细控制时再启用。

| 工具 | 用途 | 写权限 |
|------|------|--------|
| `office_move_element` | 移动/重排文档内元素 | 是 |
| `office_swap_elements` | 交换两个元素的位置 | 是 |
| `office_get_text` | 提取文档纯文本 | 否 |
| `office_get_stats` | 获取文档统计信息（页数、字数、形状数） | 否 |
| `office_import_data` | 导入 CSV/JSON 数据到 Excel | 是 |
| `office_refresh_fields` | 刷新目录/页码/交叉引用（docx） | 是 |
| `office_raw_get` | 读取原始 OOXML 部件（50KB 截断） | 否 |
| `office_raw_set` | 通过 XPath 修改原始 OOXML | 是 |

> **提示：** 如需完整 CLI 参考（L1→L2→L3 策略、所有元素类型、属性格式），加载 `officecli-reference` 技能。如需格式特定的深度 schema，加载 `officecli-docx`、`officecli-pptx` 或 `officecli-xlsx`。

## 标准工作流

### 创建文档

```
1. office_create_document("report.pptx")
2. office_add_element("report.pptx", "/", "slide", {"title": "标题页"})
3. office_add_element("report.pptx", "/slide[1]", "shape", {"type": "text", "content": "内容"})
4. office_view_screenshot("report.pptx", 1)  → 查看渲染效果
5. 如果有问题 → office_set_properties 修正 → 再次截图确认
6. office_validate_document("report.pptx")  → 验证格式
```

### 修改现有文档

```
1. office_view_document("existing.docx", "outline")  → 查看结构
2. office_get_element("existing.docx", "/", 2)  → 查看根元素及子元素
3. office_set_properties("existing.docx", "/paragraph[3]", {"text": "新内容"})
4. office_view_screenshot("existing.docx", 1)  → 确认修改效果
```

### 模板合并

```
1. office_merge_template("template.docx", "output.docx", {"name": "张三", "date": "2024-01-01"})
2. office_view_screenshot("output.docx", 1)  → 查看合并结果
```

## 属性格式

| 类型 | 格式 | 示例 |
|------|------|------|
| 尺寸 | 数字+单位 | `2cm`, `1in`, `72pt`, `96px` |
| 颜色 | 十六进制/名称/RGB | `FF0000`, `red`, `rgb(255,0,0)`, `accent1` |
| 字号 | 数字+单位 | `14`, `14pt`, `10.5pt` |
| 布尔 | true/false | `true`, `false` |

## 中文/CJK 论文格式速查表

创建中文学术论文、报告等文档时，直接在 `office_add_element` 的 `props` 中设置以下属性，无需再调用 `office_set_properties`。

### 常用中文字号对照

| 中文字号 | pt 值 | 属性值 | 常见用途 |
|---------|-------|--------|---------|
| 初号 | 42pt | `"42pt"` | 大标题 |
| 小初 | 36pt | `"36pt"` | 封面标题 |
| 一号 | 26pt | `"26pt"` | |
| 小一 | 24pt | `"24pt"` | |
| 二号 | 22pt | `"22pt"` | 论文标题 |
| 小二 | 18pt | `"18pt"` | 节标题 |
| 三号 | 16pt | `"16pt"` | 章标题 |
| 小三 | 15pt | `"15pt"` | |
| 四号 | 14pt | `"14pt"` | 节标题 |
| 小四 | 12pt | `"12pt"` | **正文（最常用）** |
| 五号 | 10.5pt | `"10.5pt"` | 摘要、图表题注 |
| 小五 | 9pt | `"9pt"` | 页眉页脚、脚注 |

### 正文段落（宋体小四）

```python
office_add_element("论文.docx", "/body", "paragraph", {
    "text": "正文内容……",
    "font": {"eastAsia": "宋体", "ascii": "Times New Roman"},
    "size": "12pt",
    "align": "justify",          # 两端对齐
    "firstLineIndent": "480",    # 首行缩进2字符（12pt × 2 × 20 twips/pt = 480）
    "lineSpacing": "1.5x",       # 1.5倍行距
})
```

> **注意：** `firstLineIndent` 使用 twips（缇），不是 CSS 单位。1 pt = 20 twips。2 个 12pt 汉字 = 2 × 12 × 20 = 480 twips。不要用 `"2em"` 或 `"2char"`。

### 标题

```python
# 论文标题：黑体二号居中
office_add_element("论文.docx", "/body", "paragraph", {
    "text": "基于常规测井资料的储层评价方法研究",
    "font": {"eastAsia": "黑体"},
    "size": "22pt",
    "bold": True,
    "align": "center",
    "spaceAfter": "12pt",
})

# 一级标题：黑体三号
office_add_element("论文.docx", "/body", "paragraph", {
    "text": "1 引言",
    "style": "Heading1",
    "font": {"eastAsia": "黑体"},
    "size": "16pt",
    "bold": True,
})

# 二级标题：黑体四号
office_add_element("论文.docx", "/body", "paragraph", {
    "text": "3.1 测井曲线标准化",
    "style": "Heading2",
    "font": {"eastAsia": "黑体"},
    "size": "14pt",
    "bold": True,
})
```

### 摘要与关键词

```python
# "摘要："加粗 + 正文宋体小四
office_add_element("论文.docx", "/body", "paragraph", {
    "text": "摘 要：本文针对碎屑岩储层……",
    "font": {"eastAsia": "宋体"},
    "size": "12pt",
    "firstLineIndent": "480",
    "lineSpacing": "1.5x",
})
```

### 表格（三线表）

```python
# 创建三线表：先 add 表格，再逐行设置
office_add_element("论文.docx", "/body", "table", {
    "rows": 5, "cols": 4, "width": "100%"
})
# 表头行
office_set_properties("论文.docx", "/body/tbl[1]/tr[1]", {
    "header": True,
    "c1": "层段", "c2": "深度(m)", "c3": "孔隙度(%)", "c4": "解释结论",
})
# 三线表样式：表头上下加线、底部加线
office_set_properties("论文.docx", "/body/tbl[1]/tr[1]/tc[1]/p[1]", {
    "pbdr.top": "single;12;000000",     # 顶部粗线
    "pbdr.bottom": "single;6;000000",   # 表头底部细线
})
office_set_properties("论文.docx", "/body/tbl[1]/tr[5]/tc[1]/p[1]", {
    "pbdr.bottom": "single;12;000000",  # 底部粗线
})
```

### 图片插入

```python
office_add_element("论文.docx", "/body/p[5]", "image", {
    "src": "well_log_figure.png",
    "width": "13cm",
    "alt": "图1 X井测井曲线综合图",
})
# 图题（宋体五号加粗居中）
office_add_element("论文.docx", "/body", "paragraph", {
    "text": "图1 X井 2150–2300m 测井曲线综合图",
    "font": {"eastAsia": "宋体"},
    "size": "10.5pt",
    "bold": True,
    "align": "center",
})
```

### 页眉页脚与页码

```python
# 页眉
office_add_element("论文.docx", "/", "header", {
    "type": "default",
    "text": "测井解释技术研究",
    "font": {"eastAsia": "宋体"},
    "size": "9pt",
    "align": "center",
})
# 页脚（带自动页码域）
office_add_element("论文.docx", "/", "footer", {
    "type": "default",
    "text": "第 ",
    "field": "page",
    "size": "9pt",
    "align": "center",
})
```

### 常见错误与正确写法

| 错误写法 | 正确写法 | 说明 |
|---------|---------|------|
| `{"font_eastAsia": "宋体"}` | `{"font.eastAsia": "宋体"}` 或 `{"font": {"eastAsia": "宋体"}}` | 点分隔或嵌套 dict |
| `{"firstLineIndent": "2em"}` | `{"firstLineIndent": "480"}` | twips，非 CSS 单位 |
| `{"lineSpacing": "1.5"}` | `{"lineSpacing": "1.5x"}` | 需要 `x` 后缀 |
| `{"size": 12}` | `{"size": "12pt"}` | 字符串，带单位 |

## 嵌套属性自动展开

`office_add_element` 和 `office_set_properties` 支持**嵌套 dict 属性**，会自动展开为点分隔格式：

| 传入 | 实际 CLI 参数 |
|------|-------------|
| `{"font": {"eastAsia": "宋体"}}` | `--prop font.eastAsia=宋体` |
| `{"font": {"eastAsia": "宋体", "ascii": "Times New Roman"}}` | `--prop font.eastAsia=宋体 --prop font.ascii=Times New Roman` |
| `{"font.eastAsia": "宋体"}` | `--prop font.eastAsia=宋体`（直接透传） |
| `{"bold": True}` | `--prop bold=true`（布尔自动转换） |

两种写法等价，按个人习惯选择即可。

## 批量操作（office_batch_operations）

批量操作的字段名为 `command`（也接受 `op` 作为别名）。旧版 docstring 中的 `action` 会被自动映射为 `command`，但**新代码应使用 `command`**。

```python
# 正确写法
office_batch_operations("论文.docx", [
    {"command": "add", "parent": "/body", "type": "paragraph",
     "props": {"text": "第一段", "size": "12pt"}},
    {"command": "add", "parent": "/body", "type": "paragraph",
     "props": {"text": "第二段", "size": "12pt"}},
    {"command": "set", "path": "/body/p[1]",
     "props": {"font": {"eastAsia": "宋体"}, "align": "justify"}},
])
```

> **注意：** 批量操作中的 `props` 也支持嵌套 dict 自动展开。

## 元素路径

路径使用类似 XPath 的语法：

| 路径 | 含义 |
|------|------|
| `/` | 文档根 |
| `/slide[1]` | 第 1 张幻灯片 |
| `/slide[1]/shape[2]` | 第 1 张幻灯片的第 2 个形状 |
| `/sheet[1]/row[3]/cell[2]` | 第 1 个工作表第 3 行第 2 列 |
| `/paragraph[1]` | 第 1 个段落 |

## 视觉检查（重要）

**创建或修改文档后，务必使用 `office_view_screenshot` 截图检查渲染效果。**

检查要点：
- 元素是否重叠
- 文本是否溢出
- 颜色对比度是否足够
- 布局间距是否合理
- 是否有残留的占位符文本

如果发现问题，使用 `office_set_properties` 修正后再次截图确认，直到满意为止。

## 关联技能

如需更深入的知识，加载以下配套技能：

| 技能 | 何时加载 |
|------|---------|
| `officecli-reference` | 需要完整 CLI 命令参考、L1→L2→L3 策略或常见陷阱 |
| `officecli-docx` | 处理 .docx 且需要完整元素 schema（样式、目录、修订追踪、域） |
| `officecli-pptx` | 处理 .pptx 且需要完整元素 schema（动画、过渡、图表、连接符） |
| `officecli-xlsx` | 处理 .xlsx 且需要完整元素 schema（透视表、条件格式、数据验证） |
