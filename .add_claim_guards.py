# -*- coding: utf-8 -*-
# flake8: noqa
# pylint: skip-file
"""One-shot: append guards for the three verified claims."""
from pathlib import Path

# ---- Claim 1 guards -> test_component_client.py ----
pc = Path("tests/unit/tauri/test_component_client.py")
tc = pc.read_text(encoding="utf-8")
assert "test_long_download_lease_with_fresh_part_is_not_reclaimed" not in tc

guard_client = '''

def test_long_download_lease_with_fresh_part_is_not_reclaimed(tmp_path):
    """Claim 1: a >TTL download with an actively written .part stays live."""
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
    root = downloader.cache_root / "artifacts" / digest
    lease = root / ".download.lock"
    part = root / "artifact.zip.part"
    lease.mkdir(parents=True)
    # Lease dir looks ancient (long download started 2h ago)...
    old = time.time() - 7200
    os.utime(lease, (old, old))
    # ...but the payload is being written right now => still live.
    part.write_bytes(b"partial")

    with pytest.raises(ComponentUpdateError, match="already in progress"):
        downloader.download_artifact(
            "https://oss.example/artifact.zip",
            sha256=digest,
            size=len(artifact),
            name="artifact.zip",
        )
    downloader.close()


def test_old_owner_cannot_delete_reclaimed_lease(tmp_path):
    """Claim 1: releasing with a stale token must not remove the new lease."""
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
                lambda _r: httpx.Response(200, content=b"data"),
            ),
        ),
    )
    root = downloader.cache_root / "artifacts" / "abc"
    lease = root / ".download.lock"
    part = root / "a.zip.part"
    # Process A acquires.
    token_a = downloader._acquire_download_lease(lease, part)
    # Force staleness (lease + part both ancient).
    old = time.time() - 7200
    os.utime(lease, (old, old))
    # Process B reclaims and acquires.
    token_b = downloader._acquire_download_lease(lease, part)
    assert token_b != token_a
    # A finally finishes and tries to release; must NOT delete B's lease.
    downloader._release_download_lease(lease, token_a)
    assert lease.is_dir(), "old owner must not remove the reclaimed lease"
    # B releases normally.
    downloader._release_download_lease(lease, token_b)
    assert not lease.exists()
    downloader.close()
'''

pc.write_text(
    tc.rstrip("\n") + "\n" + guard_client,
    encoding="utf-8",
    newline="\n",
)
print("client guards ok")

# ---- Claim 2 guards -> test_component_service.py ----
ps = Path("tests/unit/tauri/test_component_service.py")
ts = ps.read_text(encoding="utf-8")
assert "test_install_uses_cross_process_component_lock" not in ts

guard_service = '''

def test_install_uses_cross_process_component_lock() -> None:
    """Claim 2: installs must hold a cross-process per-component lock."""
    import inspect

    import qwenpaw.components.service as svc

    source = inspect.getsource(svc.ComponentUpdateService._install_from_manifest)
    assert "plugin_install_lock" in source, (
        "_install_from_manifest must take the cross-process component lock; "
        "threading.RLock alone cannot stop two backend processes racing "
        "_atomic_activate"
    )
    assert "_component_install_lock_path" in source
    assert hasattr(svc, "_component_install_lock_path")


def test_delta_lease_contention_does_not_fall_back_to_full() -> None:
    """Claim 2: delta lease contention must propagate, not trigger full."""
    import inspect

    import qwenpaw.components.service as svc

    source = inspect.getsource(svc.ComponentUpdateService._install_component)
    marker = '"already in progress" in str(exc)'
    fallback = source.find("falling back to full")
    contention = source.find(marker)
    assert contention != -1, (
        "delta contention must be detected and re-raised before the full "
        "fallback; otherwise two processes race activation via different "
        "artifact leases"
    )
    assert contention < fallback
'''

ps.write_text(
    ts.rstrip("\n") + "\n" + guard_service,
    encoding="utf-8",
    newline="\n",
)
print("service guards ok")

# ---- Claim 3 guard -> test_release_workflow_safety.py ----
pw = Path("tests/unit/verify/test_release_workflow_safety.py")
tw = pw.read_text(encoding="utf-8")
assert "test_pointer_post_check_is_polarity_aware" not in tw

guard_wf = '''

def test_pointer_post_check_is_polarity_aware() -> None:
    """Claim 3: post-promotion readback must not false-alarm on newer wins.

    A concurrent NEWER run legitimately winning the race must be accepted
    (warning), only an OLDER run clobbering our pointer is an error. The
    check therefore runs check_component_pointer_promotion with roles
    swapped (local=live, remote=ours) as the acceptance test.
    """
    release = _workflow("component-release.yml")
    assert 'cmp -s "$pointer" "$verify_file"' in release
    assert '--local "$verify_file" --remote "$pointer"' in release, (
        "post-promotion readback must accept a strictly-newer live pointer "
        "via the role-swapped monotonic check instead of cmp-only equality"
    )
    assert "newer concurrent promotion superseded" in release
'''

pw.write_text(
    tw.rstrip("\n") + "\n" + guard_wf,
    encoding="utf-8",
    newline="\n",
)
print("workflow guard ok")
