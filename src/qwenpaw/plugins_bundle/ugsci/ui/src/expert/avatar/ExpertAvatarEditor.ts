import { getHost } from "../../core/runtime";
import { ExpertAvatar } from "../../components/avatars";
import { avatarKit, type AvatarChoice } from "./avatarArtwork";
import { AVATAR_COLOR_PARTS, type ExpertAvatarRecipe } from "./expertAvatar";

const AVATAR_STYLES = `
.ugsci-avatar-editor,.ugsci-avatar-color-panel{color:var(--app-text,var(--app-card-text));font-size:13px;}
.ugsci-avatar-editor{display:grid;grid-template-columns:210px minmax(0,1fr);background:var(--app-surface);}
.ugsci-avatar-editor *,.ugsci-avatar-color-panel *{box-sizing:border-box;}
.ugsci-avatar-preview{padding:24px 22px;background:var(--app-surface-subtle);border-right:1px solid var(--app-border);min-width:0;}
.ugsci-avatar-preview-content{position:sticky;top:16px;}
.ugsci-avatar-artboard{height:150px;display:grid;place-items:center;}
.ugsci-avatar-identity{display:grid;gap:4px;text-align:center;}
.ugsci-avatar-identity strong{font-size:14px;font-weight:600;overflow-wrap:anywhere;}
.ugsci-avatar-identity>span{font-size:12px;color:var(--app-text-secondary);overflow-wrap:anywhere;}
.ugsci-avatar-sizes{display:flex;align-items:end;justify-content:space-evenly;gap:12px;margin:18px 0 20px;}
.ugsci-avatar-sizes>span{display:flex;align-items:center;flex-direction:column;gap:9px;}
.ugsci-avatar-size-art{display:flex;align-items:end;height:48px;}
.ugsci-avatar-sizes small{font-size:11px;color:var(--app-text-secondary);}
.ugsci-avatar-config{padding:16px 24px;min-width:0;}
.ugsci-avatar-editor h3{margin:0;font-size:14px;font-weight:600;line-height:1.5;}
.ugsci-avatar-identity-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;}
.ugsci-avatar-identity-section{padding-bottom:14px;border-bottom:1px solid var(--app-border);}
.ugsci-avatar-toolbar{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:10px;}
.ugsci-avatar-editor label,.ugsci-avatar-color-panel label{display:flex;flex-direction:column;gap:6px;min-width:0;font-size:12px;}
.ugsci-avatar-editor :is(input,select),.ugsci-avatar-color-panel :is(input,select){box-sizing:border-box;width:100%;min-width:0;min-height:34px;padding:7px 9px;border:1px solid var(--app-border);border-radius:6px;background:var(--app-surface);color:inherit;font:inherit;font-size:12px;line-height:1.5;}
.ugsci-avatar-editor :is(input,select,button):focus-visible,.ugsci-avatar-color-panel :is(input,select,button):focus-visible{outline:2px solid var(--app-action-link);outline-offset:2px;}
.ugsci-avatar-roles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;max-height:160px;overflow:auto;}
.ugsci-avatar-roles button{min-width:0;text-align:center;border:1px solid var(--app-border);border-radius:8px;padding:8px 5px;background:var(--app-surface);color:inherit;font:inherit;font-size:11px;line-height:1.5;overflow-wrap:anywhere;cursor:pointer;}
.ugsci-avatar-roles button[aria-pressed=true]{border-color:var(--app-text);background:var(--app-surface-subtle);}
.ugsci-avatar-roles>p{grid-column:1/-1;margin:0;padding:8px 0;font-size:12px;color:var(--app-text-secondary);}
.ugsci-avatar-rematch,.ugsci-avatar-reset{display:inline-flex;align-items:center;gap:5px;border:0;padding:3px 0;background:none;color:var(--app-text-secondary);cursor:pointer;font:inherit;font-size:11px;line-height:1.5;}
.ugsci-avatar-rematch svg,.ugsci-avatar-reset svg{width:13px;height:13px;}
.ugsci-avatar-editor :disabled{opacity:.55;cursor:default;}
.ugsci-avatar-settings{margin:14px 0 20px;border-bottom:1px solid var(--app-border);padding-bottom:14px;}
.ugsci-avatar-settings>summary{cursor:pointer;font-size:13px;padding:8px 0;}
.ugsci-avatar-settings .ugsci-avatar-editor{border:1px solid var(--app-border);border-radius:14px;overflow:hidden;}
.ugsci-avatar-parts-section{padding-top:12px;}
.ugsci-avatar-parts-section>h3{margin-bottom:6px;}
.ugsci-avatar-options{display:grid;}
.ugsci-avatar-option{min-width:0;min-height:40px;display:grid;grid-template-columns:88px minmax(0,1fr);align-items:center;gap:9px;font-size:12px;}
.ugsci-avatar-option-row{display:flex;align-items:center;gap:9px;min-width:0;}
.ugsci-avatar-option-row>select{flex:1;}
.ugsci-avatar-crown{padding:4px 0;}
.ugsci-avatar-crown-selects{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;flex:1;min-width:0;}
.ugsci-avatar-editor .ugsci-avatar-category{display:grid;grid-template-columns:88px minmax(0,1fr);align-items:center;gap:9px;padding-right:41px;margin-top:6px;}
.ugsci-avatar-swatch{display:inline-flex;align-items:center;justify-content:center;flex:0 0 32px;width:32px;height:32px;padding:5px;border:1px solid var(--app-border);border-radius:6px;background:var(--app-surface);cursor:pointer;color:var(--app-text);}
.ugsci-avatar-swatch>span{display:block;width:20px;height:20px;border-radius:2px;}
.ugsci-avatar-swatch[aria-expanded=true]{outline:2px solid var(--app-action-link);outline-offset:1px;}
.ugsci-avatar-color-panel{box-sizing:border-box;width:252px;max-width:calc(100vw - 48px);display:flex;flex-direction:column;gap:16px;}
.ugsci-avatar-color-panel .ugsci-avatar-rematch{align-self:flex-end;padding:8px 14px;border:1px solid var(--app-border);border-radius:7px;background:var(--app-text);color:var(--app-surface);font-size:12px;}
.ugsci-avatar-color-popover [class*="-popover-inner"]{background:var(--app-surface);border:1px solid var(--app-border);}
.ugsci-avatar-background-value{display:flex;align-items:center;flex:1;min-height:34px;color:var(--app-text-secondary);}
.ugsci-avatar-editor-footer{margin-top:14px;}
.ugsci-avatar-modal-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;}
.ugsci-avatar-modal-footer>div{display:flex;gap:8px;}
.ugsci-avatar-modal-footer button:not(.ugsci-avatar-reset){height:auto;padding:8px 14px;font-size:12px;line-height:1.5;border-radius:7px;margin:0;}
.ugsci-avatar-modal button[class*="-modal-close"]{top:9px;inset-inline-end:12px;width:30px;height:30px;}
.ugsci-avatar-color-control{display:flex;gap:8px;margin-top:6px;align-items:center;}
.ugsci-avatar-color-control input[type=color]{width:38px;min-width:38px;height:34px;padding:3px;cursor:pointer;}
.ugsci-avatar-color-control input[type=text]{flex:1;font-family:monospace;}
.ugsci-avatar-color-control input[aria-invalid=true]{border-color:var(--app-error);}
.ugsci-avatar-color-error{font-size:11px;color:var(--app-error);}
@media(max-width:620px){.ugsci-avatar-editor{grid-template-columns:minmax(0,1fr);}.ugsci-avatar-preview{padding:14px 22px;border-right:0;border-bottom:1px solid var(--app-border);}.ugsci-avatar-preview-content{position:static;display:grid;grid-template-columns:96px minmax(0,1fr);column-gap:18px;}.ugsci-avatar-artboard{grid-row:1/3;height:96px;}.ugsci-avatar-artboard>span{width:92px!important;height:92px!important;}.ugsci-avatar-artboard svg{width:92px;height:92px;}.ugsci-avatar-identity{text-align:start;align-content:center;}.ugsci-avatar-sizes{justify-content:start;gap:22px;margin:9px 0 0;}.ugsci-avatar-size-art{height:32px;}.ugsci-avatar-size-art>span{max-width:32px;max-height:32px;}.ugsci-avatar-size-art svg{max-width:32px;max-height:32px;}.ugsci-avatar-option{grid-template-columns:78px minmax(0,1fr);gap:7px;}.ugsci-avatar-crown-selects{grid-template-columns:minmax(0,1fr);}.ugsci-avatar-editor .ugsci-avatar-category{grid-template-columns:78px minmax(0,1fr);gap:7px;padding-right:41px;}}
@media(pointer:coarse){.ugsci-avatar-editor :is(button,select,input){min-height:44px;}.ugsci-avatar-editor :is(select,input){font-size:16px;}.ugsci-avatar-swatch{flex-basis:40px;width:40px;height:40px;}.ugsci-avatar-editor .ugsci-avatar-category{padding-right:49px;}}
`;

type AvatarColorPartId = (typeof AVATAR_COLOR_PARTS)[number]["id"];
const COLOR_PARTS_BY_FIELD: Partial<
  Record<keyof ExpertAvatarRecipe, AvatarColorPartId[]>
> = {
  shell: ["shell"],
  visor: ["visor"],
  expression: ["eyes"],
  badge: ["badge", "badge_ring"],
};

function AvatarColorSwatch({
  parts,
  value,
  onChange,
  disabled,
}: {
  parts: AvatarColorPartId[];
  value: ExpertAvatarRecipe;
  onChange: (recipe: ExpertAvatarRecipe) => void;
  disabled: boolean;
}) {
  const React = getHost().React;
  const { Popover } = getHost().antd;
  const [open, setOpen] = React.useState(false);
  const [selectedPart, setSelectedPart] = React.useState(parts[0]);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const panel = React.useRef<HTMLDivElement>(null);
  const id = React.useId();
  const first = AVATAR_COLOR_PARTS.find((part) => part.id === parts[0])!;
  const color = value.colors?.[first.id];
  const custom = !!color && /^#[0-9a-f]{6}$/i.test(color);
  const transparent =
    color === "transparent" || (!custom && "transparent" in first);
  const label = `${first.label}配色`;
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  React.useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(
      () =>
        panel.current?.querySelector("select")?.focus({ preventScroll: true }),
    );
    return () => cancelAnimationFrame(frame);
  }, [open]);
  return React.createElement(
    Popover,
    {
      open: open && !disabled,
      onOpenChange: (next: boolean) => {
        if (next) setSelectedPart(parts[0]);
        setOpen(next);
      },
      trigger: "click",
      placement: "bottom",
      autoAdjustOverflow: true,
      destroyOnHidden: true,
      classNames: { root: "ugsci-avatar-color-popover" },
      content: React.createElement(
        "div",
        {
          ref: panel,
          id,
          role: "dialog",
          "aria-label": label,
          className: "ugsci-avatar-color-panel",
          onKeyDown: (event: {
            key: string;
            preventDefault: () => void;
            stopPropagation: () => void;
          }) => {
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              close();
            }
          },
        },
        parts.length > 1 &&
          React.createElement(
            "label",
            null,
            "配置部件",
            React.createElement(
              "select",
              {
                value: selectedPart,
                disabled,
                onChange: (event: { target: { value: string } }) =>
                  setSelectedPart(event.target.value as AvatarColorPartId),
              },
              parts.map((partId) =>
                React.createElement(
                  "option",
                  { key: partId, value: partId },
                  AVATAR_COLOR_PARTS.find((part) => part.id === partId)!.label,
                ),
              ),
            ),
          ),
        React.createElement(AvatarColorControl, {
          key: selectedPart,
          part: AVATAR_COLOR_PARTS.find((part) => part.id === selectedPart)!,
          value: value.colors?.[selectedPart],
          disabled,
          onChange: (next) =>
            onChange({
              ...value,
              colors: { ...value.colors, [selectedPart]: next },
            }),
        }),
        React.createElement(
          "button",
          { type: "button", className: "ugsci-avatar-rematch", onClick: close },
          "完成",
        ),
      ),
    },
    React.createElement(
      "button",
      {
        ref: trigger,
        type: "button",
        className: "ugsci-avatar-swatch",
        disabled,
        "aria-label": label,
        "aria-haspopup": "dialog",
        "aria-expanded": open && !disabled,
        "aria-controls": open ? id : undefined,
        title: `${label} · ${
          custom ? color : transparent ? "透明" : "跟随主题"
        }`,
      },
      React.createElement("span", {
        "aria-hidden": true,
        style: transparent
          ? {
              background:
                "conic-gradient(var(--app-border) 25%, transparent 0 50%, var(--app-border) 0 75%, transparent 0) 0 0 / 8px 8px",
            }
          : { background: custom ? color : "currentColor" },
      }),
    ),
  );
}

function AvatarColorControl({
  part,
  value,
  onChange,
  disabled,
}: {
  part: (typeof AVATAR_COLOR_PARTS)[number];
  value: string | undefined;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const React = getHost().React;
  const isColor = (color: string) => /^#[0-9a-f]{6}$/i.test(color);
  const selectedColor = value && isColor(value) ? value : part.fallback;
  const [hex, setHex] = React.useState(selectedColor);
  React.useEffect(() => setHex(selectedColor), [selectedColor]);
  const transparent = "transparent" in part;
  const mode =
    value === "transparent" && transparent
      ? "transparent"
      : value && isColor(value)
      ? "custom"
      : "auto";
  const customDisabled = disabled || mode !== "custom";
  return React.createElement(
    "div",
    { className: "ugsci-avatar-color-field" },
    React.createElement(
      "label",
      null,
      "颜色模式",
      React.createElement(
        "select",
        {
          "aria-label": `${part.label}配色模式`,
          value: mode,
          disabled,
          onChange: (event: { target: { value: string } }) =>
            onChange(
              event.target.value === "custom"
                ? selectedColor
                : event.target.value,
            ),
        },
        React.createElement(
          "option",
          { value: "auto" },
          transparent ? "默认透明" : "跟随主题",
        ),
        React.createElement("option", { value: "custom" }, "自定义颜色"),
        transparent &&
          React.createElement("option", { value: "transparent" }, "透明"),
      ),
    ),
    React.createElement(
      "div",
      { className: "ugsci-avatar-color-control" },
      React.createElement("input", {
        type: "color",
        "aria-label": `${part.label}取色器`,
        value: selectedColor,
        disabled: customDisabled,
        onChange: (event: { target: { value: string } }) =>
          onChange(event.target.value),
      }),
      React.createElement("input", {
        type: "text",
        "aria-label": `${part.label}颜色值`,
        value: hex,
        maxLength: 7,
        spellCheck: false,
        disabled: customDisabled,
        "aria-invalid": mode === "custom" && !isColor(hex),
        onChange: (event: { target: { value: string } }) => {
          setHex(event.target.value);
          if (isColor(event.target.value)) onChange(event.target.value);
        },
        onBlur: () => {
          if (!isColor(hex)) setHex(selectedColor);
        },
      }),
    ),
    mode === "custom" &&
      !isColor(hex) &&
      React.createElement(
        "span",
        { className: "ugsci-avatar-color-error", role: "status" },
        "请输入 # 加六位十六进制颜色",
      ),
  );
}

export function AvatarResetColorsButton({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  const React = getHost().React;
  return React.createElement(
    "button",
    {
      type: "button",
      disabled,
      className: "ugsci-avatar-reset",
      "aria-label": "恢复全部默认配色",
      onClick,
    },
    React.createElement(
      "svg",
      {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true,
        focusable: "false",
      },
      React.createElement("path", { d: "M3 11a9 9 0 1 1 2.4 6.1M3 4v7h7" }),
    ),
    "重置配色",
  );
}

export function ExpertAvatarEditor({
  name,
  value,
  suggested,
  onChange,
  disabled = false,
  showResetColors = true,
}: {
  name: string;
  value: ExpertAvatarRecipe;
  suggested: ExpertAvatarRecipe;
  onChange: (recipe: ExpertAvatarRecipe) => void;
  disabled?: boolean;
  showResetColors?: boolean;
}) {
  const React = getHost().React;
  const [query, setQuery] = React.useState("");
  const editorId = React.useId();
  const domain = avatarKit.domains.find((item) => item.id === value.domain)!;
  const crown = avatarKit.domains.find(
    (item) => item.id === value.crown_domain,
  );
  const roles = React.useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return domain.roles.map((role) => ({ domain, role }));
    return avatarKit.domains
      .flatMap((item) => item.roles.map((role) => ({ domain: item, role })))
      .filter((item) =>
        `${item.domain.label} ${item.role.label} ${item.role.detail}`
          .toLowerCase()
          .includes(search),
      );
  }, [domain, query]);
  const change = (patch: Partial<ExpertAvatarRecipe>) =>
    onChange({ ...value, ...patch });
  const dropdown = (
    label: string,
    field: keyof ExpertAvatarRecipe,
    choices: AvatarChoice[],
    update?: (id: string) => void,
    unavailable = false,
  ) =>
    React.createElement(
      "select",
      {
        "aria-label": label,
        id: `${editorId}-${field}`,
        value: value[field],
        disabled: disabled || unavailable,
        onChange: (event: { target: { value: string } }) =>
          update
            ? update(event.target.value)
            : change({ [field]: event.target.value }),
      },
      choices.map((item) =>
        React.createElement(
          "option",
          { key: item.id, value: item.id },
          item.label,
        ),
      ),
    );
  const select = (
    label: string,
    field: keyof ExpertAvatarRecipe,
    choices: AvatarChoice[],
  ) =>
    React.createElement(
      "div",
      { key: field, className: "ugsci-avatar-option" },
      React.createElement("label", { htmlFor: `${editorId}-${field}` }, label),
      React.createElement(
        "div",
        { className: "ugsci-avatar-option-row" },
        dropdown(label, field, choices),
        COLOR_PARTS_BY_FIELD[field] &&
          React.createElement(AvatarColorSwatch, {
            parts: COLOR_PARTS_BY_FIELD[field]!,
            value,
            onChange,
            disabled,
          }),
      ),
    );
  return React.createElement(
    "section",
    { className: "ugsci-avatar-editor", "aria-label": "专家头像工坊" },
    React.createElement("style", null, AVATAR_STYLES),
    React.createElement(
      "aside",
      { className: "ugsci-avatar-preview" },
      React.createElement(
        "div",
        { className: "ugsci-avatar-preview-content" },
        React.createElement(
          "div",
          { className: "ugsci-avatar-artboard" },
          React.createElement(ExpertAvatar, { name, recipe: value, size: 126 }),
        ),
        React.createElement(
          "div",
          { className: "ugsci-avatar-identity" },
          React.createElement("strong", null, name),
          React.createElement(
            "span",
            null,
            value.category_label ||
              domain.roles.find((item) => item.id === value.role)?.label,
          ),
        ),
        React.createElement(
          "div",
          {
            className: "ugsci-avatar-sizes",
            role: "group",
            "aria-label": "小尺寸预览",
          },
          [24, 32, 48].map((size) =>
            React.createElement(
              "span",
              { key: size },
              React.createElement(
                "span",
                { className: "ugsci-avatar-size-art" },
                React.createElement(ExpertAvatar, {
                  name: `${name} ${size}px`,
                  recipe: value,
                  size,
                }),
              ),
              React.createElement("small", null, `${size}px`),
            ),
          ),
        ),
      ),
    ),
    React.createElement(
      "div",
      { className: "ugsci-avatar-config" },
      React.createElement(
        "section",
        {
          className: "ugsci-avatar-identity-section",
          "aria-label": "专家身份",
        },
        React.createElement(
          "div",
          { className: "ugsci-avatar-identity-heading" },
          React.createElement("h3", null, "专家身份"),
          React.createElement(
            "button",
            {
              type: "button",
              disabled,
              className: "ugsci-avatar-rematch",
              "aria-label": "根据专家身份重新匹配",
              onClick: () => {
                onChange({ ...suggested, colors: value.colors });
                setQuery("");
              },
            },
            React.createElement(
              "svg",
              {
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: 2,
                strokeLinecap: "round",
                strokeLinejoin: "round",
                "aria-hidden": true,
                focusable: "false",
              },
              React.createElement("path", {
                d: "m12 3 1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3ZM5 3v4M3 5h4",
              }),
            ),
            "自动匹配",
          ),
        ),
        React.createElement(
          "div",
          { className: "ugsci-avatar-toolbar" },
          React.createElement(
            "label",
            null,
            "行业",
            dropdown("行业领域", "domain", avatarKit.domains, (id) => {
              const next = avatarKit.domains.find((item) => item.id === id)!;
              change({ domain: id, role: next.roles[0].id });
              setQuery("");
            }),
          ),
          React.createElement(
            "label",
            null,
            "岗位",
            React.createElement("input", {
              type: "search",
              "aria-label": "搜索头像岗位",
              value: query,
              disabled,
              placeholder: "搜索岗位",
              onChange: (event: { target: { value: string } }) =>
                setQuery(event.target.value),
            }),
          ),
        ),
        React.createElement(
          "div",
          {
            className: "ugsci-avatar-roles",
            role: "group",
            "aria-label": "头像岗位",
          },
          roles.map((item) =>
            React.createElement(
              "button",
              {
                type: "button",
                key: `${item.domain.id}/${item.role.id}`,
                disabled,
                "aria-label": item.role.label,
                "aria-pressed":
                  item.domain.id === value.domain &&
                  item.role.id === value.role,
                onClick: () =>
                  change({ domain: item.domain.id, role: item.role.id }),
              },
              item.role.label,
            ),
          ),
          !roles.length &&
            React.createElement("p", { role: "status" }, "未找到岗位"),
        ),
      ),
      React.createElement(
        "section",
        { className: "ugsci-avatar-parts-section", "aria-label": "部件配置" },
        React.createElement("h3", null, "部件配置"),
        React.createElement(
          "div",
          { className: "ugsci-avatar-options" },
          select("头像外壳", "shell", avatarKit.shells),
          select("面罩造型", "visor", [
            { id: "classic", label: "经典" },
            { id: "soft", label: "柔和" },
            { id: "angular", label: "棱角" },
          ]),
          select("头像表情", "expression", [
            { id: "focused", label: "专注" },
            { id: "friendly", label: "友好" },
            { id: "thinking", label: "思考" },
          ]),
          select("副专长徽记", "badge", avatarKit.badges),
          React.createElement(
            "div",
            { className: "ugsci-avatar-option ugsci-avatar-crown" },
            React.createElement(
              "label",
              { htmlFor: `${editorId}-crown_domain` },
              "头饰身份",
            ),
            React.createElement(
              "div",
              { className: "ugsci-avatar-option-row" },
              React.createElement(
                "div",
                { className: "ugsci-avatar-crown-selects" },
                dropdown(
                  "头饰领域",
                  "crown_domain",
                  [{ id: "auto", label: "跟随当前岗位" }, ...avatarKit.domains],
                  (id) => change({ crown_domain: id, crown_role: "auto" }),
                ),
                dropdown(
                  "头饰岗位",
                  "crown_role",
                  [{ id: "auto", label: "自动匹配" }, ...(crown?.roles || [])],
                  undefined,
                  !crown,
                ),
              ),
              React.createElement(AvatarColorSwatch, {
                parts: ["crown"],
                value,
                onChange,
                disabled,
              }),
            ),
          ),
          React.createElement(
            "div",
            { className: "ugsci-avatar-option" },
            React.createElement("span", null, "头像背景"),
            React.createElement(
              "div",
              { className: "ugsci-avatar-option-row" },
              React.createElement(
                "span",
                { className: "ugsci-avatar-background-value" },
                value.colors?.background?.startsWith("#")
                  ? value.colors.background
                  : "透明",
              ),
              React.createElement(AvatarColorSwatch, {
                parts: ["background"],
                value,
                onChange,
                disabled,
              }),
            ),
          ),
        ),
        React.createElement(
          "label",
          { className: "ugsci-avatar-category" },
          "领域名称",
          React.createElement("input", {
            "aria-label": "自定义领域名称",
            maxLength: 64,
            value: value.category_label,
            disabled,
            placeholder: "自定义名称",
            onChange: (event: { target: { value: string } }) =>
              change({ category_label: event.target.value }),
          }),
        ),
      ),
      showResetColors &&
        React.createElement(
          "div",
          { className: "ugsci-avatar-editor-footer" },
          React.createElement(AvatarResetColorsButton, {
            disabled,
            onClick: () => change({ colors: {} }),
          }),
        ),
    ),
  );
}
