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
