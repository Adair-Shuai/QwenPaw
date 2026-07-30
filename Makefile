# UGSci Test & Coverage Makefile

.PHONY: test test-unit test-contract test-integration test-channel test-channel-contract coverage-full clean \
        setup-dev hooks-install hooks-uninstall precommit lint format typecheck \
        ugsci-check ugsci-sync ci-local act-list act-run act-precommit act-tests

# Python path — prefer the project venv if it exists
VENV      := .venv
VENV_PY   := $(VENV)/bin/python
VENV_PC   := $(VENV)/bin/pre-commit
PYTHON    := $(if $(wildcard $(VENV_PY)),$(VENV_PY),python)
PYTEST    := $(PYTHON) -m pytest
UV        := uv

# Default: run all tests
test:
	$(PYTEST) tests/ -v --tb=short -q

# Unit tests only
test-unit:
	$(PYTEST) tests/unit/ -v --tb=short

# Contract tests (interface compliance)
test-contract:
	$(PYTEST) tests/contract/ -v --tb=short

# Integration tests
test-integration:
	$(PYTEST) tests/integration/ -v --tb=short

# Full coverage (all modules)
coverage-full:
	$(PYTEST) tests/unit/ tests/integration/ -v \
		--cov=src/qwenpaw \
		--cov-report=term-missing \
		--cov-report=html

# Check contract coverage for all channels
check-contracts:
	$(PYTHON) scripts/check_channel_contracts.py

# Clean generated files
clean:
	rm -rf htmlcov/ .pytest_cache/
	rm -f coverage.xml coverage-sa.xml .coverage

# Quick check (fast feedback)
quick:
	$(PYTEST) tests/unit/ -x -q --tb=line

# UGSci canonical source and focused regression checks
ugsci-check:
	cd plugins/bundle/ugsci/ui && npm run typecheck && npm run build
	$(PYTHON) scripts/sync_ugsci_bundle.py --check
	$(PYTEST) tests/unit/plugins/ugsci/ -q --tb=short

ugsci-sync:
	$(PYTHON) scripts/sync_ugsci_bundle.py --sync

# Channel-specific tests
test-channel:
	@echo "Running Channel unit tests..."
	$(PYTEST) tests/unit/channels/ -v --tb=short

test-channel-contract:
	@echo "Running Channel contract tests..."
	$(PYTEST) tests/contract/channels/ -v --tb=short

# BaseChannel core unit tests (optional, not enforced)
test-base-core:
	$(PYTEST) tests/unit/channels/test_base_core.py -v

# ---------------------------------------------------------------------------
# Local CI & Quality targets
# ---------------------------------------------------------------------------

# Install dev + test dependencies into the project venv
setup-dev:
	@if [ -d "$(VENV)" ]; then \
		VIRTUAL_ENV=$$(pwd)/$(VENV) $(UV) pip install -e ".[dev,test]"; \
	else \
		echo "Creating venv with uv ..."; \
		$(UV) venv $(VENV); \
		VIRTUAL_ENV=$$(pwd)/$(VENV) $(UV) pip install -e ".[dev,test]"; \
	fi
	@echo "✅ Dev dependencies installed."

# Install pre-commit git hooks
hooks-install:
	@if [ -x "$(VENV_PC)" ]; then \
		$(VENV_PC) install; \
		$(VENV_PC) install-hooks; \
	else \
		pre-commit install; \
		pre-commit install-hooks; \
	fi
	@echo "✅ pre-commit hooks installed."

# Uninstall pre-commit git hooks
hooks-uninstall:
	@if [ -x "$(VENV_PC)" ]; then \
		$(VENV_PC) uninstall; \
	else \
		pre-commit uninstall; \
	fi
	@echo "✅ pre-commit hooks uninstalled."

# Run pre-commit on all files
precommit:
	@if [ -x "$(VENV_PC)" ]; then \
		$(VENV_PC) run --all-files; \
	else \
		pre-commit run --all-files; \
	fi

# Run all linters directly (without pre-commit wrapper)
lint:
	$(PYTHON) -m flake8 src/ tests/ scripts/ --extend-ignore=E203
	$(PYTHON) -m pylint src/qwenpaw/ --disable=all --enable=E,F --rcfile=/dev/null

# Format code with black
format:
	$(PYTHON) -m black --line-length=79 src/ tests/ scripts/

# Type-check with mypy
typecheck:
	$(PYTHON) -m mypy --ignore-missing-imports --follow-imports=skip --explicit-package-bases src/qwenpaw/

# Full local CI: pre-commit + unit tests (what CI runs on push/PR)
ci-local: precommit
	@echo "── Running unit tests ──"
	$(PYTEST) tests/unit/ -v --tb=short -q

# ---------------------------------------------------------------------------
# act — run GitHub Actions locally (requires Docker)
# ---------------------------------------------------------------------------

# List available GitHub Actions workflows
act-list:
	act -l

# Run a specific workflow locally (usage: make act-run WORKFLOW=tests.yml)
act-run:
	@if [ -z "$(WORKFLOW)" ]; then \
		echo "Usage: make act-run WORKFLOW=<workflow-file.yml>"; \
		echo "Available workflows:"; \
		act -l; \
	else \
		act -W ".github/workflows/$(WORKFLOW)"; \
	fi

# Run pre-commit workflow locally
act-precommit:
	act -W ".github/workflows/pre-commit.yml"

# Run tests workflow locally
act-tests:
	act -W ".github/workflows/tests.yml"
