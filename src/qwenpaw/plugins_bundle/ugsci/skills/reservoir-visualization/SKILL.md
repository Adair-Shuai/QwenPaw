---
name: reservoir-visualization
description: 使用三维可视化查看器分析储层网格、属性和井轨迹。支持 EGRID/ROFF 格式输入。
---

# 储层三维可视化

## 适用场景

当用户需要以下操作时使用本技能：
- 可视化查看油气藏三维网格（EGRID/ROFF/CMG DAT）
- 叠加井轨迹、井剖面、交切剖面和地面管网
- 按属性着色（孔隙度/渗透率/压力/饱和度）
- 播放 CMG SR3 / Eclipse UNRST 时间步
- I/J/K 切片、深度裁剪、属性直方图与统计
- 拾取网格单元并查看坐标

## 前提条件

1. 确认 UGSci 插件已启用；可视化能力已内置，无需安装第二个插件
2. 准备好网格文件（.EGRID / .roff / CMG .dat）
3. （可选）准备好属性文件（.INIT / .UNRST / CMG .sr3）
4. （可选）井轨迹 JSON、LAS/DLIS 测井、管网 CSV/JSON

## 标准流程

### 第一步：导入数据集

使用 API 导入网格文件：

```
POST /ugsci/visualization/imports/workspace
  path: model.dat
  name: my_reservoir
```

同目录下的 `.sr3` 会自动作为 CMG 动态结果一并导入。

### 第二步：打开可视化页面

导航到 `/oilgas-visualization` 路由，查看器会自动加载已导入的数据集。
切换「储层 3D / 井筒 / 剖面 / 测井 / 管网」标签进行专业预览。

### 第三步：后处理显示

- 属性着色与色图
- 时间步播放（SR3 / UNRST）
- IJK 过滤或「提取切片」
- 「沿井生成剖面」得到井走廊着色剖面
- 属性统计、直方图、CSV 导出

## 支持的文件格式

| 格式 | 扩展名 | 说明 |
|------|--------|------|
| ROFF | .roff | Equinor/Roxar 二进制网格格式 |
| Eclipse EGRID | .EGRID | Eclipse 二进制角点网格 |
| Eclipse INIT | .INIT | 静态属性文件 |
| Eclipse UNRST | .UNRST | 动态属性（时间步） |
| GRDECL | .grdecl | Eclipse ASCII 关键字格式 |
| CMG DAT | .dat | IMEX/GEM/STARS 角点或笛卡尔网格、井、静态属性 |
| CMG SR3 | .sr3 | HDF5 动态网格结果（PRES/SOIL/SWAT/SGAS） |
| LAS | .las | 测井曲线 ASCII 格式 |
| JSON | .json | 井轨迹 / 层面 / 管网 |
| CSV | .csv | 地面管网段 |

## 技术架构

- **前端引擎**: Three.js + WebGL
- **后端解析**: 内置纯 Python 解析器（CMG DAT、GRDECL、LAS 2.0、CSV/JSON 井网）；可选依赖扩展格式（xtgeo → EGRID/INIT/UNRST/ROFF，h5py → CMG SR3，lasio/dlisio → LAS 3.0/DLIS）
- **数据传输**: 二进制 TypedArray（非 JSON）
- **按需加载**: 启动时不加载 Three.js，进入页面后才加载

## 注意事项

- 大网格（>500k cells）首次加载可能需要数秒
- 关闭页面后 WebGL 资源会自动释放
- 不修改原始网格文件，所有转换产物缓存在 data/bin/ 目录
