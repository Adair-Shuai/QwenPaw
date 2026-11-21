import { Icon } from "./Icon.jsx";
import { EzBinding } from "./EzBinding.jsx";
import { EzGeometry } from "./EzGeometry.jsx";
import { RelatedObjects } from "./EzRelations.jsx";
import { validBounds } from "./ezSceneData.js";
const React = window.QwenPaw.host.React;
export function ExtentInfo({ info }) {
  const meta = info.scene,
    bb = meta?.bounds;
  return (
    <section className="sn-panel sn-overview-aside" aria-label="工区范围">
      <header className="sn-pane-head">
        <h3>
          <Icon name="properties" />
          工区范围
        </h3>
      </header>
      <dl className="sn-extent-spec">
        <dt>坐标单位</dt>
        <dd>{info.unit || "源文件未声明"}</dd>
        {meta?.objects > 0 && (
          <>
            <dt>有总图几何的对象</dt>
            <dd>
              {meta.objects.toLocaleString()} / {info.objects?.toLocaleString()}
            </dd>
          </>
        )}
        {meta?.locatableObjects > meta?.objects && (
          <>
            <dt>可按子件定位的对象</dt>
            <dd>{(meta.locatableObjects - meta.objects).toLocaleString()}</dd>
          </>
        )}
        {validBounds(bb) &&
          ["X 跨度", "Y 跨度", "Z 跨度"].map((label, i) => (
            <React.Fragment key={label}>
              <dt>{label}</dt>
              <dd>
                {(bb[1][i] - bb[0][i]).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}{" "}
                {info.unit}
              </dd>
            </React.Fragment>
          ))}
        {meta?.segments > 0 && (
          <>
            <dt>圆柱构件</dt>
            <dd>{meta.segments.toLocaleString()}</dd>
          </>
        )}
        {meta?.triangles > 0 && (
          <>
            <dt>总图轻量面片</dt>
            <dd>{meta.triangles.toLocaleString()}</dd>
          </>
        )}
        {meta?.arcs > 0 && (
          <>
            <dt>原生圆弧构件</dt>
            <dd>{meta.arcs.toLocaleString()}</dd>
          </>
        )}
        {meta?.groups?.length > 0 && (
          <>
            <dt>可定位分区</dt>
            <dd>{meta.groups.length}</dd>
          </>
        )}
      </dl>
      <p className="sn-empty">点选图中设备或管段，可查看源位号和关联记录。</p>
    </section>
  );
}
export function EzObjectDetail({
  info,
  item,
  selected,
  model,
  apply,
  compact,
  onShowObject,
  onShowLocation,
  onShowAll,
  onPick,
  onPair,
}) {
  const attrs = item?.attributes || [],
    fields = Object.fromEntries(attrs);
  const name = fields["名称"] || fields.TYPE || "工程对象",
    tag = fields["位号"] || selected?.join(":");
  return (
    <section
      className={
        "sn-panel sn-object-detail" + (compact ? " sn-overview-aside" : "")
      }
      aria-label="工程对象详情"
    >
      {item && selected ? (
        <>
          <header className="sn-pane-head">
            <div>
              <small>对象详情</small>
              <h3>{name}</h3>
            </div>
            <code>{tag}</code>
          </header>
          <div className="sn-ez-controls">
            {compact ? (
              <button onClick={onShowObject}>
                <Icon name="properties" />
                打开对象资料
              </button>
            ) : (
              <button onClick={onShowLocation}>
                <Icon name="diagram" />
                在工区总图定位
              </button>
            )}
          </div>
          {compact ? (
            <dl className="sn-extent-spec">
              {[
                ["类型", fields.TYPE || fields["类型"]],
                ["安装地点", fields["安装地点"] || fields["单元名称"]],
                ["源对象", selected.join(" / ")],
              ]
                .filter((r) => r[1])
                .map(([k, v]) => (
                  <React.Fragment key={k}>
                    <dt>{k}</dt>
                    <dd>{String(v)}</dd>
                  </React.Fragment>
                ))}
            </dl>
          ) : (
            <EzBinding
              key={info.revision + selected.join(":")}
              fields={fields}
              source={{
                project: info.name,
                tree: selected[0],
                node: selected[1],
                tag: fields["位号"] ?? "",
              }}
              model={model}
              apply={apply}
            />
          )}
          <RelatedObjects
            record={item.related}
            selected={selected}
            onPick={onPick}
            onPair={onPair}
            onShowAll={onShowAll}
          />
          {!compact && (
            <>
              <EzGeometry encoded={item.cylinders} />
              {item.cylinders && (
                <div className="sn-ez-caption">
                  对象局部坐标 · {info.unit || "源单位未声明"} · 圆柱构件预览
                </div>
              )}
              <div className="sn-attribute-head">
                <h4>源工程属性</h4>
                <span>{attrs.length} 项</span>
              </div>
              <div className="sn-ez-attributes">
                <table aria-label="源工程属性">
                  <tbody>
                    {attrs.map(([k, v], i) => (
                      <tr key={i}>
                        <th scope="row">{k}</th>
                        <td>{String(v ?? "")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      ) : (
        <p className="sn-empty">
          {selected ? "正在读取对象详情…" : "当前没有选中对象"}
        </p>
      )}
    </section>
  );
}
