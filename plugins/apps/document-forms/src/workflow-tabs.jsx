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

export function fieldTab(field) {
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
