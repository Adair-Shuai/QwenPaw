---
name: reservoir-visualization
description: 使用三维可视化查看器分析储层网格、属性和井轨迹。支持 EGRID/ROFF 格式输入。
---

# 储层三维可视化

## 适用场景

当用户需要以下操作时使用本技能：
- 可视化查看油气藏三维网格（EGRID/ROFF）
- 按属性着色（孔隙度/渗透率/岩相）
- 拾取网格单元并查看坐标
- 运行渲染性能基准测试

## 前提条件

1. 在 QwenPaw 中安装 `oilgas-visualization` 插件
2. 准备好网格文件（.EGRID / .roff）
3. （可选）准备好属性文件（.INIT / .roff 属性）

## 标准流程

### 第一步：导入数据集

使用 API 导入网格文件：

```
POST /oilgas-vis/import
  file: model.EGRID
  name: my_reservoir
```

### 第二步：打开可视化页面

导航到 `/oilgas-visualization` 路由，查看器会自动加载已导入的数据集。

### 第三步：切换属性

在侧边栏选择属性：
- 孔隙度 (Porosity)
- 渗透率 (Permeability)
- 岩相 (Facies)

### 第四步：性能基准

点击 "Run Benchmark" 按钮，测量：
- P50/P95 帧时间
- FPS
- Draw calls / 三角形数
- JS Heap 使用量

## 支持的文件格式

| 格式 | 扩展名 | 说明 |
|------|--------|------|
| ROFF | .roff | Equinor/Roxar 二进制网格格式 |
| Eclipse EGRID | .EGRID | Eclipse 二进制角点网格 |
| Eclipse INIT | .INIT | 静态属性文件 |
| Eclipse UNRST | .UNRST | 动态属性（时间步） |
| GRDECL | .grdecl | Eclipse ASCII 关键字格式 |
| LAS | .las | 测井曲线 ASCII 格式 |

## 技术架构

- **前端引擎**: Three.js + WebGL
- **后端解析**: xtgeo + resfo + roffio
- **数据传输**: 二进制 TypedArray（非 JSON）
- **按需加载**: 启动时不加载 Three.js，进入页面后才加载

## 注意事项

- 大网格（>500k cells）首次加载可能需要数秒
- 关闭页面后 WebGL 资源会自动释放
- 不修改原始网格文件，所有转换产物缓存在 data/bin/ 目录
