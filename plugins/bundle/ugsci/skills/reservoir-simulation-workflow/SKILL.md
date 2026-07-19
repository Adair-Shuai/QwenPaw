---
name: reservoir-simulation-workflow
description: "油藏数值模拟标准工作流：从模型准备到结果分析的完整流程指南。涵盖 Eclipse/CMG/COMSOL 模拟器的启动、监控、结果读取和后处理。"
metadata:
  qwenpaw:
    emoji: "🛢️"
    requires:
      tools: [launch_simulation, check_simulation_status, read_simulation_results, edit_simulation_deck, analyze_simulation]
---

# 油藏数值模拟标准工作流

## 适用场景
当用户需要运行油藏数值模拟、CMG 模拟、COMSOL 仿真时使用本技能。

## 前提条件
1. 在能力中心 → 计算引擎中配置好模拟器的可执行路径
2. 准备好模拟输入文件（.DATA / .dat / .mph）
3. 启用本技能关联的模拟器控制工具

## 标准流程

### 第一步：启动模拟
```
launch_simulation(
    simulator="eclipse",     # 或 cmg_imex / cmg_stars / cmg_gem / comsol
    deck_file="model.DATA",  # 输入文件路径
    working_dir="/path/to/case",  # 工作目录
    timeout=86400            # 最大运行时间（秒）
)
```
返回 job_id，用于后续所有操作。

### 第二步：监控运行
```
check_simulation_status(job_id="sim_xxx", detail_level="convergence")
```
- 定期检查（建议每 5-10 分钟）
- 关注：收敛性指标、物质平衡误差、CFL 数
- 如果牛顿迭代 > 12 或 CFL > 1.0，考虑停止并调整参数

### 第三步：读取结果
```
read_simulation_results(
    job_id="sim_xxx",
    data_type="summary",
    variables=["FOPR", "FPR", "FWCT", "FOPT"]
)
```
支持的数据类型：
- summary: 油田级汇总曲线
- well: 单井生产曲线
- report: 日志文本报告
- all: 全部数据

### 第四步：分析结果
```
analyze_simulation(
    job_id="sim_xxx",
    analysis_type="convergence"  # 或 balance / performance / comparison
)
```

### 第五步：修改参数（如需重新运行）
```
edit_simulation_deck(
    deck_file="model.DATA",
    keyword="WCONPROD",
    action="replace",
    content="WCONPROD\n  PROD1 OPEN BHP 5* 200 1* 5000 /\n/"
)
```

## 关键注意事项
- 每次修改参数后重新运行前，确认输入文件格式正确
- 长时间运行的模拟可以设置较短的监控间隔
- 如果模拟失败，先用 check_simulation_status(detail_level="full") 查看错误日志
