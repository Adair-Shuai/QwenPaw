# -*- coding: utf-8 -*-
"""Rollback across directory, configuration and finalization boundaries."""
# pylint: disable=protected-access
import importlib

import pytest

restore = importlib.import_module("qwenpaw.backup._ops.restore")
mount_swap = importlib.import_module("qwenpaw.backup._utils._mount_swap")


@pytest.mark.parametrize("mount", [False, True])
@pytest.mark.parametrize("failure", ["first", "second", "config", "finalize"])
def test_restore_failure_rolls_back_every_target(
    tmp_path,
    monkeypatch,
    mount,
    failure,
):
    monkeypatch.setattr(restore, "WORKING_DIR", tmp_path)
    config = tmp_path / restore.CONFIG_FILE
    config.write_bytes(b'{"value":"original"}')
    staged_config = tmp_path / "config.staged"
    staged_config.write_bytes(b'{"value":"backup"}')
    targets = [tmp_path / name for name in ("existing", "new", "last")]
    for target in (targets[0], targets[2]):
        target.mkdir()
        (target / "value.txt").write_text("original", encoding="utf-8")
    for target in targets:
        staging = target.with_name(target.name + ".restore_tmp")
        staging.mkdir()
        (staging / "value.txt").write_text("backup", encoding="utf-8")
    if mount:
        monkeypatch.setattr(mount_swap, "is_mount_point", lambda _: True)
    original_commit = restore.commit_tmp

    def commit(target, **kwargs):
        if target == targets[0] and failure == "first":
            raise PermissionError("locked first directory")
        if target == targets[2] and failure == "second":
            raise PermissionError("locked later directory")
        original_commit(target, **kwargs)

    monkeypatch.setattr(restore, "commit_tmp", commit)
    if failure == "config":

        def commit_config(_):
            raise PermissionError("locked configuration")

        monkeypatch.setattr(
            restore,
            "_commit_staged_global_config",
            commit_config,
        )

    def finalize(*_):
        config.write_bytes(b'{"value":"partially finalized"}')
        if failure == "finalize":
            raise OSError("finalization failed")

    monkeypatch.setattr(restore, "_finalize_restored_agents", finalize)
    with pytest.raises(OSError):
        restore._commit_and_finalize(targets, staged_config, {}, [], "review")
    assert config.read_bytes() == b'{"value":"original"}'
    for target in (targets[0], targets[2]):
        assert (target / "value.txt").read_text(encoding="utf-8") == "original"
    assert not targets[1].exists()
    assert not staged_config.exists()
    assert not list(tmp_path.glob("*.restore_old"))
    assert not list(tmp_path.glob(".config-rollback-*"))


@pytest.mark.parametrize("mount", [False, True])
def test_successful_restore_releases_retained_backups(
    tmp_path,
    monkeypatch,
    mount,
):
    monkeypatch.setattr(restore, "WORKING_DIR", tmp_path)
    config = tmp_path / restore.CONFIG_FILE
    config.write_text("original", encoding="utf-8")
    staged = tmp_path / "config.staged"
    staged.write_text("backup", encoding="utf-8")
    target = tmp_path / "workspace"
    target.mkdir()
    (target / "old.txt").write_text("old", encoding="utf-8")
    staging = tmp_path / "workspace.restore_tmp"
    staging.mkdir()
    (staging / "new.txt").write_text("new", encoding="utf-8")
    if mount:
        monkeypatch.setattr(mount_swap, "is_mount_point", lambda _: True)
    monkeypatch.setattr(restore, "_finalize_restored_agents", lambda *_: None)
    restore._commit_and_finalize([target], staged, {}, [], "review")
    assert config.read_text(encoding="utf-8") == "backup"
    assert sorted(path.name for path in target.iterdir()) == ["new.txt"]
    assert not staging.exists()
    assert not list(tmp_path.glob("*.restore_old"))
    assert not list(tmp_path.glob(".config-rollback-*"))


@pytest.mark.parametrize("had_config", [False, True])
def test_finalization_failure_restores_config_and_secret_cache(
    tmp_path,
    monkeypatch,
    had_config,
):
    monkeypatch.setattr(restore, "WORKING_DIR", tmp_path)
    config = tmp_path / restore.CONFIG_FILE
    if had_config:
        config.write_bytes(b"original config")
    secret = tmp_path / "secrets"
    secret.mkdir()
    (secret / "key").write_text("original key", encoding="utf-8")
    staged = tmp_path / "secrets.restore_tmp"
    staged.mkdir()
    (staged / "key").write_text("backup key", encoding="utf-8")
    monkeypatch.setattr(restore, "SECRET_DIR", secret)
    cached_keys = []
    monkeypatch.setattr(
        restore,
        "reload_master_key_from_disk",
        lambda: cached_keys.append(
            (secret / "key").read_text(encoding="utf-8"),
        ),
    )

    def finalize(*_):
        config.write_bytes(b"updated config")
        raise OSError("failed after writing final config")

    monkeypatch.setattr(restore, "_finalize_restored_agents", finalize)
    with pytest.raises(OSError):
        restore._commit_and_finalize([secret], None, {}, [], "review")
    assert cached_keys == ["backup key", "original key"]
    if had_config:
        assert config.read_bytes() == b"original config"
    else:
        assert not config.exists()


@pytest.mark.parametrize("mount", [False, True])
def test_startup_retries_failed_rollback_without_deleting_originals(
    tmp_path,
    monkeypatch,
    mount,
):
    safe_swap = importlib.import_module("qwenpaw.backup._utils.safe_swap")
    target = tmp_path / "workspace"
    target.mkdir()
    (target / "original.txt").write_text("original", encoding="utf-8")
    staging = tmp_path / "workspace.restore_tmp"
    staging.mkdir()
    (staging / "backup.txt").write_text("backup", encoding="utf-8")
    if mount:
        monkeypatch.setattr(mount_swap, "is_mount_point", lambda _: True)
    safe_swap.commit_tmp(target, retain_old=True)
    with monkeypatch.context() as locked:

        def fail(*_args, **_kwargs):
            raise PermissionError("locked new contents")

        if mount:
            locked.setattr(mount_swap, "_remove_children", fail)
        else:
            locked.setattr(safe_swap.shutil, "rmtree", fail)
        with pytest.raises(PermissionError):
            safe_swap.finish_retained_swap(target, rollback=True)
        if mount:
            with pytest.raises(PermissionError):
                safe_swap.cleanup_stale_restore_artifacts(target)
        else:
            safe_swap.cleanup_stale_restore_artifacts(target)
        old = (
            target / mount_swap.OLD_CONTENT_DIR_NAME
            if mount
            else tmp_path / "workspace.restore_old"
        )
        assert (old / "original.txt").read_text(encoding="utf-8") == "original"
    safe_swap.cleanup_stale_restore_artifacts(target)
    assert sorted(path.name for path in target.iterdir()) == ["original.txt"]
    assert (target / "original.txt").read_text(encoding="utf-8") == "original"


def test_mount_rollback_retry_keeps_already_restored_old_files(
    tmp_path,
    monkeypatch,
):
    safe_swap = importlib.import_module("qwenpaw.backup._utils.safe_swap")
    target = tmp_path / "workspace"
    target.mkdir()
    for name in ("a.txt", "b.txt"):
        (target / name).write_text(name, encoding="utf-8")
    staging = tmp_path / "workspace.restore_tmp"
    staging.mkdir()
    (staging / "backup.txt").write_text("new", encoding="utf-8")
    monkeypatch.setattr(mount_swap, "is_mount_point", lambda _: True)
    safe_swap.commit_tmp(target, retain_old=True)
    original_move = mount_swap.shutil.move
    with monkeypatch.context() as locked:
        moved = []

        def move(source, destination):
            if mount_swap.OLD_CONTENT_DIR_NAME in str(source):
                if moved:
                    raise PermissionError("second old file locked")
                moved.append(source)
            return original_move(source, destination)

        locked.setattr(mount_swap.shutil, "move", move)
        with pytest.raises(PermissionError):
            safe_swap.finish_retained_swap(target, rollback=True)
        assert len(moved) == 1
    safe_swap.cleanup_stale_restore_artifacts(target)
    assert sorted(path.name for path in target.iterdir()) == ["a.txt", "b.txt"]
    for name in ("a.txt", "b.txt"):
        assert (target / name).read_text(encoding="utf-8") == name


@pytest.mark.parametrize("failure", ["decision", "cleanup"])
def test_mount_commit_decision_is_transactional(
    tmp_path,
    monkeypatch,
    failure,
):
    safe_swap = importlib.import_module("qwenpaw.backup._utils.safe_swap")
    monkeypatch.setattr(restore, "WORKING_DIR", tmp_path)
    monkeypatch.setattr(mount_swap, "is_mount_point", lambda _: True)
    monkeypatch.setattr(restore, "_finalize_restored_agents", lambda *_: None)
    config = tmp_path / restore.CONFIG_FILE
    config.write_bytes(b"original config")
    staged = tmp_path / "config.staged"
    staged.write_bytes(b"backup config")
    targets = [tmp_path / "a", tmp_path / "b"]
    for target in targets:
        target.mkdir()
        (target / "value").write_text("original", encoding="utf-8")
        staging = target.with_name(target.name + ".restore_tmp")
        staging.mkdir()
        (staging / "value").write_text("backup", encoding="utf-8")
    with monkeypatch.context() as fault:
        if failure == "decision":
            write_state = mount_swap._write_state

            def write(target, state):
                if (
                    target == targets[1]
                    and state == mount_swap.STATE_COMMITTED
                ):
                    raise PermissionError("commit marker locked")
                write_state(target, state)

            fault.setattr(mount_swap, "_write_state", write)
            with pytest.raises(PermissionError):
                restore._commit_and_finalize(targets, staged, {}, [], "review")
        else:

            def cleanup(*_):
                raise PermissionError("cleanup locked")

            fault.setattr(mount_swap, "_cleanup_artifacts", cleanup)
            restore._commit_and_finalize(targets, staged, {}, [], "review")
    for target in targets:
        safe_swap.cleanup_stale_restore_artifacts(target)
        assert (target / "value").read_text(encoding="utf-8") == (
            "original" if failure == "decision" else "backup"
        )
    assert config.read_bytes() == (
        b"original config" if failure == "decision" else b"backup config"
    )


def test_incomplete_rollback_preserves_old_data_and_recovers_other_targets(
    tmp_path,
    monkeypatch,
):
    safe_swap = importlib.import_module("qwenpaw.backup._utils.safe_swap")
    monkeypatch.setattr(restore, "WORKING_DIR", tmp_path)
    config = tmp_path / restore.CONFIG_FILE
    config.write_bytes(b"original")
    staged = tmp_path / "config.staged"
    staged.write_bytes(b"backup")
    targets = [tmp_path / "a", tmp_path / "b"]
    for target in targets:
        target.mkdir()
        (target / "value").write_text("original", encoding="utf-8")
        staging = target.with_name(target.name + ".restore_tmp")
        staging.mkdir()
        (staging / "value").write_text("backup", encoding="utf-8")

    def finalize(*_):
        raise OSError("finalization failed")

    monkeypatch.setattr(restore, "_finalize_restored_agents", finalize)
    remove = safe_swap.shutil.rmtree
    with monkeypatch.context() as locked:

        def rmtree(path, *args, **kwargs):
            if str(path) == str(targets[1]):
                raise PermissionError("locked during rollback")
            return remove(path, *args, **kwargs)

        locked.setattr(safe_swap.shutil, "rmtree", rmtree)
        with pytest.raises(RuntimeError, match="rollback was incomplete"):
            restore._commit_and_finalize(targets, staged, {}, [], "review")
    assert config.read_bytes() == b"original"
    assert (targets[0] / "value").read_text(encoding="utf-8") == "original"
    assert (tmp_path / "b.restore_old" / "value").read_text(
        encoding="utf-8",
    ) == "original"
    safe_swap.cleanup_stale_restore_artifacts(targets[1])
    assert (targets[1] / "value").read_text(encoding="utf-8") == "original"
