"""Index eZWalker endpoint records and attributed object references."""

from collections import defaultdict
import json
import re
import unicodedata

ASSET_TERMS = "lower(tag||' '||name||' '||site)"
RELATION_TERMS = """lower(a.tag||' '||a.name||' '||coalesce(b.tag,'')||' '||
                    coalesce(b.name,'')||' '||r.text||' '||r.evidence)"""

RELATIONS = {
    "process": "工艺起终点",
    "contact": "几何接点（待核对）",
    "reference": "管线名称引用",
    "weld": "焊口管线位号",
    "cable": "电缆起终点",
    "endpoint": "其他对象起终点",
}
PAGE_SIZE = 50
END_FIELDS = {
    "起端": "起端",
    "终端": "终端",
    "起端位号": "起端",
    "终端位号": "终端",
    "起点位号": "起端",
    "终点位号": "终端",
    "上游设备位号": "上游",
    "下游设备位号": "下游",
}
# Keep punctuation inside designations. V-101A, V-101/A and V-101(A) can
# identify three different objects. Never match V-101 inside one of them.
TAG_TOKEN = re.compile(r"[A-Za-z0-9][A-Za-z0-9_./#+~\-]*(?:\([A-Za-z0-9_./#+~\-]+\))*")
UNKNOWN_TAG = re.compile(r"[A-Za-z]{1,8}-?\d{2,}[A-Za-z0-9_./#+~()\-]*\Z")
RATING = re.compile(r"(?:DN|PN|MPA|KV)\d", re.I)
TO_MARKER = re.compile(r"送至|通往|去往|接至|引至|输至|通至|至|去")
WELD_SUFFIX = re.compile(
    r"-(?:[BD]\d+(?:-\d+)?-H\d+(?:/H\d+)*(?:-(?:G|R\d+))?"
    r"|[1-6]G[+-]\d+(?:\+\d+)?|\d+(?:\+\d+)?)\Z",
    re.I,
)
SPLIT_LINE = re.compile(r"#\d+\Z")
MATCH_STATUS = """case when r.kind='contact' then 'candidate'
                       when r.target_tree is not null then 'resolved'
                       when r.matches>1 then 'ambiguous' else 'unresolved' end"""


def _normal(value):
    return (
        unicodedata.normalize("NFKC", str(value)).strip() if value is not None else ""
    )


def _values(props, wanted):
    fields = defaultdict(list)
    for field, value in props:
        if field in wanted and _normal(value) not in {"", "-", "--", "/", "—"}:
            text = str(value)
            if text not in fields[field]:
                fields[field].append(text)
    return fields


def _is_pipe(kind):
    return kind.casefold() in {"pipe", "pipeline"} or kind.endswith(
        ("管线", "管道", "管段")
    )


def _row(kind, owner, role, text, field, evidence, targets, exact=True):
    possible = targets - {owner}
    target = next(iter(possible)) if exact and len(possible) == 1 else (None, None)
    return (kind, *owner, *target, role, text, field, evidence, len(possible))


def _name_references(owner, name, tags):
    normalized = _normal(name)
    if not normalized:
        return
    marker = TO_MARKER.search(normalized)
    if marker:
        parts = [
            ("名称前段", normalized[: marker.start()]),
            ("去向描述", normalized[marker.end() :]),
        ]
    elif "来气" in normalized or "来自" in normalized:
        parts = [("来源描述", normalized)]
    else:
        parts = [("位号引用", normalized)]
    for role, fragment in parts:
        fragment = fragment.strip()
        if not fragment:
            continue
        mentions = []
        for token in TAG_TOKEN.findall(fragment):
            if token in mentions:
                continue
            candidates = tags.get(token, set())
            # A description equal to its own tag supplies no object relation.
            if candidates == {owner}:
                continue
            if candidates or (UNKNOWN_TAG.fullmatch(token) and not RATING.match(token)):
                mentions.append(token)
                yield _row("reference", owner, role, token, "名称", name, candidates)
        if not mentions and role != "位号引用":
            # Keep a textual destination even if no tag exists in the catalog.
            yield _row("reference", owner, role, fragment, "名称", name, set())


def _weld_relation(owner, weld_tag, pipes, line_pieces):
    tag = _normal(weld_tag)
    suffix = WELD_SUFFIX.search(tag)
    text = tag
    direct = set()
    possible = set()
    if suffix:
        stem = tag[: suffix.start()]
        # A project code may precede the entire line designation. Both sides
        # of a matched line must be bounded by actual tag delimiters.
        starts = [0, *(part.end() for part in re.finditer("-", stem))]
        for pos in starts:
            label = stem[pos:]
            if pos and ("-" not in label or not any(c.isdigit() for c in label)):
                continue
            if label in pipes or label in line_pieces:
                if not possible:
                    text = label
                direct.update(pipes.get(label, ()))
                possible.update(pipes.get(label, ()))
                possible.update(line_pieces.get(label, ()))
    return _row(
        "weld", owner, "管线位号", text, "位号", weld_tag, possible, exact=bool(direct)
    )


def _attribute_rows(db):
    tags, names, pipes, line_pieces = (defaultdict(set) for _ in range(4))
    records = []
    wanted = {"位号", "名称", "井号", *END_FIELDS}
    for tree, node, tag, name, kind, props in db.execute(
        "select tree,node,tag,name,kind,props from asset order by tree,node"
    ):
        owner = (tree, node)
        kind = _normal(kind)
        fields = _values(json.loads(props), wanted)
        pipe = _is_pipe(kind)
        for value in (*fields["位号"], tag):
            key = _normal(value)
            if key:
                tags[key].add(owner)
                if pipe:
                    pipes[key].add(owner)
                    if SPLIT_LINE.search(key):
                        line_pieces[SPLIT_LINE.sub("", key)].add(owner)
        for value in fields["井号"]:
            tags[_normal(value)].add(owner)
        for value in (*fields["名称"], name):
            key = _normal(value)
            if key:
                names[key].add(owner)
        if pipe or kind == "焊口" or END_FIELDS.keys() & fields.keys():
            records.append((owner, kind, fields))

    for owner, kind, fields in records:
        pipe = _is_pipe(kind)
        cable = "电缆" in kind or kind.casefold() == "cable"
        category = "cable" if cable else "process" if pipe else "endpoint"
        for field, role in END_FIELDS.items():
            for text in fields.get(field, ()):
                key = _normal(text)
                matches = tags.get(key, set())
                if "位号" not in field:
                    matches = matches | names.get(key, set())
                # In 设备 A 的控制柜, A is a context, not the cable terminal.
                # Keep the complete field and bind only a complete ID/name.
                yield _row(category, owner, role, text, field, text, matches)
        if pipe:
            for name in fields["名称"]:
                yield from _name_references(owner, name, tags)
        if kind == "焊口":
            for value in fields["位号"]:
                yield _weld_relation(owner, value, pipes, line_pieces)


def add_relations(db, rows):
    """Append (kind, owner key, target key, role, text, field, evidence, matches)."""
    indexed = _has_table(db, "ez_relation_terms")
    last_id = (
        db.execute("select coalesce(max(id),0) from ez_relation").fetchone()[0]
        if indexed
        else 0
    )
    db.executemany(
        """insert into ez_relation(kind,owner_tree,owner_node,target_tree,target_node,
                    role,text,field,evidence,matches) values(?,?,?,?,?,?,?,?,?,?)""",
        rows,
    )
    if indexed:
        index_relations(db, last_id)


def _has_table(db, name):
    return (
        db.execute(
            "select 1 from pragma_table_list where schema='main' and name=? and type='table'",
            (name,),
        ).fetchone()
        is not None
    )


def build_lookup(db):
    # The source asset table also holds attributes and geometry blobs. The
    # directory and substring searches need only the compact fields below.
    db.execute("""create table ez_asset_lookup(
        tree integer, node integer, tag text, name text, kind text, site text,
        cylinders integer, terms text, primary key(tree,node)) without rowid""")
    db.execute(
        "insert into ez_asset_lookup select tree,node,tag,name,kind,site,"
        f"length(geom)/28,{ASSET_TERMS} from asset"
    )
    db.execute("create index ez_asset_kind on ez_asset_lookup(kind,tree,node)")
    db.execute("create table ez_relation_terms(id integer primary key,terms text)")
    index_relations(db, 0)


def index_relations(db, last_id):
    db.execute(
        f"""insert into ez_relation_terms select r.id,{RELATION_TERMS}
            from ez_relation r join asset a on a.tree=r.owner_tree and a.node=r.owner_node
            left join asset b on b.tree=r.target_tree and b.node=r.target_node
            where r.id>?""",
        (last_id,),
    )


def build_topology(src, dst):
    """Build source-field relations. The caller appends scene contacts and commits."""
    dst.execute("""create table if not exists ez_relation(
           id integer primary key, kind text not null,
           owner_tree integer not null, owner_node integer not null,
           target_tree integer, target_node integer,
           role text not null, text text not null, field text not null,
           evidence text not null, matches integer not null)""")
    dst.execute("create table if not exists ez_topology_info(centerlines integer)")
    if _has_table(dst, "ez_relation_terms"):
        dst.execute("delete from ez_relation_terms")
    dst.execute("delete from ez_relation")
    dst.execute("delete from ez_topology_info")
    centerlines = None
    if src is not None and _has_table(src, "t_node_centerLines"):
        centerlines = src.execute("select count(*) from t_node_centerLines").fetchone()[
            0
        ]
    dst.execute("insert into ez_topology_info values (?)", (centerlines,))
    add_relations(dst, _attribute_rows(dst))
    for index, columns in (
        ("kind", "kind"),
        ("owner", "owner_tree,owner_node"),
        ("target", "target_tree,target_node"),
    ):
        dst.execute(
            f"create index if not exists ez_relation_{index} on ez_relation({columns})"
        )
    return topology_summary(dst)


def _summary(db, source, where="", args=(), kind=""):
    available = _has_table(db, "ez_relation")
    counts = defaultdict(int)
    statuses = defaultdict(int)
    centerlines = None
    if available:
        rows = db.execute(
            f"select r.kind,{MATCH_STATUS},count(*)" + source + where + " group by 1,2",
            args,
        )
        for category, status, count in rows:
            counts[category] += count
            if not kind or category == kind:
                statuses[status] += count
        info = db.execute("select centerlines from ez_topology_info").fetchone()
        centerlines = info[0] if info else None
    return {
        "available": available,
        "count": sum(statuses.values()),
        "types": [
            {"id": key, "label": label, "count": counts[key]}
            for key, label in RELATIONS.items()
        ],
        "statuses": dict(statuses),
        "centerlineRows": centerlines,
    }


def topology_summary(db):
    return _summary(db, " from ez_relation r")


def _asset(data):
    return (
        dict(zip(("tree", "node", "tag", "name", "kind"), data))
        if data[0] is not None
        else None
    )


def _query(db, kind, q, page, owner):
    args = []
    predicates = []
    if owner is not None:
        predicates.append(
            "((r.owner_tree=? and r.owner_node=?) or (r.target_tree=? and r.target_node=?))"
        )
        args.extend((*owner, *owner))
    q = q.strip()
    indexed = _has_table(db, "ez_asset_lookup")
    assets = "ez_asset_lookup" if indexed else "asset"
    source = " from ez_relation r"
    joins = (
        f" join {assets} a on a.tree=r.owner_tree and a.node=r.owner_node"
        f" left join {assets} b on b.tree=r.target_tree and b.node=r.target_node"
    )
    if q:
        if indexed:
            source += " join ez_relation_terms t on t.id=r.id"
        term = "t.terms" if indexed else RELATION_TERMS
        predicates.append(f"instr({term},lower(?))>0")
        args.append(q)
    where = " where " + " and ".join(predicates) if predicates else ""
    summary_source = source + joins if q and not indexed else source
    result = _summary(db, summary_source, where, args, kind)
    page = min(max(0, int(page)), 1_000_000)
    result.update(page=page, pageSize=PAGE_SIZE, rows=[])
    if not result["count"]:
        return result
    if kind:
        predicates.append("r.kind=?")
        args.append(kind)
        where = " where " + " and ".join(predicates)
    columns = f"""select r.id,r.kind,r.role,r.text,r.field,r.evidence,{MATCH_STATUS},r.matches,
        a.tree,a.node,a.tag,a.name,a.kind,b.tree,b.node,b.tag,b.name,b.kind"""
    records = db.execute(
        columns + source + joins + where + " order by r.id limit ? offset ?",
        (*args, PAGE_SIZE, page * PAGE_SIZE),
    )
    for row in records:
        item = dict(
            zip(
                (
                    "id",
                    "kind",
                    "role",
                    "text",
                    "field",
                    "evidence",
                    "status",
                    "matches",
                ),
                row[:8],
            )
        )
        item.update(
            label=RELATIONS[item["kind"]],
            owner=_asset(row[8:13]),
            target=_asset(row[13:]),
        )
        result["rows"].append(item)
    return result


def topology(db, *, kind="", q="", page=0):
    return _query(db, kind, q, page, None)


def related(db, tree, node, *, page=0, kind="", q=""):
    return _query(db, kind, q, page, (tree, node))
