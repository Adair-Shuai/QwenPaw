# -*- coding: utf-8 -*-
"""Build and validate a native expert release before signing it.

python scripts/build_expert_release.py --source STAGED_PAYLOAD --spec recipe.json
    --output RELEASE_DIR
UGSCI_EXPERT_SIGNING_KEY is a base64 Ed25519 private key (never written).
The source must contain only redistributable payload and an offline wheelhouse.
"""

import argparse
import asyncio
import base64
import hashlib
import json
import os
from pathlib import Path
import tempfile
import zipfile

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from filelock import FileLock

from qwenpaw.expert_packages.audit import private_path, inspect_payload

from qwenpaw.components.update import (
    _is_link_like,
    _verify_signature,
    detect_target,
)
from qwenpaw.expert_packages.models import Release, relative_path
from qwenpaw.expert_packages.runtime import prepare_environment, verify
from qwenpaw.expert_packages.source import digest, extract


# Install, validate and sign in one isolated staging scope.
# pylint: disable-next=too-many-statements
async def build(
    source: Path,
    spec: dict,
    output: Path,
    private: Ed25519PrivateKey | None,
):
    source = source.resolve()
    output = output.resolve()
    if source == output or source in output.parents:
        raise ValueError("Output must be outside the package source")
    files = {}
    for path in source.rglob("*"):
        if _is_link_like(path):
            raise ValueError("Package cannot contain links")
        if path.is_file():
            name = relative_path(path.relative_to(source).as_posix())
            if private_path(name):
                raise ValueError(
                    f"Private or local-test data in package: {name}",
                )
            files[name] = digest(path)
    inspect_payload(source)
    output.mkdir(parents=True, exist_ok=True)
    # Build into a temporary directory. Failed validation publishes nothing.
    with tempfile.TemporaryDirectory(prefix="expert-release-") as temp:
        staging = Path(temp)
        archive = staging / "package.zip"
        with zipfile.ZipFile(
            archive,
            "w",
            compression=zipfile.ZIP_DEFLATED,
        ) as bundle:
            for name in sorted(files):
                info = zipfile.ZipInfo(name, date_time=(2020, 1, 1, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                bundle.writestr(
                    info,
                    (source / name).read_bytes(),
                    compresslevel=6,
                )
        archive_hash = digest(archive)
        artifact_name = f"{archive_hash}.zip"
        release = Release.model_validate(
            {
                **spec,
                "files": files,
                "artifact": {
                    "path": f"expert-packages/artifacts/{artifact_name}",
                    "sha256": archive_hash,
                    "size": archive.stat().st_size,
                },
            },
        )
        import sys

        if (
            release.target != detect_target()
            or release.python != f"3.{sys.version_info.minor}"
        ):
            raise ValueError(
                "Release must be built and verified on its target platform",
            )
        extracted = staging / "payload"
        extract(archive, extracted, release)
        environment = staging / "env"
        await prepare_environment(extracted, environment, release)
        workspace = staging / "probe"
        workspace.mkdir()
        receipt = await verify(extracted, environment, workspace, release)
        release.mcp.schemas = receipt["schemas"]
        raw = json.dumps(
            release.model_dump(),
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
        ).encode()
        signature = None
        if private is not None:
            signature = base64.b64encode(private.sign(raw)).decode()
            public = base64.b64encode(
                private.public_key().public_bytes_raw(),
            ).decode()
            _verify_signature(raw, signature, public)
        # Content-addressed release paths; a catalog points to this exact path.
        manifest_name = hashlib.sha256(raw).hexdigest() + ".json"
        artifacts = output / "expert-packages" / "artifacts"
        manifests = output / "expert-packages" / "manifests"
        artifacts.mkdir(parents=True, exist_ok=True)
        manifests.mkdir(parents=True, exist_ok=True)
        version_key = f"{release.id}/{release.version}/{release.target}-py{release.python}.json"
        record = output / "expert-packages" / "versions" / version_key
        with FileLock(str(output / ".expert-release.lock")):
            if record.exists() and record.read_bytes() != raw:
                raise ValueError(
                    "Expert version already exists with different content",
                )
            writes = [
                (record, raw),
                (artifacts / artifact_name, archive.read_bytes()),
                (manifests / manifest_name, raw),
            ]
            if signature is not None:
                writes.insert(
                    1,
                    (manifests / (manifest_name + ".sig"), signature.encode()),
                )
            for target, content in writes:
                if target.exists() and target.read_bytes() != content:
                    raise ValueError(
                        "Immutable release already exists with different content",
                    )
                target.parent.mkdir(parents=True, exist_ok=True)
                temporary = target.with_suffix(target.suffix + ".tmp")
                temporary.write_bytes(content)
                os.replace(temporary, target)
        return {
            "manifest_path": f"expert-packages/manifests/{manifest_name}",
            "verification": receipt,
        }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--spec", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument(
        "--unsigned",
        action="store_true",
        help="Build on a runner without signing credentials; seal separately",
    )
    args = parser.parse_args()
    private = None
    if not args.unsigned:
        from qwenpaw.distribution import COMPONENT_PUBLIC_KEY

        private = Ed25519PrivateKey.from_private_bytes(
            base64.b64decode(
                os.environ.pop("UGSCI_EXPERT_SIGNING_KEY"),
                validate=True,
            ),
        )
        expected = os.environ.get(
            "UGSCI_EXPERT_PUBLIC_KEY",
            COMPONENT_PUBLIC_KEY,
        )
        actual = base64.b64encode(
            private.public_key().public_bytes_raw(),
        ).decode()
        if actual != expected:
            raise ValueError(
                "Signing key does not match the configured channel",
            )
    result = asyncio.run(
        build(
            args.source,
            json.loads(args.spec.read_text(encoding="utf-8")),
            args.output,
            private,
        ),
    )
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
