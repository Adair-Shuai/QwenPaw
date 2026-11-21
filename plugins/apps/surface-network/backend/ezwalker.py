"""Import eZWalker SQLite attributes and supported XRE geometry into a local catalog."""

import gzip
import hashlib
import itertools
import json
import time
import os
from pathlib import Path, PureWindowsPath
import shutil
import struct
import sqlite3
import subprocess
import tempfile
import uuid

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Request,
    Response,
    UploadFile,
)
from filelock import FileLock, Timeout
from qwenpaw.constant import WORKING_DIR
from qwenpaw.pawapp import get_scoped_ctx
from .ezgeometry import load_geometry
from .ezscene import build_scene
from .ezcontacts import contact_evidence
from .eztopology import (
    ASSET_TERMS,
    build_lookup,
    build_topology,
    related,
    topology,
    topology_summary,
)

router = APIRouter()
MIB = 1024 * 1024
CATALOG_VERSION = 3


def storage(ctx):
    key = hashlib.sha256(
        json.dumps([ctx.user_id, ctx.agent_id], ensure_ascii=False).encode()
    ).hexdigest()
    root = Path(WORKING_DIR) / "surface-network" / key
    root.mkdir(parents=True, exist_ok=True)
    return root


def sqlite_input(path):
    db = sqlite3.connect(path.resolve().as_uri() + "?mode=ro&immutable=1", uri=True)
    db.execute("pragma trusted_schema=off")
    db.execute("pragma query_only=on")
    return db


def tables(db, *names):
    ordinary = {r[1] for r in db.execute("pragma table_list") if r[2] == "table"}
    if not set(names) <= ordinary:
        raise ValueError("SQLite 表结构不符合受支持的 eZWalker 工程")


def wlp_info(path):
    db = sqlite_input(path)
    try:
        tables(db, "t_model_Info", "t_viewPoint")
        return {
            "references": [
                PureWindowsPath(str(row[0])).name
                for row in db.execute(
                    "select f_model_path from t_model_Info limit 4096"
                )
            ],
            "views": [
                row[0]
                for row in db.execute("select f_name from t_viewPoint limit 4096")
            ],
        }
    finally:
        db.close()


def extract_model(archive, folder):
    names = ["7zz", "7z", "7za", "7zr"]
    paths = [shutil.which(n) for n in names]
    pf = Path(os.environ.get("ProgramFiles", "C:/Program Files"))
    paths.extend([pf / "7-Zip/7z.exe", pf / "Docker/Docker/7zr.exe"])
    binary = next((str(p) for p in paths if p and Path(p).is_file()), None)
    if not binary:
        raise ValueError(
            "需要 7-Zip 才能读取 WLKX；也可直接选择工区解包后的 data.db 和 model.package"
        )

    def run(*args):
        out = subprocess.run(
            [binary, *args],
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=150,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
        if out.returncode:
            raise ValueError("7-Zip 无法读取此模型包，请检查格式或加密状态")
        return out.stdout.decode("utf-8", "replace")

    listing = run("l", "-slt", "-ba", "-sccUTF-8", "-p-", "--", str(archive))
    members = {}
    for block in listing.replace("\r\n", "\n").split("\n\n"):
        fields = dict(l.split(" = ", 1) for l in block.splitlines() if " = " in l)
        path = fields.get("Path", "").replace("\\", "/")
        if path not in (
            "wlkx/data.db",
            "wlkx/model.package",
            "data.db",
            "model.package",
        ):
            continue
        basename = path.split("/")[-1]
        if (
            basename in members
            or not 0
            < int(fields.get("Size", "0"))
            <= (256 if basename == "data.db" else 1024) * MIB
        ):
            raise ValueError("WLKX 资源重复或超过导入容量")
        members[basename] = path
    if "data.db" not in members:
        raise ValueError("WLKX 没有受支持的属性库 data.db")
    run("e", "-y", "-p-", "-o" + str(folder), "--", str(archive), *members.values())
    return folder / "data.db", folder / "model.package"


def clean(value):
    text = str(value or "").strip()
    return "" if text in ("", "/", "--") else text


def build_catalog(source, geometry, destination, name, project):
    src = sqlite_input(source)
    dst = sqlite3.connect(destination)
    try:
        tables(
            src,
            "t_plat_attr_definition",
            "t_plat_attr_node",
            "t_plat_wlkx",
            "t_global_info",
        )
        definitions = dict(
            src.execute("select f_id,f_name from t_plat_attr_definition")
        )
        if not {"位号", "TYPE", "名称"} & set(definitions.values()):
            raise ValueError("属性库缺少设备名称、位号或类型")
        rows = src.execute(
            """select n.f_treeid,n.f_node_id,d.f_name,n.f_value from t_plat_attr_node n
           join t_plat_attr_definition d on n.f_attr_def=d.f_id where d.f_name!='ColorIndex'
           order by n.f_treeid,n.f_node_id,n.rowid"""
        )
        dst.executescript(
            """create table asset(tree integer,node integer,tag text,name text,kind text,site text,props text,geom blob,primary key(tree,node));
          create table meta(value text);"""
        )
        owners = set()
        for key, items in itertools.groupby(rows, lambda r: (r[0], r[1])):
            props = [(k, v) for _, __, k, v in items]
            fields = dict(props)
            if not any(
                clean(fields.get(k)) for k in ("位号", "TYPE", "类型", "名称", "井号")
            ):
                continue
            owners.add(key)
            dst.execute(
                "insert into asset values(?,?,?,?,?,?,?,NULL)",
                (
                    *key,
                    clean(fields.get("位号")),
                    clean(fields.get("名称")),
                    clean(fields.get("TYPE")) or clean(fields.get("类型")),
                    clean(fields.get("安装地点")) or clean(fields.get("单元名称")),
                    json.dumps(props, ensure_ascii=False, separators=(",", ":")),
                ),
            )
        if not owners:
            raise ValueError("没有可登记的工程对象")
        models = dict(src.execute("select f_mdlname,f_id from t_plat_wlkx"))
        stats = {}
        assembled = {
            "version": 1,
            "segments": 0,
            "triangles": 0,
            "arcs": 0,
            "available": False,
        }
        if geometry and geometry.is_file():
            with geometry.open("rb") as f:
                signature = f.read(32)
            if signature == b"X_R_E_Composite_FileSystem_v001\0":
                parts, stats = load_geometry(geometry, models, owners)
                dst.executemany(
                    "update asset set geom=? where tree=? and node=?",
                    ((buf, *key) for key, buf in parts.items()),
                )
                del parts
                assembled = build_scene(source, geometry, dst, models, owners)
                assembled["available"] = bool(
                    assembled.get("segments")
                    or assembled.get("triangles")
                    or assembled.get("arcs")
                )
        info = src.execute(
            "select f_data from t_global_info where f_name='_FileBaseInfo' limit 1"
        ).fetchone()
        unit = json.loads(info[0]).get("f_unit", "") if info else ""
        map_points = []
        for tree, node, tag, props in dst.execute(
            "select tree,node,tag,props from asset where props like '%大地坐标%'"
        ):
            attr = dict(json.loads(props))
            try:
                x, y = float(attr["大地坐标（X）"]), float(attr["大地坐标（Y）"])
            except (KeyError, ValueError, TypeError):
                continue
            if abs(x) < 1e9 and abs(y) < 1e9:
                map_points.append([tree, node, attr.get("井号") or tag, x, y])
        build_topology(src, dst)
        contacts = contact_evidence(dst, assembled, unit)
        relations = topology_summary(dst)
        relations["contactEvidence"] = contacts
        summary = {
            "scene": assembled,
            "topology": relations,
            "name": name,
            "objects": len(owners),
            "fields": len(definitions),
            "unit": unit,
            "types": dst.execute(
                "select kind,count(*) from asset group by kind order by count(*) desc"
            ).fetchall(),
            "sourceRows": src.execute(
                "select count(*) from t_plat_attr_node"
            ).fetchone()[0],
            "geometryObjects": dst.execute(
                "select count(*) from asset where geom is not null"
            ).fetchone()[0],
            "geometry": stats,
            "wells": map_points,
            **project,
        }
        prepare_catalog(dst, summary)
        dst.execute(
            "insert into meta values(?)", (json.dumps(summary, ensure_ascii=False),)
        )
        dst.commit()
        return summary
    finally:
        src.close()
        dst.close()


def metadata(db):
    return json.loads(db.execute("select value from meta").fetchone()[0])


def replace_catalog(new, target):
    # Windows can briefly hold a file open while another request is reading.
    for attempt in range(20):
        try:
            os.replace(new, target)
            return
        except PermissionError:
            if attempt == 19:
                raise
            time.sleep(0.05)


def prepare_catalog(db, info):
    """Build read-only derivatives before publishing the finished catalog."""
    build_lookup(db)
    info["sceneGzipBytes"] = 0
    if info.get("scene", {}).get("available"):
        row = db.execute(
            "select payload from ez_scene where length(payload)>=65536 limit 1"
        ).fetchone()
        if row:
            packed = gzip.compress(row[0], compresslevel=1, mtime=0)
            if len(packed) < len(row[0]):
                db.execute("create table ez_scene_gzip(payload blob not null)")
                db.execute("insert into ez_scene_gzip values(?)", (packed,))
                info["sceneGzipBytes"] = len(packed)
    info["catalogVersion"] = CATALOG_VERSION


def upgrade_catalog(target):
    """Publish new search/transport indexes without changing the model revision."""
    with FileLock(str(target.parent / "catalog.lock"), timeout=15):
        old = sqlite_input(target)
        try:
            info = metadata(old)
        finally:
            old.close()
        if info.get("catalogVersion", 0) >= CATALOG_VERSION:
            return
        with tempfile.TemporaryDirectory(dir=target.parent) as folder:
            new = Path(folder) / "reindexed.sqlite"
            shutil.copyfile(target, new)
            db = sqlite3.connect(new)
            try:
                if "scene" not in info:
                    info["topology"] = build_topology(None, db)
                    info["scene"] = {
                        "available": False,
                        "requiresSource": True,
                        "segments": 0,
                        "triangles": 0,
                    }
                prepare_catalog(db, info)
                db.execute(
                    "update meta set value=?", (json.dumps(info, ensure_ascii=False),)
                )
                db.commit()
            finally:
                db.close()
            replace_catalog(new, target)


def existing(ctx, revision=""):
    target = storage(ctx) / "catalog.sqlite"
    if not target.is_file():
        raise HTTPException(404, "尚未导入 eZWalker 工区")
    db = sqlite_input(target)
    try:
        info = metadata(db)
        if info.get("catalogVersion", 0) < CATALOG_VERSION:
            db.close()
            try:
                upgrade_catalog(target)
            except (OSError, sqlite3.Error, Timeout):
                # A version 2 catalog remains readable during lock/disk contention.
                if "scene" not in info:
                    raise
            db = sqlite_input(target)
            info = metadata(db)
        if revision and info.get("revision") != revision:
            raise HTTPException(409, "工区已更新，请重新打开工区总图")
        return db
    except Exception:
        db.close()
        raise


@router.get("/ezwalker")
def summary(ctx=Depends(get_scoped_ctx)):
    try:
        db = existing(ctx)
    except HTTPException as e:
        if e.status_code == 404:
            return None
        raise
    try:
        return metadata(db)
    finally:
        db.close()


def publish_catalog(new, root, expected_revision=""):
    # The archive is built in isolation. Only the final compare-and-swap holds
    # the scoped lock. A failed import leaves the last readable version intact.
    target = root / "catalog.sqlite"
    with FileLock(str(root / "catalog.lock"), timeout=15):
        if expected_revision:
            if not target.is_file():
                raise HTTPException(409, "原工区已移除，请重新选择工区")
            previous = sqlite_input(target)
            try:
                if metadata(previous).get("revision") != expected_revision:
                    raise HTTPException(409, "工区已由其他导入更新，请重新打开")
            finally:
                previous.close()
        replace_catalog(new, target)


@router.post("/ezwalker")
def import_project(
    files: list[UploadFile] = File(...),
    expected_revision: str = "",
    ctx=Depends(get_scoped_ctx),
):
    root = storage(ctx)
    try:
        with tempfile.TemporaryDirectory(dir=root) as tmp:
            work = Path(tmp)
            selected = {}
            names = {}
            for upload in files:
                name = PureWindowsPath(upload.filename or "").name
                ext = Path(name).suffix.lower()
                key = ext if ext in (".wlkx", ".wlp") else name.lower()
                limits = {
                    ".wlkx": 512,
                    ".wlp": 64,
                    "data.db": 256,
                    "model.package": 1024,
                }
                if key not in limits or key in selected:
                    raise ValueError("请选择一个模型，可附带同工区的 WLP")
                path = work / ("input" + ext if key.startswith(".") else key)
                with path.open("wb") as dest:
                    while chunk := upload.file.read(MIB):
                        if dest.tell() + len(chunk) > limits[key] * MIB:
                            raise ValueError("所选文件超过容量限制")
                        dest.write(chunk)
                selected[key] = path
                names[key] = name
            project = (
                wlp_info(selected[".wlp"])
                if ".wlp" in selected
                else {"references": [], "views": []}
            )
            if ".wlkx" in selected:
                if "data.db" in selected or "model.package" in selected:
                    raise ValueError("请选模型包或其解包文件中的一种")
                if project["references"] and names[".wlkx"].casefold() not in {
                    n.casefold() for n in project["references"]
                }:
                    raise ValueError("WLP 未引用所选的 WLKX")
                db, geometry = extract_model(selected[".wlkx"], work)
                name = names[".wlkx"]
            elif "data.db" in selected:
                db, geometry = selected["data.db"], selected.get("model.package")
                name = names["data.db"]
            elif ".wlp" in selected:
                return {"projectOnly": True, **project}
            else:
                raise ValueError("缺少模型包或 data.db")
            new = work / "converted.sqlite"
            result = build_catalog(db, geometry, new, name, project)
            result["revision"] = uuid.uuid4().hex
            with sqlite3.connect(new) as con:
                con.execute(
                    "update meta set value=?", (json.dumps(result, ensure_ascii=False),)
                )
            con.close()
            publish_catalog(new, root, expected_revision)
            return result
    except (
        ValueError,
        sqlite3.Error,
        OSError,
        subprocess.TimeoutExpired,
        Timeout,
        OverflowError,
        struct.error,
    ) as e:
        raise HTTPException(422, str(e)) from e


@router.get("/ezwalker/objects")
def objects(
    q: str = "",
    kind: str = "",
    page: int = 0,
    revision: str = "",
    ctx=Depends(get_scoped_ctx),
):
    db = existing(ctx, revision)
    try:
        indexed = metadata(db).get("catalogVersion", 0) >= CATALOG_VERSION
        source = "ez_asset_lookup" if indexed else "asset"
        cylinders = "cylinders" if indexed else "length(geom)/28"
        predicates, args = [], []
        if kind:
            predicates.append("kind=?")
            args.append(kind)
        if q:
            terms = "terms" if indexed else ASSET_TERMS
            predicates.append(f"instr({terms},lower(?))>0")
            args.append(q)
        where = " where " + " and ".join(predicates) if predicates else ""
        count = db.execute(f"select count(*) from {source}" + where, args).fetchone()[0]
        rows = db.execute(
            f"select tree,node,tag,name,kind,site,{cylinders} from {source}"
            + where
            + " order by tree,node limit 50 offset ?",
            (*args, max(0, min(page, 100000)) * 50),
        ).fetchall()
        return {"count": count, "rows": rows}
    finally:
        db.close()


@router.get("/ezwalker/object/{tree}/{node}")
def detail(tree: int, node: int, revision: str = "", ctx=Depends(get_scoped_ctx)):
    db = existing(ctx, revision)
    try:
        row = db.execute(
            "select props,geom from asset where tree=? and node=?", (tree, node)
        ).fetchone()
        if not row:
            raise HTTPException(404, "模型对象不存在")
        import base64

        return {
            "attributes": json.loads(row[0]),
            "related": related(db, tree, node),
            "cylinders": base64.b64encode(row[1] or b"").decode("ascii"),
        }
    finally:
        db.close()


def scene_encoding(header, compressed):
    weights = {}
    for item in header.lower().split(","):
        name, *options = item.strip().split(";")
        weight = 1.0
        for option in options:
            key, _, value = option.strip().partition("=")
            if key.strip() == "q":
                try:
                    weight = float(value)
                except ValueError:
                    weight = 0
        weights[name.strip()] = weight if 0 <= weight <= 1 else 0
    gzip_weight = weights.get("gzip", weights.get("*", 0)) if compressed else 0
    identity_weight = weights.get("identity", 0 if weights.get("*") == 0 else 1)
    if gzip_weight > 0 and (
        "identity" not in weights or gzip_weight >= identity_weight
    ):
        return "gzip"
    if identity_weight > 0:
        return "identity"
    raise HTTPException(406, "客户端未接受可用的装配数据编码")


@router.get("/ezwalker/scene")
def scene(request: Request, revision: str = "", ctx=Depends(get_scoped_ctx)):
    db = existing(ctx, revision)
    try:
        info = metadata(db)
        if not info.get("scene", {}).get("available"):
            raise HTTPException(404, "此索引没有全站装配图，需从原模型生成")
        encoding = scene_encoding(
            request.headers.get("accept-encoding", ""), info.get("sceneGzipBytes", 0)
        )
        headers = {
            "Cache-Control": "private, no-cache",
            "Vary": "Accept-Encoding",
            "X-Content-Type-Options": "nosniff",
        }
        if info.get("revision"):
            identity = [ctx.user_id, ctx.agent_id, info["revision"], encoding]
            token = hashlib.sha256(
                json.dumps(identity, ensure_ascii=False).encode()
            ).hexdigest()
            headers["ETag"] = f'W/"{token}"'
            tags = (
                s.strip().removeprefix("W/")
                for s in request.headers.get("if-none-match", "").split(",")
            )
            if any(tag in ("*", f'"{token}"') for tag in tags):
                return Response(status_code=304, headers=headers)
        if encoding == "gzip":
            headers["Content-Encoding"] = "gzip"
        table = "ez_scene_gzip" if encoding == "gzip" else "ez_scene"
        row = db.execute(f"select payload from {table} limit 1").fetchone()
        if not row:
            raise HTTPException(404, "此工区没有可显示的装配图元")
        return Response(row[0], media_type="application/octet-stream", headers=headers)
    finally:
        db.close()


@router.get("/ezwalker/topology")
def connections(
    q: str = "",
    kind: str = "",
    page: int = 0,
    tree: int | None = None,
    node: int | None = None,
    revision: str = "",
    ctx=Depends(get_scoped_ctx),
):
    db = existing(ctx, revision)
    try:
        if (tree is None) != (node is None):
            raise HTTPException(422, "定位工程对象需要模型树和节点号")
        if tree is not None:
            return related(db, tree, node, page=page, kind=kind, q=q)
        return topology(db, kind=kind, q=q, page=page)
    finally:
        db.close()
