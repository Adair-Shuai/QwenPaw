---
name: history-matching
description: "油藏数值模拟历史拟合工作流：系统性调整模型参数使模拟结果与历史生产数据匹配。包含参数敏感性分析、迭代修正策略和拟合度评估标准。"
metadata:
  qwenpaw:
    emoji: "🎯"
    requires:
      tools: [launch_simulation, check_simulation_status, read_simulation_results, edit_simulation_deck, analyze_simulation]
---

# 历史拟合工作流

## 适用场景
当用户要求进行历史拟合、模型校准、参数反演时使用本技能。

## 目标
调整模型参数使模拟结果与历史生产数据匹配：
- 产油量 (FOPR/WOPR) 相对误差 < 5%
- 地层压力 (FPR/BPR) 绝对误差 < 0.5 MPa
- 含水率转折点时间误差 < 3 个月

## 工作流程

### 第一阶段：基准运行
1. 用 `launch_simulation` 启动初始模型
2. 用 `check_simulation_status` 监控直到 `status="completed"`
3. 用 `read_simulation_results(data_type="summary")` 读取汇总数据
4. 计算与历史数据的误差：
   - 产油量相对误差 = |模拟值 - 历史值| / 历史值 × 100%
   - 压力绝对误差 = |模拟值 - 历史值|
   - 含水率误差 = |模拟含水率 - 历史含水率|

### 第二阶段：参数敏感性分析
系统修改单个参数，评估对结果的影响：
1. 渗透率 (PERMX/PERMY/PERMZ): ±20%, ±50%
2. 孔隙度 (PORO): ±10%
3. 相对渗透率端点
4. 油水界面深度
5. 水体大小

每次只改一个参数：
```
edit_simulation_deck(deck_file="model.DATA", keyword="PERMX", action="replace", content="...")
launch_simulation(simulator="eclipse", deck_file="model.DATA")
analyze_simulation(job_id=..., analysis_type="comparison", reference_job_id=基准job_id)
```

### 第三阶段：迭代修正
1. 优先调整敏感度最高的参数
2. 每轮迭代后重新评估拟合度
3. 若 3 轮无改善，切换到下一组参数

### 判断规则
| 现象 | 可能原因 | 调整方向 |
|------|---------|---------|
| 产油量系统性偏高 | 渗透率过大 / 孔隙度过大 | 降低 PERMX 或 PORO |
| 产油量系统性偏低 | 渗透率过小 / 表皮效应大 | 增大 PERMX 或减小 SKIN |
| 压力下降过快 | 水体不足 / 渗透率低 | 增大水体或提高 PERMX |
| 压力保持过高 | 水体过大 / 渗透率高 | 减小水体或降低 PERMX |
| 见水过早 | 相渗曲线偏左 / 油水界面高 | 调整 SWOF / 降低 OWC |
| 见水过晚 | 相渗曲线偏右 / 油水界面低 | 调整 SWOF / 升高 OWC |

### 第四阶段：验证
1. 最终运行确认所有指标达标
2. 用 `analyze_simulation(analysis_type="performance")` 生成性能报告
3. 用 `read_simulation_results(data_type="all")` 导出完整结果

## 注意事项
- 每次修改前备份原始输入文件
- 一次只改一个参数以确定因果关系
- 记录每轮的参数变化和拟合度变化
- 当改善幅度很小时，考虑多参数联合调整
