# -*- coding: utf-8 -*-
# pylint: disable=protected-access
# pylint: disable=redefined-outer-name
"""Real publication validation/routes with an isolated in-memory OSS \
boundary."""

import base64
import hashlib
import io
import json
import zipfile
from types import SimpleNamespace

import httpx
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from qwenpaw import publisher_service as service
from qwenpaw.app.routers import publisher


class StorageError(Exception):
    def __init__(self, status):
        self.status = status


class Bucket:
    def __init__(self):
        self.objects = {}
        self.headers = {}
        self.corrupt = ""

    def get_object(self, key):
        if key not in self.objects:
            raise StorageError(404)
        return io.BytesIO(
            self.objects[key]
            + (
                b"corrupt"
                if self.corrupt and key.endswith(self.corrupt)
                else b""
            ),
        )

    def put_object(self, key, data, headers):
        if (
            headers.get("x-oss-forbid-overwrite") == "true"
            and key in self.objects
        ):
            raise StorageError(409)
        self.objects[key] = data
        self.headers[key] = headers

    def delete_object(self, key):
        del self.objects[key]

    def put_object_acl(self, key, acl):
        self.headers[key]["x-oss-object-acl"] = acl

    def get_object_acl(self, key):
        return SimpleNamespace(acl=self.headers[key]["x-oss-object-acl"])


@pytest.fixture(name="setup")
def _setup_fixture(monkeypatch):
    bucket = Bucket()
    bucket.objects["metadata/index.json"] = service._json(
        {
            "products": {
                "plugins": {"index_url": "/metadata/plugins/index.json"},
            },
        },
    )
    monkeypatch.setattr(service, "_bucket", lambda kind: bucket)
    monkeypatch.setenv(
        "UGSCI_PUBLISH_IDENTITIES",
        json.dumps(
            [
                {
                    "namespace": name,
                    "role": "admin" if name == "admin" else "contributor",
                    "token_sha256": hashlib.sha256(
                        (name + "-token").encode(),
                    ).hexdigest(),
                }
                for name in ("alice", "bob", "admin")
            ],
        ),
    )
    return TestClient(service.app), bucket


def headers(name="alice"):
    return {"Authorization": "Bearer " + name + "-token"}


def app_payload(
    version="1.0.0",
    asset_id="alice-app",
    content="VALUE=1",
    extra=None,
):
    output = io.BytesIO()
    with zipfile.ZipFile(output, "w") as archive:
        archive.writestr(
            asset_id + "/plugin.json",
            json.dumps(
                {
                    "id": asset_id,
                    "name": "Public test",
                    "version": version,
                    "type": "app",
                    "entry": {"backend": "main.py"},
                },
            ),
        )
        archive.writestr(asset_id + "/main.py", content)
        if extra:
            archive.writestr(asset_id + "/" + extra, "private fixture")
    data = output.getvalue()
    return {
        "asset_kind": "app",
        "archive_base64": base64.b64encode(data).decode(),
        "sha256": hashlib.sha256(data).hexdigest(),
    }


def expert_payload(version="1.0.0"):
    return {
        "asset_kind": "expert",
        "expert": {
            "id": "alice-expert",
            "name": "公开专家",
            "version": version,
            "system_prompt": "只使用公开合成资料",
            "description": "test",
            "recommended_skills": ["public-skill"],
            "tags": ["科研"],
        },
    }


def test_contributor_upload_approve_and_update_preserve_catalog(setup):
    client, bucket = setup
    legacy = {
        "id": "old",
        "plugin_id": "old",
        "version": "1.0.0",
        "sha256": "existing",
    }
    bucket.objects["metadata/plugins/index.json"] = service._json(
        {"files": {"old": legacy}, "platforms": {}},
    )
    payload = app_payload()
    checked = client.post(
        "/v1/submissions/inspect",
        json=payload,
        headers=headers(),
    )
    assert checked.status_code == 200 and checked.json()["status"] == "checked"
    assert not any(
        key.startswith("publisher-private/submissions")
        for key in bucket.objects
    )
    submitted = client.post("/v1/submissions", json=payload, headers=headers())
    assert (
        submitted.status_code == 200
        and submitted.json()["status"] == "submitted"
    )
    assert (
        bucket.headers[submitted.json()["object_key"]]["x-oss-object-acl"]
        == "private"
    )
    assert json.loads(bucket.objects["metadata/plugins/index.json"])[
        "files"
    ] == {"old": legacy}
    assert (
        client.post(
            "/v1/approve/alice/app/alice-app/1.0.0",
            headers=headers(),
        ).status_code
        == 403
    )
    approved = client.post(
        "/v1/approve/alice/app/alice-app/1.0.0",
        headers=headers("admin"),
    )
    assert approved.status_code == 200 and approved.json()["verified"] is True
    assert (
        bucket.headers[approved.json()["object_key"]]["x-oss-object-acl"]
        == "public-read"
    )
    assert (
        client.post(
            "/v1/submissions",
            json=payload,
            headers=headers(),
        ).status_code
        == 200
    )
    changed = client.post(
        "/v1/submissions",
        json=app_payload(content="VALUE=2"),
        headers=headers(),
    )
    assert changed.status_code == 409
    assert (
        client.post(
            "/v1/submissions",
            json=app_payload("1.1.0", content="VALUE=2"),
            headers=headers(),
        ).status_code
        == 200
    )
    assert (
        client.post(
            "/v1/approve/alice/app/alice-app/1.1.0",
            headers=headers("admin"),
        ).status_code
        == 200
    )
    catalog = json.loads(bucket.objects["metadata/plugins/index.json"])
    assert len(catalog["files"]) == 3 and catalog["files"]["old"] == legacy
    entry = next(
        row
        for row in catalog["files"].values()
        if row.get("version") == "1.1.0"
    )
    assert entry["platform"] == "apps" and entry["url"].startswith(
        "/files/plugins/apps/alice-app/",
    )
    assert entry["id"] in catalog["platforms"]["apps"]["versions"]


def test_expert_publication_matches_market_import_contract(setup):
    client, bucket = setup
    payload = expert_payload()
    posted = client.post("/v1/submissions", json=payload, headers=headers())
    assert posted.status_code == 200
    approved = client.post(
        "/v1/approve/alice/expert/alice-expert/1.0.0",
        headers=headers("admin"),
    )
    assert approved.status_code == 200
    manifest = json.loads(bucket.objects["agents/manifest.json"])
    entry = manifest["agents"][0]
    assert (
        bucket.objects[entry["instructions"]].decode()
        == payload["expert"]["system_prompt"]
    )
    assert json.loads(bucket.objects[entry["skills_manifest"]]) == [
        "public-skill",
    ]
    assert entry["publisher_namespace"] == "alice"
    assert (
        client.post(
            "/v1/approve/alice/expert/alice-expert/1.0.0",
            headers=headers("admin"),
        ).status_code
        == 200
    )


def test_publication_auth_namespace_version_and_privacy_guards(setup):
    client, bucket = setup
    assert (
        client.get("/v1/identity", headers=headers()).json()["id_prefix"]
        == "alice-"
    )
    assert (
        client.post("/v1/submissions", json=app_payload()).status_code == 401
    )
    assert (
        client.post(
            "/v1/submissions",
            json=app_payload(),
            headers=headers("bob"),
        ).status_code
        == 403
    )
    assert (
        client.post(
            "/v1/releases",
            json=app_payload(),
            headers=headers(),
        ).status_code
        == 403
    )
    assert (
        client.post(
            "/v1/submissions",
            json=app_payload("not-a-version"),
            headers=headers(),
        ).status_code
        == 400
    )
    for path in (
        ".env",
        "visualization/data/project.json",
        "data/project.json",
        "sessions/private.json",
        "id.key",
    ):
        assert (
            client.post(
                "/v1/submissions",
                json=app_payload(extra=path),
                headers=headers(),
            ).status_code
            == 400
        )
    for field in (
        "memory_seeds",
        "knowledge_files",
        "model_config",
        "mcp_clients",
    ):
        payload = expert_payload()
        payload["expert"][field] = []
        assert (
            client.post(
                "/v1/submissions",
                json=payload,
                headers=headers(),
            ).status_code
            == 400
        )
    assert (
        client.post(
            "/v1/submissions",
            json=app_payload("2.0.0"),
            headers=headers(),
        ).status_code
        == 200
    )
    assert (
        client.post(
            "/v1/submissions",
            json=app_payload("1.0.0"),
            headers=headers(),
        ).status_code
        == 409
    )
    assert not any(key.startswith("files/") for key in bucket.objects)


def test_lock_and_failed_readback_never_report_success(setup):
    client, bucket = setup
    bucket.objects[service._LOCK_KEY] = b"other-writer"
    assert (
        client.post(
            "/v1/submissions",
            json=app_payload(),
            headers=headers(),
        ).status_code
        == 409
    )
    assert bucket.objects[service._LOCK_KEY] == b"other-writer"
    del bucket.objects[service._LOCK_KEY]
    bucket.corrupt = ".zip"
    response = client.post(
        "/v1/submissions",
        json=app_payload(),
        headers=headers(),
    )
    assert response.status_code == 502
    assert not any(key.endswith("1.0.0.json") for key in bucket.objects)
    assert service._LOCK_KEY not in bucket.objects


def test_admin_can_update_legacy_official_asset_without_namespace(setup):
    client, bucket = setup
    bucket.objects["metadata/plugins/index.json"] = service._json(
        {
            "files": {
                "legacy": {
                    "plugin_id": "official",
                    "version": "1.0.0",
                    "sha256": "old",
                },
            },
            "platforms": {},
        },
    )
    result = client.post(
        "/v1/releases",
        json=app_payload("2.0.0", "official"),
        headers=headers("admin"),
    )
    assert result.status_code == 200 and result.json()["status"] == "published"
    assert result.json()["verified"] is True


def test_local_runtime_forwards_temporary_token_and_checks_receipt(
    setup,
    monkeypatch,
    tmp_path,
):
    _, bucket = setup
    original_client = httpx.AsyncClient
    monkeypatch.setattr(
        publisher.httpx,
        "AsyncClient",
        lambda **kwargs: original_client(
            transport=httpx.ASGITransport(app=service.app),
            **kwargs,
        ),
    )
    monkeypatch.setenv(
        "UGSCI_SUBMISSION_ENDPOINT",
        "https://publisher.test/v1/submissions",
    )
    monkeypatch.setattr(publisher, "_PUBLISH_ROOT", tmp_path)
    local = FastAPI()
    local.include_router(publisher.router, prefix="/api")
    client = TestClient(local)
    response = client.post(
        "/api/publisher/expert/inspect",
        json={"expert": expert_payload()["expert"]},
        headers={"X-UGSci-Publisher-Token": "alice-token"},
    )
    assert (
        response.status_code == 200 and response.json()["status"] == "checked"
    )
    response = client.post(
        "/api/publisher/expert/publish",
        json={"expert": expert_payload()["expert"]},
        headers={"X-UGSci-Publisher-Token": "alice-token"},
    )
    assert (
        response.status_code == 200
        and response.json()["status"] == "submitted"
    )
    package = app_payload()
    response = client.post(
        "/api/publisher/upload",
        content=base64.b64decode(package["archive_base64"]),
        headers={
            "X-UGSci-Asset-Kind": "app",
            "X-UGSci-Publisher-Token": "alice-token",
        },
    )
    assert response.status_code == 200 and response.json()["remote"][
        "receipt_id"
    ].startswith("alice/app/")
    assert all(b"alice-token" not in data for data in bucket.objects.values())
    assert all(
        "alice-token" not in path.read_text(errors="ignore")
        for path in tmp_path.rglob("*.json")
    )


def test_installed_packaging_excludes_private_data_without_manifest_rules(
    tmp_path,
):
    root = tmp_path / "app"
    root.mkdir()
    (root / "plugin.json").write_text(
        json.dumps({"id": "alice-app", "version": "1.0.0"}),
    )
    (root / ".env").write_text("SECRET=fixture")
    (root / "data").mkdir()
    (root / "data" / "private.json").write_text("fixture")
    data, _ = publisher._package_directory(root)
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        assert archive.namelist() == ["alice-app/plugin.json"]


def test_unverified_remote_response_cannot_be_reported_as_published(
    monkeypatch,
    tmp_path,
):
    original_client = httpx.AsyncClient

    def respond(request):
        assert request.headers["Authorization"] == "Bearer transient"
        return httpx.Response(200, json={"message": "ok"})

    monkeypatch.setattr(
        publisher.httpx,
        "AsyncClient",
        lambda **kwargs: original_client(
            transport=httpx.MockTransport(respond),
            **kwargs,
        ),
    )
    monkeypatch.setenv(
        "UGSCI_PUBLISH_ENDPOINT",
        "https://publisher.test/v1/releases",
    )
    monkeypatch.setattr(publisher, "_PUBLISH_ROOT", tmp_path)
    local = FastAPI()
    local.include_router(publisher.router)
    response = TestClient(local).post(
        "/publisher/upload",
        content=base64.b64decode(app_payload()["archive_base64"]),
        headers={
            "X-UGSci-Asset-Kind": "app",
            "X-UGSci-Publish-Mode": "release",
            "X-UGSci-Publisher-Token": "transient",
        },
    )
    assert response.status_code == 400
    assert "未确认" in response.json()["detail"]


def test_release_without_endpoint_is_not_a_successful_local_fallback(
    monkeypatch,
    tmp_path,
):
    monkeypatch.delenv("UGSCI_PUBLISH_ENDPOINT", raising=False)
    monkeypatch.setattr(publisher, "_PUBLISH_ROOT", tmp_path)
    local = FastAPI()
    local.include_router(publisher.router)
    response = TestClient(local).post(
        "/publisher/upload",
        content=base64.b64decode(app_payload()["archive_base64"]),
        headers={
            "X-UGSci-Asset-Kind": "app",
            "X-UGSci-Publish-Mode": "release",
        },
    )
    assert response.status_code == 400
    assert not list(tmp_path.rglob("*.zip"))


def test_app_and_expert_publications_use_their_market_buckets(
    setup,
    monkeypatch,
):
    client, apps = setup
    experts = Bucket()
    monkeypatch.setattr(
        service,
        "_bucket",
        lambda kind: experts if kind == "expert" else apps,
    )
    assert (
        client.post(
            "/v1/submissions",
            json=app_payload(),
            headers=headers(),
        ).status_code
        == 200
    )
    assert (
        client.post(
            "/v1/submissions",
            json=expert_payload(),
            headers=headers(),
        ).status_code
        == 200
    )
    assert (
        client.post(
            "/v1/approve/alice/app/alice-app/1.0.0",
            headers=headers("admin"),
        ).status_code
        == 200
    )
    assert (
        client.post(
            "/v1/approve/alice/expert/alice-expert/1.0.0",
            headers=headers("admin"),
        ).status_code
        == 200
    )
    assert (
        "metadata/plugins/index.json" in apps.objects
        and "agents/manifest.json" not in apps.objects
    )
    assert (
        "agents/manifest.json" in experts.objects
        and "metadata/plugins/index.json" not in experts.objects
    )


def test_missing_market_main_index_blocks_upload(setup):
    client, bucket = setup
    del bucket.objects["metadata/index.json"]
    response = client.post(
        "/v1/submissions",
        json=app_payload(),
        headers=headers(),
    )
    assert response.status_code == 503
    assert not any(
        key.startswith("publisher-private/submissions/")
        for key in bucket.objects
    )


def test_publication_preserves_legacy_host_version_constraints(setup):
    from qwenpaw.plugins.download_catalog import _is_entry_compatible

    client, bucket = setup
    data = io.BytesIO()
    with zipfile.ZipFile(data, "w") as archive:
        archive.writestr(
            "alice-app/plugin.json",
            json.dumps(
                {
                    "id": "alice-app",
                    "name": "app",
                    "version": "1.0.0",
                    "type": "app",
                    "min_version": "999.0.0",
                },
            ),
        )
    payload = {
        "asset_kind": "app",
        "archive_base64": base64.b64encode(data.getvalue()).decode(),
    }
    result = client.post(
        "/v1/releases",
        json=payload,
        headers=headers("admin"),
    )
    assert result.status_code == 200
    entry = next(
        iter(
            json.loads(bucket.objects["metadata/plugins/index.json"])[
                "files"
            ].values(),
        ),
    )
    assert entry["qwenpaw_version"] == {"min": "999.0.0"}
    assert not _is_entry_compatible(entry)


def test_generic_publisher_cannot_bypass_protected_document_template_gate(
    setup,
):
    client, bucket = setup
    response = client.post(
        "/v1/releases",
        json=app_payload(
            "99.0.0",
            "document-forms",
            extra="templates/private-project.docx",
        ),
        headers=headers("admin"),
    )
    assert response.status_code == 400
    assert "专用发布流程" in response.json()["detail"]
    assert not any(key.startswith("files/") for key in bucket.objects)


def test_retried_publication_repairs_private_object_acl_before_success(setup):
    client, bucket = setup
    payload = app_payload()
    public_key = "files/plugins/apps/alice-app/alice-app-1.0.0.zip"
    bucket.put_object(
        public_key,
        base64.b64decode(payload["archive_base64"]),
        {"x-oss-object-acl": "private"},
    )
    response = client.post(
        "/v1/releases",
        json=payload,
        headers=headers("admin"),
    )
    assert response.status_code == 200 and response.json()["verified"] is True
    assert bucket.get_object_acl(public_key).acl == "public-read"
