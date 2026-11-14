#!/usr/bin/env bash

# Download desktop artifacts from the current workflow run. Each failed or
# corrupt attempt is removed before retrying so a partial file cannot leak into
# a later publish step.
#
# Artifacts are resolved by *id*, never by bare name. A release run that is
# cancelled and re-run keeps every attempt's artifacts under the *same* name,
# so name-based selection picks that name once per stored copy and downloads
# them all into one directory; the second extraction then aborts with
# `openat <file>: file exists` and the whole publish stage fails even though
# every artifact is intact. Picking the newest id per name keeps this helper
# correct no matter how many attempts piled up.

set -euo pipefail

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
attempts=2
include_updater_metadata=false
exclude_windows=false
exclude_macos=false
brand=qwenpaw
run_id=${GITHUB_RUN_ID:-}

while [ $# -gt 0 ]; do
  case "$1" in
    --attempts)
      if [ $# -lt 2 ]; then
        echo "--attempts requires a value (1 or 2)" >&2
        exit 2
      fi
      attempts="$2"
      shift 2
      ;;
    --include-updater-metadata)
      include_updater_metadata=true
      shift
      ;;
    --exclude-windows)
      exclude_windows=true
      shift
      ;;
    --exclude-macos)
      exclude_macos=true
      shift
      ;;
    --brand)
      brand="$2"
      shift 2
      ;;
    --run-id)
      run_id="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

if ! [[ "$attempts" =~ ^[12]$ ]]; then
  echo "--attempts must be 1 or 2" >&2
  exit 2
fi

: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
: "${GH_TOKEN:?GH_TOKEN is required}"
if [[ "$brand" != "qwenpaw" && "$brand" != "ugsci" ]]; then
  echo "--brand must be qwenpaw or ugsci" >&2
  exit 2
fi
: "${run_id:?--run-id or GITHUB_RUN_ID is required}"

# Replacement runs supply their own application and updater pair. The caller
# verifies the complete platform set after all replacement overlays are merged.
required_platforms=()
$exclude_windows || required_platforms+=(--require windows)
$exclude_macos || required_platforms+=(--require macos)
if [ ${#required_platforms[@]} -eq 0 ]; then
  echo "Both desktop platforms are supplied by replacement runs"
  exit 0
fi

# Parallel arrays: selected_names[i] is downloaded by artifact id
# selected_ids[i]. Both stay the same length by construction.
selected_names=()
selected_ids=()

cleanup_downloads() {
  local name
  if [ ${#selected_names[@]} -eq 0 ]; then
    return 0
  fi
  for name in "${selected_names[@]}"; do
    # Names are accepted only after matching one of the fixed prefixes below.
    rm -rf -- "$name" "${name}.zip.partial"
  done
}

# Resolve duplicates deterministically and emit "<name>\t<id>" pairs.
# Reads TSV "<id>\t<created_at>\t<name>" on stdin, keeps the newest copy of
# every matching name (ISO-8601 UTC sorts lexicographically; the numeric id
# breaks exact ties), and reports what it dropped so a surprise duplicate is
# visible in the job log instead of failing two steps later.
resolve_selection() {
  DESKTOP_ARTIFACT_BRAND="$brand" INCLUDE_UPDATER_METADATA="$include_updater_metadata" EXCLUDE_WINDOWS="$exclude_windows" EXCLUDE_MACOS="$exclude_macos" python3 -c '
import os
import re
import sys

include_meta = os.environ.get("INCLUDE_UPDATER_METADATA") == "true"
prefix = "UGSci" if os.environ.get("DESKTOP_ARTIFACT_BRAND") == "ugsci" else "QwenPaw"
platforms = [
    (platform, label)
    for platform, label in (("windows", "Windows"), ("macos", "macOS"))
    if os.environ.get("EXCLUDE_" + platform.upper()) != "true"
]
patterns = [
    re.compile(r"^" + prefix + "-Desktop-Tauri-" + label + "-")
    for _, label in platforms
]
if include_meta:
    patterns.extend(
        re.compile(r"^tauri-updater-meta-" + platform + "$")
        for platform, _ in platforms
    )

copies = {}
for raw in sys.stdin:
    line = raw.rstrip("\n")
    if not line:
        continue
    parts = line.split("\t")
    if len(parts) != 3:
        continue
    artifact_id, created_at, name = parts
    if not artifact_id.isdigit():
        continue
    if not any(pattern.match(name) for pattern in patterns):
        continue
    copies.setdefault(name, []).append((created_at, int(artifact_id)))

for name in sorted(copies):
    entries = sorted(copies[name])
    chosen = entries[-1]
    if len(entries) > 1:
        dropped = ", ".join(str(entry[1]) for entry in entries[:-1])
        print(
            "::warning::Artifact name %r has %d copies in this run; "
            "using newest id %d and ignoring older %s"
            % (name, len(entries), chosen[1], dropped),
            file=sys.stderr,
        )
    print("%s\t%d" % (name, chosen[1]))
'
}

# Extract an artifact zip into <target>/ while restoring the POSIX mode bits
# recorded in each entry. `python3 -m zipfile -e` silently drops them (a 0755
# helper comes back 0644), which would corrupt the macOS .app payload, so the
# mode is reapplied explicitly. Entries escaping <target>/ are rejected.
extract_artifact() {
  python3 - "$1" "$2" <<'PY'
import os
import sys
import zipfile

source, target = sys.argv[1], sys.argv[2]
root = os.path.realpath(target)
os.makedirs(root, exist_ok=True)

with zipfile.ZipFile(source) as archive:
    bad = archive.testzip()
    if bad is not None:
        raise SystemExit("corrupt entry in artifact zip: %s" % bad)
    for info in archive.infolist():
        dest = os.path.realpath(os.path.join(root, info.filename))
        if dest != root and not dest.startswith(root + os.sep):
            raise SystemExit("refusing path outside target: %s" % info.filename)
        if info.is_dir():
            os.makedirs(dest, exist_ok=True)
            continue
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with archive.open(info) as src, open(dest, "wb") as out:
            while True:
                chunk = src.read(1024 * 1024)
                if not chunk:
                    break
                out.write(chunk)
        mode = (info.external_attr >> 16) & 0xFFFF
        if mode:
            os.chmod(dest, mode)
PY
}

for ((attempt = 1; attempt <= attempts; attempt++)); do
  echo "Desktop artifact download attempt ${attempt}/${attempts}"
  selected_names=()
  selected_ids=()

  artifact_table=""
  if artifact_table=$(gh api --paginate --method GET \
    "repos/${GITHUB_REPOSITORY}/actions/runs/${run_id}/artifacts" \
    -f per_page=100 \
    --jq '.artifacts[] | select(.expired == false) | [.id, .created_at, .name] | @tsv'); then
    while IFS=$'\t' read -r name id; do
      [ -n "${name:-}" ] && [ -n "${id:-}" ] || continue
      selected_names+=("$name")
      selected_ids+=("$id")
    done < <(printf '%s\n' "$artifact_table" | resolve_selection)
  else
    echo "::warning::Could not list artifacts for attempt ${attempt}"
  fi

  cleanup_downloads

  download_ok=true
  if [ ${#selected_names[@]} -eq 0 ]; then
    echo "::warning::No matching desktop artifacts found"
    download_ok=false
  else
    for index in "${!selected_names[@]}"; do
      name="${selected_names[$index]}"
      id="${selected_ids[$index]}"
      echo "Downloading artifact: $name (id=$id)"
      zip_path="${name}.zip.partial"
      if ! gh api "repos/${GITHUB_REPOSITORY}/actions/artifacts/${id}/zip" \
        > "$zip_path"; then
        echo "::warning::Download failed for artifact: $name"
        download_ok=false
        break
      fi
      if ! extract_artifact "$zip_path" "$name"; then
        echo "::warning::Extraction failed for artifact: $name"
        download_ok=false
        break
      fi
      rm -f -- "$zip_path"
    done
  fi

  if $download_ok && python3 "$script_dir/verify_desktop_artifacts.py" \
    --brand "$brand" \
    "${required_platforms[@]}"; then
    echo "Desktop artifacts downloaded and verified"
    exit 0
  fi

  cleanup_downloads
  if [ "$attempt" -lt "$attempts" ]; then
    delay=$((attempt * 10))
    echo "::warning::Desktop artifact verification failed; retrying in ${delay}s"
    sleep "$delay"
  fi
done

echo "::error::Desktop artifacts remained unavailable or corrupt after ${attempts} attempts"
exit 1
