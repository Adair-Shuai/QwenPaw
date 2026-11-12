# Releasing UGSci

The core application, market plugins and applications have independent release cycles. See [the operational guide](RELEASING_zh.md) for the complete policy.

## Core release

From a clean authenticated checkout, run `python scripts/pack/prepare_core_release.py` to allocate the next Beta version, push its version commit, create a pinned draft and dispatch Release Core. Use `--channel stable` for a stable version, `--dry-run` to inspect the plan, or `--resume TAG` to retry an existing draft without incrementing again. Extension versions and compatibility bounds are untouched.

Use **Release Core (build, verify, resume)** (`.github/workflows/release-resume.yml`). Pin a draft release to the intended commit and match its tag to `src/qwenpaw/__version__.py` (for example `v2.3.0-beta.5` and `2.3.0b5`). Dispatch the workflow on that same commit's branch.

Wheel verification, desktop builds and full regressions start independently after resolution. Signed component archives reuse the verified desktop layers. Core publication requires the installation, startup, archive-content, signature and update gates. The draft becomes public before mutable core and desktop pointers are promoted. Core publication never rewrites the plugin market index.

Backend test matrices share one console build and one build of the portable plugin frontends needed by unit contracts. Every consumer checks archive SHA-256 values and brand assets before running the unchanged platform test suite.
Windows unit tests run in four independent jobs with deterministic, disjoint node-ID partitioning. Their union executes every collected test exactly once; document forms and OfficeCLI contracts run once per supported platform.

Every historical component manifest is authenticated before reuse. Identical selected core baselines left by independent extension releases are downloaded and extracted once; the original signed history and distinct core versions remain intact.

Failed jobs can be retried. `artifacts_run_id` enables attested artifact reuse; product changes require rebuilding affected artifacts. `dry_run` does not publish the draft or production pointers. Existing stable/prerelease channel policies remain in effect.

To resume after the GitHub Release becomes public, pass `allow_published_resume=true` with verified `artifacts_run_id`. Draft cleanup is skipped and publication continues. Finalization requires successful desktop upload, component upload and full tests. Packaging changes require replacement artifacts covering those changes, and each replacement must pass its own commit comparison. Draft cleanup selects exact desktop filenames. Content-addressed component archives are reused through immutable uploads.

## Bundled scope

`src/qwenpaw/bundled_plugin_policy.py` is the explicit allowlist: UGSci, research, FlowForge, OpenUI and Run Center. Pet, browser and other optional plugins, all apps and local UGSci visualization test data are excluded from core distributions. Source data and installed user extensions are preserved.

## Independent extensions

`plugins-release.yml` publishes market plugins explicitly and never runs because a core release was published. Apps keep their dedicated `*-release.yml` workflows and their own functional validation. New users install apps from the market; existing users retain manual/automatic update behavior. PyPI and Docker also remain separate distribution entry points.

`apps-release.yml` covers UIdeas, ULit and Agent Kanban. The other six apps retain their specialized workflows; all nine have an independent release path.

`scripts/pack/prepare_plugin_versions.py` compares actual immutable OSS archives, increments only changed and occupied extension versions, and synchronizes source mirrors. Repack and run immutable upload preflight afterwards. A source-version commit must push without force before publishing. Every app workflow executes the same preparation tool while retaining its specialized packaging checks.

Compatibility floors do not track routine version increments. Preserve genuine minimum requirements and the `<3.0.0` extension ceiling, SDK/protocol checks and native-host fingerprints. Component protocol 2 and core floor `2.2.2b9` remain unchanged. Never overwrite a released version or bypass signatures, archive validation, rollback or tests.

## Retired workflows

The old all-product `release.yml`, its release-window sentinel/watchdog, duty-issue generator, duplicate plugins-build and unused component-publish helper are removed. Desktop build/publish/promote, component-release, release verification, independent plugins/apps and regression inventories remain. Historical runs and releases are preserved.

Validate release changes with `python scripts/verify_update_regressions.py` and the protected fork checks. See [update compatibility rules](docs/UPDATE_COMPATIBILITY_GUARD.md).
