#!/usr/bin/env bash
# Re-sign all Mach-O files in a macOS bundle/directory with one identity.
#
# PyInstaller collects Python frameworks and native extension libraries from
# third-party packages. Re-signing every Mach-O file after collection keeps the
# backend executable, Python runtime, and native dependencies in one signature
# state before Tauri embeds them in the final app.

set -euo pipefail

TARGET="${1:?Usage: sign_macos_bundle.sh <target> [identity]}"
IDENTITY="${2:-${APPLE_SIGNING_IDENTITY:--}}"

if [[ "$(uname -s)" != "Darwin" ]]; then
    echo "ERROR: macOS code signing must run on Darwin"
    exit 1
fi

if ! command -v codesign >/dev/null 2>&1; then
    echo "ERROR: codesign not found"
    exit 1
fi

if ! command -v file >/dev/null 2>&1; then
    echo "ERROR: file not found"
    exit 1
fi

if [[ ! -e "${TARGET}" ]]; then
    echo "ERROR: signing target not found: ${TARGET}"
    exit 1
fi

signing_args() {
    printf '%s\n' --force --sign "${IDENTITY}"
    if [[ "${IDENTITY}" == "-" ]]; then
        printf '%s\n' --timestamp=none
    fi
}

is_macho() {
    file -b "$1" | grep -q "Mach-O"
}

is_inside_framework() {
    [[ "$1" == *".framework/"* ]]
}

is_inside_bundle() {
    # A macOS bundle is any directory with a Contents/ subdirectory.
    # This covers .app, .framework, and JRE bundles (e.g. java-runtime).
    [[ "$1" == *".framework/"* ]] || [[ "$1" == *"/Contents/"* ]]
}

codesign_file() {
    local path="$1"
    local args=()
    local arg

    while IFS= read -r arg; do
        args+=("${arg}")
    done < <(signing_args)

    codesign "${args[@]}" "${path}"
}

codesign_bundle() {
    local path="$1"
    local args=()
    local arg

    while IFS= read -r arg; do
        args+=("${arg}")
    done < <(signing_args)

    codesign "${args[@]}" "${path}"
}

echo "Signing macOS native files in ${TARGET}"
echo "Signing identity: ${IDENTITY}"

signed_files=0
while IFS= read -r -d '' path; do
    if is_inside_bundle "${path}"; then
        continue
    fi
    if is_macho "${path}"; then
        codesign_file "${path}"
        signed_files=$((signed_files + 1))
    fi
done < <(find "${TARGET}" -type f -print0)

# Framework directories carry their own bundle signature. Sign them after the
# contained Mach-O files, then sign the app bundle last.
signed_frameworks=0
while IFS= read -r framework; do
    if [[ -n "${framework}" ]]; then
        codesign_bundle "${framework}"
        signed_frameworks=$((signed_frameworks + 1))
    fi
done < <(find "${TARGET}" -type d -name "*.framework" | sort -r)

# Sign other macOS bundle directories (e.g., JRE bundles with Contents/)
# that are not .app or .framework.  These must be signed as a whole to
# avoid "unsealed contents present in the bundle root" errors.
signed_bundles=0
while IFS= read -r contents_dir; do
    bundle_dir=$(dirname "${contents_dir}")
    if [[ "${bundle_dir}" != *.app && "${bundle_dir}" != *.framework ]]; then
        codesign_bundle "${bundle_dir}"
        signed_bundles=$((signed_bundles + 1))
    fi
done < <(find "${TARGET}" -type d -name "Contents" | sort -r)

if [[ "${TARGET}" == *.app ]]; then
    codesign_bundle "${TARGET}"
fi

echo "Signed ${signed_files} Mach-O files, ${signed_frameworks} frameworks, and ${signed_bundles} bundles"

if [[ "${TARGET}" == *.app ]]; then
    codesign --verify --deep --strict --verbose=2 "${TARGET}"
else
    while IFS= read -r -d '' path; do
        if is_inside_bundle "${path}"; then
            continue
        fi
        if is_macho "${path}"; then
            codesign --verify --verbose=2 "${path}"
        fi
    done < <(find "${TARGET}" -type f -print0)
    while IFS= read -r framework; do
        if [[ -n "${framework}" ]]; then
            codesign --verify --verbose=2 "${framework}"
        fi
    done < <(find "${TARGET}" -type d -name "*.framework" | sort -r)
fi
