# COMSOL MCP 安装配置指南

## 概述

此文档描述如何将COMSOL Multiphysics MCP集成到QwenPaw项目中。

## COMSOL MCP 功能

COMSOL MCP是一个强大的多物理场仿真自动化服务，提供以下功能：

- **模型管理**：创建、加载、保存、版本控制（9个工具）
- **几何建模**：块体、圆柱体、球体、布尔操作（14个工具）
- **物理配置**：热传导、流体流动、静电学、固体力学（16个工具）
- **网格划分**：自动网格生成（3个工具）
- **求解器**：静态/时域研究（8个工具）
- **结果分析**：表达式评估、图表导出（9个工具）
- **知识库集成**：嵌入式指南 + PDF语义搜索（8个工具）

**总计：80+ 个工具**

## 系统要求

- COMSOL Multiphysics 5.x 或 6.x
- Python 3.10+
- Java运行时环境（COMSOL需要）

## 安装步骤

### 1. 安装Python依赖

```bash
# 切换到COMSOL MCP目录
cd "COMSOL_Multiphysics_MCP/COMSOL_Multiphysics_MCP-main"

# 安装COMSOL MCP包及其依赖
python311.exe -m pip install -e .

# 安装知识库附加依赖（可选）
python311.exe -m pip install pymupdf chromadb sentence-transformers
```

### 2. 配置MCP客户端

在QwenPaw控制台中配置COMSOL MCP客户端：

**方法1：JSON导入格式**

创建 `comsol-mcp-config.json` 文件：

```json
{
  "mcpServers": {
    "comsol": {
      "name": "COMSOL Multiphysics MCP",
      "description": "COMSOL多物理场仿真MCP服务，支持建模、网格划分、求解和结果分析",
      "command": "python",
      "args": [
        "-m",
        "src.server"
      ],
      "cwd": "C:/Users/75659/Documents/QwenPaw/COMSOL_Multiphysics_MCP/COMSOL_Multiphysics_MCP-main",
      "env": {
        "HF_ENDPOINT": "https://hf-mirror.com"
      },
      "enabled": true
    }
  }
}
```

**方法2：表单配置格式**

- **客户端键名**：`comsol`
- **名称**：`COMSOL Multiphysics MCP`
- **描述**：`COMSOL多物理场仿真MCP服务`
- **传输类型**：`stdio`
- **命令**：`python`
- **参数**：`-m src.server`
- **工作目录**：`C:/Users/75659/Documents/QwenPaw/COMSOL_Multiphysics_MCP/COMSOL_Multiphysics_MCP-main`
- **环境变量**：
  - `HF_ENDPOINT=https://hf-mirror.com`

### 3. 构建PDF知识库（可选）

```bash
python scripts/build_knowledge_base.py
```

### 4. 测试COMSOL MCP服务器

```bash
python -m src.server
```

## 配置QwenPaw集成

### 前端配置

1. 打开QwenPaw控制台
2. 导航到 **智能体 → MCP**
3. 点击 **+ 创建** 按钮
4. 选择JSON导入或表单方式
5. 粘贴COMSOL MCP配置
6. 点击 **创建** 完成导入

### 环境变量配置

推荐的环境变量设置：

```bash
# COMSOL安装路径（如果不在默认位置）
COMSOL_INSTALL_DIR=C:/Program Files/COMSOL/COMSOL61

# HuggingFace镜像（中国大陆用户）
HF_ENDPOINT=https://hf-mirror.com

# COMSOL许可证服务器
COMSOL_LICENSE_SERVER=your-license-server
```

## 使用示例

### 案例1：芯片热模型

```python
# 使用脚本：client_script/create_chip_tsv_final.py
# 功能：3D热分析带通硅孔(TSV)的硅芯片
```

### 案例2：微混合器流体流动

```python
# 使用脚本：client_script/create_micromixer_auto.py
# 功能：微流控通道中的3D层流仿真
```

## 工具类别说明

### Session工具(4)
- `comsol_start` - 启动本地COMSOL客户端
- `comsol_connect` - 连接到远程服务器
- `comsol_disconnect` - 清除会话
- `comsol_status` - 获取会话信息

### 模型工具(9)
- `model_load` - 加载.mph文件
- `model_create` - 创建空白模型
- `model_save` - 保存到文件
- `model_save_version` - 带时间戳保存
- `model_list` - 列出已加载模型
- `model_set_current` - 设置活动模型
- `model_clone` - 克隆模型
- `model_remove` - 从内存移除
- `model_inspect` - 获取模型结构

### 参数工具(5)
- `param_get` - 获取参数值
- `param_set` - 设置参数
- `param_list` - 列出所有参数
- `param_sweep_setup` - 设置参数扫描
- `param_description` - 获取/设置描述

### 几何工具(14)
- `geometry_list` - 列出几何序列
- `geometry_create` - 创建几何序列
- `geometry_add_feature` - 添加通用特征
- `geometry_add_block` - 添加矩形块
- `geometry_add_cylinder` - 添加圆柱体
- `geometry_add_sphere` - 添加球体
- `geometry_boolean_union` - 对象并集
- `geometry_boolean_difference` - 对象差集
- `geometry_build` - 构建几何
- `geometry_get_boundaries` - 获取边界编号

### 物理工具(16)
- `physics_list` - 列出物理接口
- `physics_add_electrostatics` - 添加静电学
- `physics_add_solid_mechanics` - 添加固体力学
- `physics_add_heat_transfer` - 添加热传导
- `physics_add_laminar_flow` - 添加层流
- `physics_configure_boundary` - 配置边界条件
- `physics_set_material` - 分配材料

### 网格工具(3)
- `mesh_list` - 列出网格序列
- `mesh_create` - 生成网格
- `mesh_info` - 获取网格统计

### 研究与求解工具(8)
- `study_list` - 列出研究
- `study_solve` - 同步求解
- `study_solve_async` - 后台求解
- `study_get_progress` - 获取进度
- `study_cancel` - 取消求解

### 结果工具(9)
- `results_evaluate` - 评估表达式
- `results_global_evaluate` - 评估标量
- `results_export_data` - 导出数据
- `results_export_image` - 导出图表图像
- `results_plots_list` - 列出图表节点

### 知识工具(8)
- `docs_get` - 获取文档
- `docs_list` - 列出可用文档
- `physics_get_guide` - 物理快速指南
- `troubleshoot` - 故障排除帮助
- `modeling_best_practices` - 最佳实践
- `pdf_search` - 搜索PDF文档
- `pdf_search_status` - PDF搜索状态
- `pdf_list_modules` - 列出PDF模块

## 故障排除

### 1. Java运行时错误
```
确保已安装Java Runtime Environment (JRE)
```

### 2. COMSOL连接失败
```
检查COMSOL是否正确安装并可以启动
验证许可证服务器连接
```

### 3. Python包依赖问题
```
python311.exe -m pip install --upgrade pip
python311.exe -m pip install -e .
```

## 性能优化

1. **模型版本管理**：使用`model_save_version`保存不同版本
2. **异步求解**：使用`study_solve_async`进行长时间仿真
3. **知识库缓存**：提前构建PDF向量数据库

## 安全注意事项

- COMSOL MCP可以访问本地文件系统
- 在生产环境中使用时，请配置适当的安全策略
- 限制工作目录范围以防止意外文件访问

---

**备注**：此配置允许QwenPaw智能体通过MCP协议控制COMSOL进行多物理场仿真，大大扩展了AI的工程和科学研究能力。