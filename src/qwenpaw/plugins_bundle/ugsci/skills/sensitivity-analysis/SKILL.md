---
name: sensitivity-analysis
description: "油藏模拟参数敏感性分析：系统评估各参数对模拟结果的影响程度，为历史拟合和方案优化提供指导。"
metadata:
  qwenpaw:
    emoji: "📊"
    requires:
      tools: [launch_simulation, check_simulation_status, read_simulation_results, analyze_simulation]
---

# 参数敏感性分析

## 适用场景
- 历史拟合前确定优先调整的参数
- 不确定性分析
- 方案优化中识别关键影响因素

## 分析方法

### 单参数敏感性分析

对每个参数设定变化范围，每次只改一个：

#### 1. 渗透率 (PERMX)
```
# 基准: PERMX 原始值
# 变化: -50%, -20%, +20%, +50%
edit_simulation_deck(deck_file="model.DATA", keyword="PERMX", action="replace", content="...")
launch_simulation(simulator="eclipse", deck_file="model.DATA")
# 记录 FOPR, FPR, FWCT 变化
```

#### 2. 孔隙度 (PORO)
- 变化范围: ±10%, ±20%

#### 3. 相对渗透率
- 调整 SWOF/SGOF 端点：
  - Swirr (束缚水饱和度): ±0.05
  - Sor (残余油饱和度): ±0.05
  - Krw 端点: ±30%
  - Kro 端点: ±30%

#### 4. 油水界面 (OWC)
- 变化范围: ±2m, ±5m

#### 5. 水体大小
- 变化范围: ±20%, ±50%

### 评估指标

对每个参数变化，计算以下响应：
- FOPR (油田产油量) 变化率
- FPR (地层压力) 变化量
- FWCT (含水率) 变化
- 突破时间变化

### 结果排序

按影响程度排序，分为：
- **高敏感参数**: 响应变化 > 10%
- **中敏感参数**: 响应变化 3%-10%
- **低敏感参数**: 响应变化 < 3%

### 使用分析工具
```
# 每次修改后运行比较
analyze_simulation(
    job_id="新方案_job_id",
    analysis_type="comparison",
    reference_job_id="基准_job_id"
)
```

## 快速评估矩阵

| 参数 | 产油量影响 | 压力影响 | 含水率影响 | 突破时间影响 |
|------|-----------|---------|-----------|------------|
| 渗透率 | 高 | 高 | 中 | 高 |
| 孔隙度 | 高 | 中 | 低 | 中 |
| 相渗端点 | 中 | 低 | 高 | 高 |
| OWC 深度 | 低 | 中 | 高 | 高 |
| 水体大小 | 低 | 高 | 中 | 低 |
| 岩石压缩 | 低 | 中 | 低 | 低 |

## 注意事项
- 先做单参数分析，再做双参数交叉分析
- 记录每次运行的完整配置以便复现
- 敏感性可能随时间/区域变化，需在不同时段评估
