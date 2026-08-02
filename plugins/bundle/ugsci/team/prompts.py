# -*- coding: utf-8 -*-
"""Phase-specific continuation prompts for the UGSci expert-team workflow.

Each phase produces a controller prompt that:
1. Tells the coordinator what phase it's in and what to do.
2. Embeds role identities and stable instance bindings in call templates
   so spawned sub-agents know their boundaries.
3. References structured handoff files in the loop_dir.
4. Includes anti-pattern warnings.

Phases: plan → dispatch → verify → synthesize → completed
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from .constants import (
    PHASE_COMPLETED,
    PHASE_DISPATCH,
    PHASE_PLAN,
    PHASE_SYNTHESIZE,
    PHASE_VERIFY,
)
from .roles import (
    fork_merge_instructions,
    format_spawn_call,
    get_display_name,
    resolve_role,
)


@dataclass(frozen=True)
class TeamPromptCtx:
    """Typed context for UGSci team phase prompt builders."""

    loop_dir: Path
    iteration: int
    max_iterations: int
    team_mode: str = "pipeline"
    team_name: str = ""
    members: list[dict[str, Any]] = field(default_factory=list)
    task: str = ""
    verify_retries: int = 0
    max_verify_retries: int = 3
    dispatch_retries: int = 0


def build_continuation(
    phase: str,
    iteration: int,
    max_iterations: int,
    loop_dir: Path,
    team_mode: str,
    team_name: str,
    members: list[dict[str, Any]],
    task: str,
    verify_retries: int = 0,
    max_verify_retries: int = 3,
    dispatch_retries: int = 0,
) -> str:
    """Return the controller prompt for the current team phase."""
    ctx = TeamPromptCtx(
        loop_dir=loop_dir,
        iteration=iteration,
        max_iterations=max_iterations,
        team_mode=team_mode,
        team_name=team_name,
        members=members,
        task=task,
        verify_retries=verify_retries,
        max_verify_retries=max_verify_retries,
        dispatch_retries=dispatch_retries,
    )
    builders = {
        PHASE_PLAN: _plan,
        PHASE_DISPATCH: _dispatch,
        PHASE_VERIFY: _verify,
        PHASE_SYNTHESIZE: _synthesize,
        PHASE_COMPLETED: _completed,
    }
    fn = builders.get(phase)
    if fn is None:
        return f"未知阶段: {phase}。请更新 state.json 设置有效的 current_phase。"
    return fn(ctx)


# ── Member formatting helpers ────────────────────────────────────────


def _member_role_key(member: dict[str, Any]) -> str:
    """Resolve a member role from stable metadata before display names."""
    explicit = member.get("role_key") or member.get("roleKey")
    if explicit:
        return resolve_role(str(explicit))
    role = member.get("role")
    if role:
        resolved = resolve_role(str(role))
        if resolved != "executor":
            return resolved
    return resolve_role(
        str(member.get("name", member.get("display_name", ""))),
    )


def _member_list(members: list[dict[str, Any]]) -> str:
    """Format team members as a readable list."""
    lines = []
    for m in members:
        name = m.get("name", m.get("display_name", "?"))
        role = m.get("role", "")
        emoji = m.get("emoji", "")
        role_key = _member_role_key(m)
        display = get_display_name(role_key)
        binding = m.get("binding_mode", m.get("bindingMode", "preferred"))
        lines.append(f"- {emoji} {name}（{display}）— {role} [{binding}]")
    return "\n".join(lines)


def _member_roles(members: list[dict[str, Any]]) -> list[str]:
    """Extract resolved role keys from member list."""
    return [_member_role_key(member) for member in members]


def _member_dispatch_call(
    member: dict[str, Any],
    task_body: str,
    *,
    fork: bool = False,
    parallel: bool = False,
) -> str:
    """Build an executable call template honoring the member binding.

    Fixed/preferred bindings target an existing configured Agent by stable ID;
    temporary members use an isolated OMP subagent. Preferred bindings include
    an explicit OMP fallback, while fixed bindings fail closed when incomplete.
    """
    role_key = _member_role_key(member)
    binding = str(
        member.get("binding_mode", member.get("bindingMode", "preferred")),
    )
    agent_id = str(
        member.get("agent_id", member.get("agentId", "")) or "",
    ).strip()
    if binding == "temporary":
        return format_spawn_call(role_key, task_body, fork=fork)

    if not agent_id:
        if binding == "fixed":
            return "配置错误：固定实例缺少 agent_id；不得静默派生，请停止并报告。"
        return (
            "首选实例未配置，按角色临时派生：\n"
            + format_spawn_call(role_key, task_body, fork=fork)
        )

    display = get_display_name(role_key)
    text = (
        f"<期望角色: {display} (role={role_key})>\n\n"
        f"## 任务\n{task_body}"
    )
    if parallel:
        call = (
            "submit_to_agent("
            f"to_agent={json.dumps(agent_id, ensure_ascii=False)}, "
            f"text={json.dumps(text, ensure_ascii=False)})"
        )
    else:
        call = (
            "chat_with_agent("
            f"to_agent={json.dumps(agent_id, ensure_ascii=False)}, "
            f"text={json.dumps(text, ensure_ascii=False)}, timeout=600)"
        )
    if binding == "preferred":
        fallback = format_spawn_call(role_key, task_body, fork=fork)
        return (
            f"优先调用稳定实例：\n   {call}\n"
            "若返回 Agent not exists 或实例不可用，才允许降级为 OMP 临时派生：\n"
            f"{fallback}\n"
            "调用完成后，控制器必须核验返回内容并写入任务指定的产物文件。"
        )
    return (
        f"固定实例（禁止自动替换）：\n   {call}\n"
        "调用完成后，控制器必须核验返回内容并写入任务指定的产物文件。"
    )


# ── Phase: plan ──────────────────────────────────────────────────────


def _plan(ctx: TeamPromptCtx) -> str:
    member_str = _member_list(ctx.members)
    roles = _member_roles(ctx.members)

    # If we have a planner-like member, use it; otherwise controller plans.
    has_planner = any(r in ("planner", "analyst") for r in roles)

    if has_planner:
        planner_member = next(
            member
            for member in ctx.members
            if _member_role_key(member) in ("planner", "analyst")
        )
        planner_spawn = _member_dispatch_call(
            planner_member,
            f"分析以下任务并创建任务分解计划：\n{ctx.task}\n\n"
            f"团队成员：\n{member_str}\n\n"
            f"请为每个成员分配具体子任务，明确依赖关系和数据交接要求。",
        )
        return f"""\
UGSci 专家团控制器 — 阶段: plan（规划）
团队: {ctx.team_name}
模式: {ctx.team_mode}
迭代: {ctx.iteration}/{ctx.max_iterations}

请使用 ugsci-roles 技能获取角色工具/技能配置。

执行步骤：
1. 分析任务需求，确定需要哪些专业能力。
2. 分派规划者子 agent 创建任务分解：
{planner_spawn}
3. 将计划写入 {ctx.loop_dir}/handoffs/plan.json，格式：
   {{
     "team_name": "{ctx.team_name}",
     "team_mode": "{ctx.team_mode}",
     "task": "<原始任务>",
     "steps": [
       {{
         "step": 1,
         "member": "<专家名称>",
         "role": "<角色 key>",
         "subtask": "<具体子任务描述>",
         "depends_on": [],
         "output_file": "results/step-1.json"
       }}
     ]
   }}
4. 更新 {ctx.loop_dir}/state.json: 设置 current_phase="dispatch"。

团队成员：
{member_str}"""

    # No dedicated planner — controller does the planning
    return f"""\
UGSci 专家团控制器 — 阶段: plan（规划）
团队: {ctx.team_name}
模式: {ctx.team_mode}
迭代: {ctx.iteration}/{ctx.max_iterations}

请使用 ugsci-roles 技能获取角色工具/技能配置。

执行步骤：
1. 分析以下任务需求：
   {ctx.task}

2. 根据团队成员的专业能力，为每个成员分配具体子任务。
   明确：
   - 每个子任务的具体要求
   - 子任务之间的依赖关系
   - 数据交接方式（通过 handoffs/ 文件传递）
   - 每个子任务的输出文件路径

3. 将任务分解计划写入 {ctx.loop_dir}/handoffs/plan.json：
   {{
     "team_name": "{ctx.team_name}",
     "team_mode": "{ctx.team_mode}",
     "task": "<原始任务>",
     "steps": [
       {{
         "step": 1,
         "member": "<专家名称>",
         "role": "<角色 key>",
         "subtask": "<具体子任务>",
         "depends_on": [],
         "output_file": "results/step-1.json"
       }},
       ...
     ]
   }}

4. 更新 {ctx.loop_dir}/state.json: 设置 current_phase="dispatch"。

团队成员：
{member_str}

警告 — 规划阶段常见问题：
- 不要跳过规划直接分派，每个子任务必须有明确要求和输出文件
- pipeline 模式：子任务按顺序执行，后一个依赖前一个的输出
- roundtable 模式：子任务并行执行，互不依赖
- coordinator 模式：协调者按需调用各专家，灵活编排"""


# ── Phase: dispatch ──────────────────────────────────────────────────


def _dispatch(ctx: TeamPromptCtx) -> str:
    mode = ctx.team_mode
    member_str = _member_list(ctx.members)

    if mode == "roundtable":
        return _dispatch_roundtable(ctx, member_str)
    if mode == "coordinator":
        return _dispatch_coordinator(ctx, member_str)
    if mode == "router":
        return _dispatch_router(ctx, member_str)
    if mode == "review_loop":
        return _dispatch_review_loop(ctx, member_str)
    if mode == "debate":
        return _dispatch_debate(ctx, member_str)
    return _dispatch_pipeline(ctx, member_str)


def _finish_dispatch(ctx: TeamPromptCtx) -> str:
    """Shared fork integration and phase transition contract."""
    return f"""\
完成本轮编排后：
1. 集成 fork worker 结果（如有）：
{fork_merge_instructions("   ")}
2. 将选择理由、依赖关系、每个产物路径写入
   {ctx.loop_dir}/handoffs/dispatch-summary.json。
3. 更新 {ctx.loop_dir}/state.json：设置 forks_integrated=true，
   current_phase="verify"。在 forks_integrated=true 前不得进入验证阶段。"""


def _dispatch_router(ctx: TeamPromptCtx, member_str: str) -> str:
    """Route a task to the smallest capable expert subset at runtime."""
    candidates = []
    for i, member in enumerate(ctx.members, start=1):
        name = member.get("name", member.get("display_name", f"专家{i}"))
        candidates.append(
            f"- {name}: {_member_dispatch_call(member, f'执行路由器分配给你的子任务；将结果写入 {ctx.loop_dir}/results/route-{i}.json。', fork=True, parallel=True)}",
        )
    return f"""\
UGSci 协作工作流控制器 — dispatch / 智能路由
工作流: {ctx.team_name}　迭代: {ctx.iteration}/{ctx.max_iterations}

任务：{ctx.task}

候选专家：
{member_str}

执行协议：
1. 读取 {ctx.loop_dir}/handoffs/plan.json，依据任务所需能力选择最小充分专家集合；
   不要为了形式调用所有成员。
2. 把路由决策写入 {ctx.loop_dir}/handoffs/routing.json，包含 selected、skipped、reason。
3. 无依赖的子任务必须用 batch + fork=True 并行；有依赖的任务按拓扑顺序派发。
4. 可用调用模板：
{chr(10).join(candidates)}

{_finish_dispatch(ctx)}"""


def _dispatch_review_loop(ctx: TeamPromptCtx, member_str: str) -> str:
    """Execute an author-review-revision loop, backed by gate retries."""
    executor = ctx.members[0] if ctx.members else {}
    reviewer = ctx.members[-1] if len(ctx.members) > 1 else executor
    executor_name = executor.get("name", "执行者")
    reviewer_name = reviewer.get("name", "评审者")
    executor_call = _member_dispatch_call(
        executor,
        f"完成或修订任务产物，读取已有评审意见（如有），输出到 {ctx.loop_dir}/results/draft.json。",
    )
    reviewer_call = _member_dispatch_call(
        reviewer,
        f"按计划中的成功标准独立审查 draft.json，输出结构化结论到 {ctx.loop_dir}/results/review.json，包含 verdict、issues、required_changes。",
        fork=True,
    )
    return f"""\
UGSci 协作工作流控制器 — dispatch / 评审迭代
工作流: {ctx.team_name}　工作流重试: {ctx.dispatch_retries}

本轮严格执行“产出 → 独立评审 → 必要时修订”：
1. {executor_name} 产出：
{executor_call}
2. {reviewer_name} 在独立上下文中评审：
{reviewer_call}
3. 必须等待 {executor_name} 完成并确认 draft.json 已落盘，才能启动 {reviewer_name}；后台任务用 check_agent_task 轮询。
4. 若 verdict=revise，立即把 required_changes 交回 {executor_name} 修订一次；保留前后版本。
5. 不得由执行者自我宣布通过。验证阶段仍未通过时，OMP gate 会带着反馈重新进入本阶段。

团队成员：
{member_str}

{_finish_dispatch(ctx)}"""


def _dispatch_debate(ctx: TeamPromptCtx, member_str: str) -> str:
    """Collect independent positions, rebuttals, then an adjudication."""
    position_calls = []
    for i, member in enumerate(ctx.members[:-1] or ctx.members, start=1):
        position_calls.append(_member_dispatch_call(
            member,
            f"独立提出可证伪的专业判断、证据和风险，写入 {ctx.loop_dir}/results/position-{i}.json。",
            fork=True,
            parallel=True,
        ))
    judge = ctx.members[-1] if ctx.members else {}
    judge_name = judge.get("name", "裁决者")
    judge_call = _member_dispatch_call(
        judge,
        f"比较所有立场与反驳，按证据质量裁决；输出 {ctx.loop_dir}/results/verdict.json。",
    )
    return f"""\
UGSci 协作工作流控制器 — dispatch / 多方论证
工作流: {ctx.team_name}　迭代: {ctx.iteration}/{ctx.max_iterations}

1. 第一轮按各成员的绑定模板并行产生相互独立的立场：
{chr(10).join(position_calls)}
2. 汇总立场后，让各论证方只针对关键冲突进行一轮交叉质询，输出 rebuttal-N.json。
3. 最后由 {judge_name} 裁决，不按多数票，必须说明采信与驳回证据：
{judge_call}

团队成员：
{member_str}

{_finish_dispatch(ctx)}"""


def _dispatch_pipeline(ctx: TeamPromptCtx, member_str: str) -> str:
    """Pipeline mode: sequential expert dispatch with context passing."""
    # Build sequential spawn calls for each member
    spawn_calls = []
    for i, m in enumerate(ctx.members):
        name = m.get("name", m.get("display_name", f"专家{i+1}"))
        step_num = i + 1
        prev_file = (
            f"\n上下文：上一步结果文件: {ctx.loop_dir}/results/step-{step_num-1}.json"
            if i > 0 else ""
        )
        spawn = _member_dispatch_call(
            m,
            f"执行第 {step_num} 步子任务。\n"
            f"读取 {ctx.loop_dir}/handoffs/plan.json 中你的步骤，\n"
            f"读取上一步的输出文件作为上下文（如有），\n"
            f"将你的结果写入 {ctx.loop_dir}/results/step-{step_num}.json."
            f"{prev_file}",
        )
        spawn_calls.append(f"步骤 {step_num} — {name}:\n{spawn}")

    spawns = "\n\n".join(spawn_calls)

    return f"""\
UGSci 专家团控制器 — 阶段: dispatch（流水线分派）
团队: {ctx.team_name}
模式: pipeline（流水线）
迭代: {ctx.iteration}/{ctx.max_iterations}
分派重试: {ctx.dispatch_retries}

请使用 ugsci-roles 技能获取角色工具/技能配置。

执行步骤：
1. 读取 {ctx.loop_dir}/handoffs/plan.json 获取任务分解。

2. 按顺序依次分派专家子 agent（每步完成后再分派下一步）：

{spawns}

3. 每步严格使用上面的绑定模板；后台任务用 check_agent_task 轮询状态（间隔 ≥ 30s）。
4. 每步完成后，将结果写入 {ctx.loop_dir}/results/step-N.json。
5. 下一步分派时，将上一步的结果文件路径作为上下文传递。

6. 所有步骤完成后，集成 fork worker 结果（如有）：
{fork_merge_instructions("   ")}

7. 成功集成后，更新 {ctx.loop_dir}/state.json:
   设置 forks_integrated=true。
8. 更新 {ctx.loop_dir}/state.json: 设置 current_phase="verify"。
   Gate 在 forks_integrated=true 前拒绝推进到 verify 阶段。

团队成员：
{member_str}

警告 — 分派阶段常见问题：
- pipeline 模式必须按顺序执行，不能跳步
- 每步结果必须写入文件，不要只靠上下文窗口传递
- 如果某步失败，记录失败原因，重试或报告"""


def _dispatch_roundtable(ctx: TeamPromptCtx, member_str: str) -> str:
    """Roundtable mode: parallel independent expert dispatch."""
    # Build batch items for all members
    member_calls = []
    for i, m in enumerate(ctx.members):
        step_num = i + 1
        item = _member_dispatch_call(
            m,
            f"独立评估以下任务（不参考其他专家意见）：\n"
            f"{ctx.task}\n\n"
            f"将你的评估结果写入 {ctx.loop_dir}/results/step-{step_num}.json。",
            fork=True,
            parallel=True,
        )
        member_calls.append(item)

    items = "\n\n".join(member_calls)

    return f"""\
UGSci 专家团控制器 — 阶段: dispatch（并行分派）
团队: {ctx.team_name}
模式: roundtable（圆桌讨论）
迭代: {ctx.iteration}/{ctx.max_iterations}
分派重试: {ctx.dispatch_retries}

请使用 ugsci-roles 技能获取角色工具/技能配置。

执行步骤：
1. 读取 {ctx.loop_dir}/handoffs/plan.json 获取任务分解。

2. 按各成员的绑定模板提交所有专家任务（独立并行）：
{items}

3. 用 check_agent_task 轮询每个子任务状态（间隔 ≥ 30s）。
4. 所有专家完成后，集成 fork worker 结果：
{fork_merge_instructions("   ")}

5. 成功集成后，更新 {ctx.loop_dir}/state.json:
   设置 forks_integrated=true。
6. 更新 {ctx.loop_dir}/state.json: 设置 current_phase="verify"。
   Gate 在 forks_integrated=true 前拒绝推进到 verify 阶段。

团队成员：
{member_str}

警告 — 圆桌讨论关键约束：
- 所有专家必须独立评估，不要将一位专家的意见传递给另一位
- 使用 fork=True 确保每个专家在独立 worktree 中工作
- 必须等待所有专家完成后才能进入验证阶段"""


def _dispatch_coordinator(ctx: TeamPromptCtx, member_str: str) -> str:
    """Coordinator mode: coordinator-driven flexible expert consultation."""
    # First member is typically the coordinator
    coordinator = ctx.members[0] if ctx.members else {}
    coord_name = coordinator.get("name", "协调者")
    coord_role = _member_role_key(coordinator)

    # Build spawn calls for non-coordinator members
    other_spawns = []
    for i, m in enumerate(ctx.members[1:], start=2):
        name = m.get("name", m.get("display_name", f"专家{i}"))
        spawn = _member_dispatch_call(
            m,
            f"按协调者（{coord_name}）的请求执行专业任务。\n"
            f"将结果写入 {ctx.loop_dir}/results/step-{i-1}.json。",
        )
        other_spawns.append(f"专家 {name}:\n{spawn}")

    spawns = "\n\n".join(other_spawns) if other_spawns else "（无其他专家）"

    return f"""\
UGSci 专家团控制器 — 阶段: dispatch（协调者模式）
团队: {ctx.team_name}
模式: coordinator（协调者主导）
迭代: {ctx.iteration}/{ctx.max_iterations}
分派重试: {ctx.dispatch_retries}

你是团队协调者（{coord_name}）。请使用 ugsci-roles 技能获取角色工具/技能配置。

执行步骤：
1. 读取 {ctx.loop_dir}/handoffs/plan.json 获取任务分解。
2. 作为协调者（{coord_name}），按需调用以下专家：

{spawns}

3. 每次调用严格使用上面的绑定模板，后台任务用 check_agent_task 轮询状态（间隔 ≥ 30s）。
4. 根据专家返回的结果，决定是否需要调用其他专家或追加请求。
5. 将每次咨询结果写入 {ctx.loop_dir}/results/step-N.json。
6. 当你认为已获得足够信息时，集成 fork worker 结果（如有）：
{fork_merge_instructions("   ")}

7. 成功集成后，更新 {ctx.loop_dir}/state.json:
   设置 forks_integrated=true。
8. 更新 {ctx.loop_dir}/state.json: 设置 current_phase="verify"。

团队成员：
{member_str}

协调者：{coord_name}

约束：
- 最多循环咨询每个专家 3 次，超过则输出当前最佳方案
- 每次咨询后评估是否已获得足够信息，避免无效循环"""


# ── Phase: verify ─────────────────────────────────────────────────────


def _verify(ctx: TeamPromptCtx) -> str:
    reviewer_member = next(
        (
            member
            for member in ctx.members
            if _member_role_key(member) in ("domain-reviewer", "verifier")
        ),
        None,
    )
    reviewer_task = (
        f"交叉验证以下团队结果的完整性和一致性：\n"
        f"团队: {ctx.team_name}\n"
        f"读取 {ctx.loop_dir}/results/ 目录下所有结果文件。\n\n"
        f"检查：\n"
        f"- 数据合理性（数值范围、单位、逻辑一致性）\n"
        f"- 方法适用性（所用方法是否适合该问题）\n"
        f"- 结论可靠性（结论是否有数据支撑）\n"
        f"- 各专家结果之间的矛盾\n\n"
        f"将审核报告写入 {ctx.loop_dir}/reviews/verify-report.json。"
    )
    reviewer_spawn = (
        _member_dispatch_call(reviewer_member, reviewer_task, fork=True)
        if reviewer_member
        else format_spawn_call("domain-reviewer", reviewer_task, fork=True)
    )

    return f"""\
UGSci 专家团控制器 — 阶段: verify（验证审核）
团队: {ctx.team_name}
模式: {ctx.team_mode}
迭代: {ctx.iteration}/{ctx.max_iterations}
验证重试: {ctx.verify_retries}/{ctx.max_verify_retries}

请使用 ugsci-roles 技能获取角色工具/技能配置。

执行步骤：
1. 读取 {ctx.loop_dir}/results/ 目录下所有专家的结果文件。
2. 分派领域审核专家进行交叉验证：
{reviewer_spawn}

3. 审核专家完成后，读取 {ctx.loop_dir}/reviews/verify-report.json。
4. 如果审核结论为 PASS：
   更新 {ctx.loop_dir}/state.json: 设置 current_phase="synthesize"。
5. 如果审核结论为 FAIL 或 PARTIAL：
   a. 根据 verify-report.json 中的问题清单，
      将需要修正的步骤回退到 dispatch 阶段。
   b. 更新 {ctx.loop_dir}/state.json: 设置 current_phase="dispatch"。
   c. 在 dispatch 阶段中重新执行有问题的步骤。

团队成员：
{_member_list(ctx.members)}

警告 — 验证阶段常见问题：
- 不要自己验证，必须分派 domain-reviewer 子 agent
- 审核专家不应修改任何文件，只做评估
- 如果验证重试超过 {ctx.max_verify_retries} 次，gate 会自动终止"""


# ── Phase: synthesize ────────────────────────────────────────────────


def _synthesize(ctx: TeamPromptCtx) -> str:
    member_str = _member_list(ctx.members)
    result_files = "\n".join(
        f"   - {ctx.loop_dir}/results/step-{i+1}.json"
        for i in range(len(ctx.members))
    )

    return f"""\
UGSci 专家团控制器 — 阶段: synthesize（综合输出）
团队: {ctx.team_name}
模式: {ctx.team_mode}
迭代: {ctx.iteration}/{ctx.max_iterations}

执行步骤：
1. 读取所有专家结果文件：
{result_files}

2. 读取验证报告：{ctx.loop_dir}/reviews/verify-report.json

3. 综合所有专家结果，形成最终报告。报告应包含：
   - 任务概述
   - 各专家的分析结果（按团队成员顺序）
   - 交叉验证结论
   - 综合建议/方案
   - 不确定性和风险说明

4. 将最终报告写入 {ctx.loop_dir}/handoffs/final-report.md。

5. 更新 {ctx.loop_dir}/state.json: 设置 current_phase="completed"。
   只有在 final-report.md 写入完成后才能设置 completed。

团队成员：
{member_str}

警告 — 综合阶段常见问题：
- 不要简单地拼接各专家的输出，需要真正的综合分析
- 如实反映各专家之间的分歧（如有）
- 在报告中标注数据来源和置信度"""


# ── Phase: completed ──────────────────────────────────────────────────


def _completed(ctx: TeamPromptCtx) -> str:
    return (
        f"UGSci 专家团「{ctx.team_name}」工作流已完成。\n"
        f"最终报告: {ctx.loop_dir}/handoffs/final-report.md\n"
        f"进度日志: {ctx.loop_dir}/progress.txt"
    )
