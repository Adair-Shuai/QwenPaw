---
name: convergence-diagnosis
description: "数值模拟收敛问题诊断：分析牛顿迭代次数异常、时间步切割、CFL违例、物质平衡误差等问题，给出修正建议。"
metadata:
  qwenpaw:
    emoji: "🔍"
    requires:
      tools: [check_simulation_status, read_simulation_results, analyze_simulation]
---

# 收敛问题诊断

## 适用场景
当模拟运行中出现收敛困难、时间步频繁切割、模拟中途失败时使用本技能。

## 诊断步骤

### 第一步：获取详细状态
```
check_simulation_status(job_id="sim_xxx", detail_level="full")
```
关注以下指标：
- 牛顿迭代次数（正常 3-5，>8 需关注，>12 需干预）
- 物质平衡误差（正常 <1e-6，>1e-3 需检查）
- CFL 数（应 <1.0）
- 警告和错误信息

### 第二步：原因分析

#### 牛顿迭代过多
可能原因：
| 原因 | 检查方法 | 解决方案 |
|------|---------|---------|
| 时间步过大 | 检查 TSTEP 关键字 | 减小时间步 |
| 非线性强 | 检查相渗曲线斜率 | 平滑相渗曲线端点 |
| 初始条件不一致 | 检查 EQUIL 初始化 | 重新平衡 |
| 网格质量差 | 检查网格变形 | 重新网格化 |

#### 时间步频繁切割
- 检查 TSTEP / TUNING 关键字中的最大时间步限制
- 降低 MAXDP, MAXDR, MAXDS 等限制参数
- 增加最小时间步限制避免无限切割

#### CFL 违例
- 减小时间步
- 检查高速注入/生产井
- 检查网格尺寸与流速的关系

#### 物质平衡误差大
- 检查 PVT 表一致性
- 检查初始化（EQUIL / RSVD / RVVD）
- 检查岩石压缩系数
- 检查水体模型

### 第三步：修复操作
```
# 减小时间步
edit_simulation_deck(
    deck_file="model.DATA",
    keyword="TSTEP",
    action="replace",
    content="TSTEP\n  10*30 20*15 50*30 /\n"
)

# 调整 TUNING 参数
edit_simulation_deck(
    deck_file="model.DATA",
    keyword="TUNING",
    action="replace",
    content="TUNING\n  0.1 1e-5 0.1 / 3* / 1 5 30 /"
)
```

### 第四步：验证修复
重新运行并用 `analyze_simulation(analysis_type="convergence")` 确认改善。

## 常见问题快速参考

| 症状 | 最可能原因 | 首要操作 |
|------|-----------|---------|
| 模拟在第 1 步失败 | 初始化错误 | 检查 EQUIL / PRESSURE |
| 模拟在中途卡住 | 时间步问题 | 减小 TSTEP |
| 牛顿迭代逐渐增大 | 非线性增强 | 平滑相渗曲线 |
| 模拟完成但结果异常 | PVT 不一致 | 检查 PVT 表 |
| 水突破时收敛失败 | 相渗曲线不连续 | 平滑 SWOF 端点 |
