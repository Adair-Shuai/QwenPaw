const React = window.QwenPaw.host.React;

export default function WorkflowTabs({ id, label, items, value, onChange }) {
  return (
    <div className="df-workflow-tabs" role="tablist" aria-label={label}>
      {items.map((item, index) => (
        <button
          type="button"
          role="tab"
          key={item.id}
          className={item.align === "end" ? "df-workflow-tab-end" : undefined}
          id={`${id}-tab-${item.id}`}
          aria-controls={`${id}-panel-${item.id}`}
          aria-selected={value === item.id}
          tabIndex={value === item.id ? 0 : -1}
          onClick={() => onChange(item.id)}
          onKeyDown={(event) => {
            let next;
            if (event.key === "ArrowRight") next = (index + 1) % items.length;
            if (event.key === "ArrowLeft")
              next = (index + items.length - 1) % items.length;
            if (event.key === "Home") next = 0;
            if (event.key === "End") next = items.length - 1;
            if (next === undefined) return;
            event.preventDefault();
            onChange(items[next].id);
            event.currentTarget.parentElement.children[next].focus();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export const negotiationTabs = [
  "项目研究内容",
  "考核指标与进度安排",
  "受邀单位与资格要求",
  "谈判要求",
  "实施方案",
];

export function fieldTab(field, stage) {
  if (stage === "negotiation") {
    const prefix = field.key.split(".")[0];
    if (["project", "research"].includes(prefix)) return negotiationTabs[0];
    if (["deliverables", "metrics", "workload", "milestones"].includes(prefix))
      return negotiationTabs[1];
    if (prefix === "qualification") return negotiationTabs[2];
    if (prefix === "implementation") return negotiationTabs[4];
    if (
      [
        "organization",
        "org",
        "contact",
        "purchaser",
        "dates",
        "events",
        "submission",
        "place",
        "budget",
      ].includes(prefix)
    )
      return negotiationTabs[3];
    const mapped = {
      项目资料: 0,
      研究内容: 0,
      成果与考核: 1,
      进度安排: 1,
      资格要求: 2,
      单位与联系: 3,
      费用信息: 3,
      日期安排: 3,
      地点安排: 3,
      服务选商实施方案: 4,
    }[field.group];
    if (mapped !== undefined) return negotiationTabs[mapped];
  }
  if (/^selection\.member\d+_/.test(field.key)) return "论证成员";
  if (/^selection\.partner\d+_/.test(field.key)) return "候选单位";
  return (
    {
      单位与联系: "联系与费用",
      费用信息: "联系与费用",
      日期安排: "时间与地点",
      地点安排: "时间与地点",
      服务选商实施方案: "实施方案",
    }[field.group] ||
    field.group ||
    "填写信息"
  );
}
