const React = window.QwenPaw.host.React;
const { useId } = React;

export const timelineInputId = (key) => "df-timeline-" + key;

function TimelineStep({ title, state, children }) {
  return (
    <li className="df-timeline-step" data-state={state}>
      <h3>{title}</h3>
      {children}
    </li>
  );
}

function Approval({ stage, title, onOpen }) {
  const date = stage?.approval_date;
  return (
    <TimelineStep title={title} state={date ? "set" : "pending"}>
      <div className="df-timeline-approval">
        {date ? (
          <time dateTime={date}>{date}</time>
        ) : (
          <span className="df-muted">尚未取得审批日期</span>
        )}
        {stage && onOpen && (
          <button
            type="button"
            onClick={() => onOpen(stage.id)}
            aria-label={`查看${title}资料`}
          >
            审批资料
          </button>
        )}
      </div>
    </TimelineStep>
  );
}

function TimeInput({
  id,
  label,
  type = "datetime-local",
  value,
  onChange,
  issueId,
  readOnly,
}) {
  return (
    <label className="df-field">
      <span>{label}</span>
      <input
        id={id}
        type={type}
        step={type === "datetime-local" ? "any" : undefined}
        value={value}
        readOnly={readOnly}
        aria-invalid={Boolean(issueId) || undefined}
        aria-describedby={issueId}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function IssueList({ id, details }) {
  return (
    details.length > 0 && (
      <ul className="df-timeline-issues" id={id}>
        {details.map((detail) => (
          <li key={detail}>{detail}</li>
        ))}
      </ul>
    )
  );
}

export function endpoints(field, binding) {
  if (field.value === binding?.value && binding.start) return binding;
  // Picker edits use ISO values. Legacy text gets normalized by the server.
  const [first, last = ""] = field.value.split(" ~ ");
  const dateTime =
    /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,6})?)?$/;
  const parsed = (value) =>
    dateTime.test(value) ? value.replace(" ", "T") : "";
  return {
    start:
      field.kind === "date" && /^\d{4}-\d{2}-\d{2}$/.test(first)
        ? first
        : parsed(first),
    end: parsed(last),
  };
}

function ScheduleTime({ title, binding, field, range, issues, onEdit }) {
  const issueId = useId();
  if (!field) return null;
  const { start, end } = endpoints(field, binding);
  const details = [
    ...new Set(
      issues
        .filter((issue) => issue.field === field.key)
        .map((issue) =>
          issue.label && issue.detail.startsWith("时间顺序冲突")
            ? `${issue.label}。${issue.detail}`
            : issue.detail,
        ),
    ),
  ];
  const hasRange = range && !["date", "datetime-local"].includes(field.kind);
  const labelPrefix = title.replace(/时间$/, "");
  const errorId = details.length ? issueId : undefined;
  const write = (first, last) =>
    onEdit(field.key, last ? `${first} ~ ${last}` : first);
  return (
    <TimelineStep
      title={title}
      state={details.length ? "error" : start ? "set" : "pending"}
    >
      <div className="df-timeline-controls">
        <TimeInput
          id={timelineInputId(field.key)}
          label={hasRange ? `${labelPrefix}开始时间` : field.label}
          type={field.kind === "date" ? "date" : "datetime-local"}
          value={start}
          issueId={errorId}
          readOnly={field.read_only}
          onChange={(value) => write(value, hasRange ? end : "")}
        />
        {hasRange && (
          <TimeInput
            label={`${labelPrefix}结束时间（可选）`}
            value={end}
            issueId={errorId}
            readOnly={field.read_only}
            onChange={(value) => write(start, value)}
          />
        )}
      </div>
      {field.value && !start && !end && (
        <p className="df-muted">当前填写值 {field.value}</p>
      )}
      <IssueList id={issueId} details={details} />
    </TimelineStep>
  );
}

function RecipientTime({ recipient, index, approvalDate, issues, onEdit }) {
  const startId = useId();
  const endId = useId();
  const start = recipient.start.replace(" ", "T");
  const end = recipient.end.replace(" ", "T");
  const errors = (key) =>
    new Set(
      issues
        .filter((issue) => issue.field === `recipient-${index}-${key}`)
        .map((issue) => issue.detail),
    );
  const startErrors = errors("start");
  const endErrors = errors("end");
  if (approvalDate && start && start.slice(0, 10) <= approvalDate) {
    startErrors.add(
      `领取开始日期必须晚于选商论证审批日期（${approvalDate}）。`,
    );
  }
  return (
    <li className="df-timeline-recipient">
      <strong>{recipient.name || `第 ${index + 1} 家单位`}</strong>
      <div className="df-timeline-controls">
        <div>
          <TimeInput
            id={timelineInputId(`recipient-${index}-start`)}
            label={`第${index + 1}家领取开始时间`}
            value={start}
            issueId={startErrors.size ? startId : undefined}
            onChange={(value) => onEdit(index, "start", value)}
          />
          <IssueList id={startId} details={[...startErrors]} />
        </div>
        <div>
          <TimeInput
            id={timelineInputId(`recipient-${index}-end`)}
            label={`第${index + 1}家领取结束时间`}
            value={end}
            issueId={endErrors.size ? endId : undefined}
            onChange={(value) => onEdit(index, "end", value)}
          />
          <IssueList id={endId} details={[...endErrors]} />
        </div>
      </div>
    </li>
  );
}

export default function NegotiationTimeline({
  project,
  draft,
  times,
  issues,
  onEdit,
  onEditRecipient,
  onFollowDispatch,
  onOpenRecipients,
  onOpenApproval,
}) {
  const fields = new Map(draft.fields.map((field) => [field.key, field]));
  const stage = (id) => project.stages.find((item) => item.id === id);
  const selection = stage("selection");
  const approvalDate =
    selection?.status === "completed" ? selection.approval_date : "";
  const errors = issues.filter((issue) => issue.status === "error");
  const time = (role, title, range = false) => (
    <ScheduleTime
      title={title}
      binding={times[role]}
      field={fields.get(times[role]?.key)}
      issues={errors}
      range={range}
      onEdit={onEdit}
    />
  );
  const hasRecipientError =
    errors.some((issue) => /^recipient-\d+-(start|end)$/.test(issue.field)) ||
    Boolean(
      approvalDate &&
        draft.recipients.some(
          (recipient) =>
            recipient.start && recipient.start.slice(0, 10) <= approvalDate,
        ),
    );
  return (
    <>
      <h2>商务谈判时间轴</h2>
      <ol className="df-negotiation-timeline">
        <Approval
          stage={stage("plan")}
          title="计划审批"
          onOpen={onOpenApproval}
        />
        <Approval
          stage={selection}
          title="论证意见审批"
          onOpen={onOpenApproval}
        />
        {time("issue", "文件落款")}
        {time("dispatch", "邀请函发放时间", true)}
        <TimelineStep
          title="邀请函领取"
          state={
            hasRecipientError
              ? "error"
              : draft.recipients.some((recipient) => recipient.start)
              ? "set"
              : "pending"
          }
        >
          {onFollowDispatch && (
            <button type="button" onClick={onFollowDispatch}>
              全部跟随发放时间
            </button>
          )}
          {draft.recipients.length ? (
            <ul className="df-timeline-recipients">
              {draft.recipients.map((recipient, index) => (
                <RecipientTime
                  key={index}
                  recipient={recipient}
                  index={index}
                  approvalDate={approvalDate}
                  issues={errors}
                  onEdit={onEditRecipient}
                />
              ))}
            </ul>
          ) : (
            <button type="button" onClick={onOpenRecipients}>
              设置受邀单位
            </button>
          )}
        </TimelineStep>
        {time("qa", "商务答疑", true)}
        {time("response", "响应文件提交截止")}
        {time("negotiation", "商务谈判", true)}
      </ol>
    </>
  );
}
