# -*- coding: utf-8 -*-
# flake8: noqa
# pylint: skip-file
"""One-shot: append P1 regression guards to component tests."""
from pathlib import Path

# ---- P1-1a: stale download lease reclaim -> test_component_client.py ----
pc = Path("tests/unit/tauri/test_component_client.py")
tc = pc.read_text(encoding="utf-8")
assert "test_stale_download_lease_is_reclaimed" not in tc

guard_client = '''

def _p1_client(tmp_path, handler):
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components=set(),
        target="windows-x86_64",
        core_version="1.0.0",
    )
    return ComponentClient(
        updater,
        tmp_path / "cache",
        client=httpx.Client(transport=httpx.MockTransport(handler)),
    )


def test_stale_download_lease_is_reclaimed(tmp_path):
    """P1-1a: a crash-remnant lease older than the TTL must not block a day."""
    artifact = b"data"
    calls = 0

    def handler(_request):
        nonlocal calls
        calls += 1
        return httpx.Response(
            200, content=artifact,
            headers={"Content-Length": str(len(artifact))},
        )

    downloader = _p1_client(tmp_path, handler)
    digest = hashlib.sha256(artifact).hexdigest()
    lease = (
        downloader.cache_root / "artifacts" / digest / ".download.lock"
    )
    lease.mkdir(parents=True)
    # Age the lease well past the staleness TTL (simulated crash remnant).
    old = time.time() - 3600
    os.utime(lease, (old, old))

    path = downloader.download_artifact(
        "https://oss.example/artifact.zip",
        sha256=digest,
        size=len(artifact),
        name="artifact.zip",
    )
    assert path.read_bytes() == artifact
    assert calls == 1
    downloader.close()


def test_fresh_download_lease_still_blocks(tmp_path):
    """P1-1a guard rail: a live (fresh) lease must still fail fast."""
    artifact = b"data"
    updater = ComponentUpdater(
        public_key_b64="",
        managed_components=set(),
        target="windows-x86_64",
        core_version="1.0.0",
    )
    downloader = ComponentClient(
        updater,
        tmp_path / "cache",
        client=httpx.Client(
            transport=httpx.MockTransport(
                lambda _r: httpx.Response(200, content=artifact),
            ),
        ),
    )
    digest = hashlib.sha256(artifact).hexdigest()
    lease = downloader.cache_root / "artifacts" / digest / ".download.lock"
    lease.mkdir(parents=True)  # fresh mtime => live download
    with pytest.raises(ComponentUpdateError, match="already in progress"):
        downloader.download_artifact(
            "https://oss.example/artifact.zip",
            sha256=digest,
            size=len(artifact),
            name="artifact.zip",
        )
    downloader.close()
'''

pc.write_text(
    tc.rstrip("\n") + "\n" + guard_client,
    encoding="utf-8",
    newline="\n",
)
print("client guards appended")

# ---- P1-2/3/4 guards -> test_component_updater.py ----
pu = Path("tests/unit/tauri/test_component_updater.py")
tu = pu.read_text(encoding="utf-8")
assert "test_directory_recovery_completes_applied_candidate" not in tu

guard_updater = '''

def _p1_dir_updater(tmp_path, component="backend", active_path=None):
    private, public = _p0_keypair()
    return private, ComponentUpdater(
        public_key_b64=public,
        managed_components={component},
        directory_components={component},
        target="windows-x86_64",
        core_version="1.0.0",
        active_path=active_path,
    )


def test_directory_recovery_completes_applied_candidate(tmp_path):
    """P1-2: crash after apply but before finalize -> complete it (drop marker)."""
    _, updater = _p1_dir_updater(tmp_path)
    destination = tmp_path / "managed" / "backend" / "2.0.0"
    destination.mkdir(parents=True)
    payload = b"runtime"
    (destination / "runtime.dat").write_bytes(payload)
    expected = {
        "runtime.dat": {
            "size": len(payload),
            "sha256": hashlib.sha256(payload).hexdigest(),
        },
    }
    previous = destination.parent / f".{destination.name}.previous"
    previous.mkdir()
    (previous / "old.dat").write_bytes(b"old")
    marker = destination.parent / f".{destination.name}.activation.json"
    marker.write_text(
        '{"schema_version": 1, "component": "backend", "version": "2.0.0"}',
        encoding="utf-8",
    )

    updater.recover_interrupted_directory_activation(
        "backend",
        destination,
        expected_files=expected,
        expected_version="2.0.0",
    )
    # Complete candidate: marker + previous cleared, candidate kept.
    assert not marker.exists()
    assert not previous.exists()
    assert (destination / "runtime.dat").is_file()


def test_directory_recovery_discards_partial_candidate(tmp_path):
    """P1-2: crash mid-apply -> discard the partial candidate for a retry."""
    _, updater = _p1_dir_updater(tmp_path)
    destination = tmp_path / "managed" / "backend" / "2.0.0"
    destination.mkdir(parents=True)
    (destination / "runtime.dat").write_bytes(b"corrupt")
    expected = {
        "runtime.dat": {
            "size": 7,
            "sha256": hashlib.sha256(b"runtime").hexdigest(),
        },
    }
    marker = destination.parent / f".{destination.name}.activation.json"
    marker.write_text(
        '{"schema_version": 1, "component": "backend", "version": "2.0.0"}',
        encoding="utf-8",
    )

    updater.recover_interrupted_directory_activation(
        "backend",
        destination,
        expected_files=expected,
        expected_version="2.0.0",
    )
    # Partial candidate discarded so the version can be re-applied fresh.
    assert not destination.exists()
    assert not marker.exists()


def test_directory_recovery_clears_orphan_previous(tmp_path):
    """P1-2: crash during the swap leaves a stale previous with no marker."""
    _, updater = _p1_dir_updater(tmp_path)
    destination = tmp_path / "managed" / "backend" / "2.0.0"
    # No destination, no marker: candidate never activated.
    previous = destination.parent / f".{destination.name}.previous"
    previous.mkdir(parents=True)
    (previous / "old.dat").write_bytes(b"old")

    updater.recover_interrupted_directory_activation("backend", destination)
    assert not previous.exists()


def test_gc_removes_superseded_versions_keeps_active_and_latest(tmp_path):
    """P1-3: old managed versions are reclaimed; active + latest kept."""
    _, updater = _p1_dir_updater(tmp_path)
    root = tmp_path / "managed" / "backend"
    for version in ("1.0.0", "1.1.0", "1.2.0", "2.0.0"):
        d = root / version
        d.mkdir(parents=True)
        (d / "runtime.dat").write_bytes(version.encode())
    active = tmp_path / "state" / "active.json"
    active.parent.mkdir()
    active.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "target": "windows-x86_64",
                "components": {
                    "backend": {
                        "version": "2.0.0",
                        "path": str(root / "2.0.0"),
                    },
                },
            },
        ),
        encoding="utf-8",
    )
    updater_with_active = ComponentUpdater(
        public_key_b64=updater.public_key_b64,
        managed_components={"backend"},
        directory_components={"backend"},
        target="windows-x86_64",
        core_version="1.0.0",
        active_path=active,
    )
    # keep = just-committed 2.0.0; retain=1 keeps newest other (1.2.0);
    # active (2.0.0) always kept. 1.0.0 and 1.1.0 should be reclaimed.
    updater_with_active._gc_managed_versions("backend", keep=root / "2.0.0")
    remaining = {p.name for p in root.iterdir() if p.is_dir()}
    assert "2.0.0" in remaining  # active/keep never removed
    assert "1.2.0" in remaining  # newest retained
    assert "1.0.0" not in remaining
    assert "1.1.0" not in remaining


def test_gc_never_removes_active_version(tmp_path):
    """P1-3 guard rail: the active version is never reclaimed."""
    root = tmp_path / "managed" / "backend"
    for version in ("1.0.0", "2.0.0", "3.0.0"):
        (root / version).mkdir(parents=True)
    active = tmp_path / "state" / "active.json"
    active.parent.mkdir()
    # Active is an OLDER version (1.0.0) than the keep tree (3.0.0).
    active.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "target": "windows-x86_64",
                "components": {
                    "backend": {
                        "version": "1.0.0",
                        "path": str(root / "1.0.0"),
                    },
                },
            },
        ),
        encoding="utf-8",
    )
    _, updater = _p1_dir_updater(tmp_path, active_path=active)
    updater._gc_managed_versions("backend", keep=root / "3.0.0")
    remaining = {p.name for p in root.iterdir() if p.is_dir()}
    assert "1.0.0" in remaining  # active is sacred even when older
    assert "3.0.0" in remaining  # keep tree


def test_remove_readonly_clears_readonly_bit(tmp_path):
    """P1-4: the rmtree onerror handler removes read-only files."""
    target = tmp_path / "tree" / "file.dat"
    target.parent.mkdir(parents=True)
    target.write_bytes(b"x")
    target.chmod(0o444)  # read-only
    shutil.rmtree(target.parent, onerror=component_update._remove_readonly)
    assert not target.parent.exists()
'''

pu.write_text(
    tu.rstrip("\n") + "\n" + guard_updater,
    encoding="utf-8",
    newline="\n",
)
print("updater guards appended")
