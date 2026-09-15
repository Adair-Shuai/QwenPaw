"""HTTP API for the lightweight model and Study services."""

from __future__ import annotations

from typing import Any, Callable

from fastapi import APIRouter, Body, HTTPException, Query, status

from .models import CONTRACT_VERSION
from .research import ReferenceConflictError, ResearchRepository


def _call(callback: Callable[[], Any]) -> Any:
    try:
        return callback()
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Referenced record not found") from exc
    except ReferenceConflictError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"message": str(exc), "references": exc.references},
        ) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


def build_research_router(repository: ResearchRepository) -> APIRouter:
    router = APIRouter()

    @router.get("/models")
    def list_models(
        project_id: str | None = Query(default=None),
        include_deleted: bool = Query(default=False),
    ) -> dict[str, Any]:
        return {
            "contract_version": CONTRACT_VERSION,
            "models": repository.list_models(
                project_id, include_deleted=include_deleted
            ),
        }

    @router.post("/models", status_code=status.HTTP_201_CREATED)
    def create_model(payload: dict[str, Any] = Body(...)) -> dict[str, Any]:
        return _call(lambda: repository.create_model(payload))

    @router.get("/models/{model_id}")
    def get_model(
        model_id: str, include_deleted: bool = Query(default=False)
    ) -> dict[str, Any]:
        item = repository.get_model(model_id, include_deleted=include_deleted)
        if item is None:
            raise HTTPException(status_code=404, detail="Model not found")
        return item

    @router.delete("/models/{model_id}")
    def delete_model(model_id: str) -> dict[str, Any]:
        return _call(lambda: repository.delete_model(model_id))

    @router.post("/models/{model_id}/restore")
    def restore_model(model_id: str) -> dict[str, Any]:
        return _call(lambda: repository.restore_model(model_id))

    @router.get("/models/{model_id}/branches")
    def list_model_branches(
        model_id: str, include_deleted: bool = Query(default=False)
    ) -> dict[str, Any]:
        if repository.get_model(model_id, include_deleted=include_deleted) is None:
            raise HTTPException(status_code=404, detail="Model not found")
        return {
            "contract_version": CONTRACT_VERSION,
            "model_id": model_id,
            "branches": repository.list_model_branches(
                model_id, include_deleted=include_deleted
            ),
        }

    @router.post("/models/{model_id}/branches", status_code=status.HTTP_201_CREATED)
    def create_model_branch(
        model_id: str, payload: dict[str, Any] = Body(...)
    ) -> dict[str, Any]:
        return _call(lambda: repository.create_model_branch(model_id, payload))

    @router.get("/models/{model_id}/branches/{branch_name:path}")
    def get_model_branch(
        model_id: str,
        branch_name: str,
        include_deleted: bool = Query(default=False),
    ) -> dict[str, Any]:
        item = repository.get_model_branch(
            model_id, branch_name, include_deleted=include_deleted
        )
        if item is None:
            raise HTTPException(status_code=404, detail="Model branch not found")
        return item

    @router.put("/models/{model_id}/branches/{branch_name:path}")
    def set_model_branch_head(
        model_id: str, branch_name: str, payload: dict[str, Any] = Body(...)
    ) -> dict[str, Any]:
        return _call(
            lambda: repository.set_model_branch_head(
                model_id, branch_name, str(payload.get("version_id") or "")
            )
        )

    @router.delete("/models/{model_id}/branches/{branch_name:path}")
    def delete_model_branch(model_id: str, branch_name: str) -> dict[str, Any]:
        return _call(lambda: repository.delete_model_branch(model_id, branch_name))

    @router.post("/models/{model_id}/branches/{branch_name:path}/restore")
    def restore_model_branch(model_id: str, branch_name: str) -> dict[str, Any]:
        return _call(lambda: repository.restore_model_branch(model_id, branch_name))

    @router.get("/models/{model_id}/tags")
    def list_model_tags(
        model_id: str, include_deleted: bool = Query(default=False)
    ) -> dict[str, Any]:
        if repository.get_model(model_id, include_deleted=include_deleted) is None:
            raise HTTPException(status_code=404, detail="Model not found")
        return {
            "contract_version": CONTRACT_VERSION,
            "model_id": model_id,
            "tags": repository.list_model_tags(
                model_id, include_deleted=include_deleted
            ),
        }

    @router.post("/models/{model_id}/tags", status_code=status.HTTP_201_CREATED)
    def create_model_tag(
        model_id: str, payload: dict[str, Any] = Body(...)
    ) -> dict[str, Any]:
        return _call(lambda: repository.create_model_tag(model_id, payload))

    @router.get("/models/{model_id}/tags/{tag_name}")
    def get_model_tag(
        model_id: str,
        tag_name: str,
        include_deleted: bool = Query(default=False),
    ) -> dict[str, Any]:
        item = repository.get_model_tag(
            model_id, tag_name, include_deleted=include_deleted
        )
        if item is None:
            raise HTTPException(status_code=404, detail="Model tag not found")
        return item

    @router.put("/models/{model_id}/tags/{tag_name}")
    def set_model_tag(
        model_id: str, tag_name: str, payload: dict[str, Any] = Body(...)
    ) -> dict[str, Any]:
        return _call(lambda: repository.set_model_tag(model_id, tag_name, payload))

    @router.delete("/models/{model_id}/tags/{tag_name}")
    def delete_model_tag(model_id: str, tag_name: str) -> dict[str, Any]:
        return _call(lambda: repository.delete_model_tag(model_id, tag_name))

    @router.post("/models/{model_id}/tags/{tag_name}/restore")
    def restore_model_tag(model_id: str, tag_name: str) -> dict[str, Any]:
        return _call(lambda: repository.restore_model_tag(model_id, tag_name))

    @router.post("/models/{model_id}/versions", status_code=status.HTTP_201_CREATED)
    def create_model_version(
        model_id: str, payload: dict[str, Any] = Body(...)
    ) -> dict[str, Any]:
        return _call(lambda: repository.create_model_version(model_id, payload))

    @router.get("/models/{model_id}/versions")
    def list_model_versions(
        model_id: str, include_deleted: bool = Query(default=False)
    ) -> dict[str, Any]:
        if repository.get_model(model_id, include_deleted=include_deleted) is None:
            raise HTTPException(status_code=404, detail="Model not found")
        return {
            "contract_version": CONTRACT_VERSION,
            "model_id": model_id,
            "versions": repository.list_model_versions(
                model_id, include_deleted=include_deleted
            ),
        }

    @router.get("/model-versions/{version_id}")
    def get_model_version(
        version_id: str, include_deleted: bool = Query(default=False)
    ) -> dict[str, Any]:
        item = repository.get_model_version(version_id, include_deleted=include_deleted)
        if item is None:
            raise HTTPException(status_code=404, detail="Model version not found")
        return item

    @router.get("/model-versions/{version_id}/references")
    def model_version_references(version_id: str) -> dict[str, Any]:
        if repository.get_model_version(version_id, include_deleted=True) is None:
            raise HTTPException(status_code=404, detail="Model version not found")
        return {
            "contract_version": CONTRACT_VERSION,
            "version_id": version_id,
            "references": repository.model_version_references(version_id),
        }

    @router.delete("/model-versions/{version_id}")
    def delete_model_version(version_id: str) -> dict[str, Any]:
        return _call(lambda: repository.delete_model_version(version_id))

    @router.post("/model-versions/{version_id}/restore")
    def restore_model_version(version_id: str) -> dict[str, Any]:
        return _call(lambda: repository.restore_model_version(version_id))

    @router.post("/model-versions/{version_id}/validate")
    def validate_model_version(
        version_id: str, payload: dict[str, Any] = Body(default={})
    ) -> dict[str, Any]:
        """Validate an immutable model snapshot and persist its report."""
        inline_files = payload.get("inline_files")
        return _call(
            lambda: repository.validate_model_version(
                version_id,
                inline_files=inline_files,
                check_syntax=bool(payload.get("check_syntax", True)),
                promote=bool(payload.get("promote", True)),
            )
        )

    @router.get("/model-versions/{version_id}/validation")
    def get_model_version_validation(version_id: str) -> dict[str, Any]:
        item = repository.get_model_version(version_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Model version not found")
        return {
            "contract_version": CONTRACT_VERSION,
            "version_id": version_id,
            "validation": item.get("validation"),
        }

    @router.post("/model-versions/{version_id}/freeze")
    def freeze_model_version(version_id: str) -> dict[str, Any]:
        return _call(lambda: repository.freeze_model_version(version_id))

    @router.post("/model-versions/{version_id}/release")
    def release_model_version(
        version_id: str,
        payload: dict[str, Any] = Body(default={}),
    ) -> dict[str, Any]:
        """Publish a validated model snapshot for subsequent runs."""
        return _call(
            lambda: repository.release_model_version(
                version_id,
                review_id=payload.get("review_id"),
                require_review=bool(payload.get("require_review", False)),
            )
        )

    @router.get("/model-versions/{version_id}/diff/{other_version_id}")
    def diff_model_versions(version_id: str, other_version_id: str) -> dict[str, Any]:
        return _call(
            lambda: repository.diff_model_versions(version_id, other_version_id)
        )

    @router.get("/studies")
    def list_studies(project_id: str | None = Query(default=None)) -> dict[str, Any]:
        return {
            "contract_version": CONTRACT_VERSION,
            "studies": repository.list_studies(project_id),
        }

    @router.post("/studies", status_code=status.HTTP_201_CREATED)
    def create_study(payload: dict[str, Any] = Body(...)) -> dict[str, Any]:
        return _call(lambda: repository.create_study(payload))

    @router.delete("/studies/{study_id}")
    def delete_study(study_id: str) -> dict[str, Any]:
        return _call(lambda: repository.delete_study(study_id))

    @router.post("/studies/{study_id}/restore")
    def restore_study(study_id: str) -> dict[str, Any]:
        return _call(lambda: repository.restore_study(study_id))

    @router.get("/studies/{study_id}")
    def get_study(
        study_id: str, revision: int | None = Query(default=None, ge=1)
    ) -> dict[str, Any]:
        item = repository.get_study(study_id, revision=revision)
        if item is None:
            raise HTTPException(status_code=404, detail="Study not found")
        return item

    @router.post("/studies/{study_id}/revisions", status_code=status.HTTP_201_CREATED)
    def create_study_revision(
        study_id: str, payload: dict[str, Any] = Body(...)
    ) -> dict[str, Any]:
        definition = payload.get("definition")
        if not isinstance(definition, dict):
            raise HTTPException(status_code=400, detail="definition must be an object")
        return _call(
            lambda: repository.create_study_revision(
                study_id,
                definition,
                created_by=payload.get("created_by"),
            )
        )

    @router.post("/studies/{study_id}/design", status_code=status.HTTP_201_CREATED)
    def generate_design(
        study_id: str, payload: dict[str, Any] = Body(default={})
    ) -> dict[str, Any]:
        method = str(payload.get("method") or "latin_hypercube")
        budget = int(payload.get("budget") or 10)
        seed = int(payload.get("seed") or 0)
        revision = payload.get("revision")
        constraints = payload.get("constraints")
        realizations = _call(
            lambda: repository.generate_design(
                study_id,
                revision=revision,
                method=method,
                budget=budget,
                seed=seed,
                constraints=constraints,
                enqueue=bool(payload.get("enqueue", False)),
            )
        )
        design = {
            "design_fingerprint": realizations[0]["design_fingerprint"]
            if realizations
            else None,
            "design_version": realizations[0]["design_version"]
            if realizations
            else None,
            "method": method.strip().lower(),
            "budget": budget,
            "seed": seed,
            "revision": (
                int(realizations[0]["revision"])
                if realizations
                else (int(revision) if revision is not None else None)
            ),
        }
        return {
            "contract_version": CONTRACT_VERSION,
            "study_id": study_id,
            "design": design,
            "realizations": realizations,
        }

    @router.get("/studies/{study_id}/realizations")
    def list_realizations(
        study_id: str,
        revision: int | None = Query(default=None, ge=1),
        design_fingerprint: str | None = Query(default=None, min_length=1),
    ) -> dict[str, Any]:
        if repository.get_study(study_id, revision=revision) is None:
            raise HTTPException(status_code=404, detail="Study not found")
        return {
            "contract_version": CONTRACT_VERSION,
            "study_id": study_id,
            "realizations": repository.list_realizations(
                study_id,
                revision=revision,
                design_fingerprint=design_fingerprint,
            ),
        }

    @router.get("/studies/{study_id}/designs")
    def list_designs(
        study_id: str, revision: int | None = Query(default=None, ge=1)
    ) -> dict[str, Any]:
        if repository.get_study(study_id, revision=revision) is None:
            raise HTTPException(status_code=404, detail="Study not found")
        return {
            "contract_version": CONTRACT_VERSION,
            "study_id": study_id,
            "designs": repository.list_designs(study_id, revision=revision),
        }

    @router.post("/realizations/{realization_id}/metrics")
    def record_metrics(
        realization_id: str, payload: dict[str, Any] = Body(...)
    ) -> dict[str, Any]:
        metrics = payload.get("metrics")
        return {
            "contract_version": CONTRACT_VERSION,
            "metrics": _call(
                lambda: repository.record_metrics(realization_id, metrics)
            ),
        }

    @router.get("/comparisons/{comparison_id}")
    def get_comparison(comparison_id: str) -> dict[str, Any]:
        item = repository.get_comparison(comparison_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Comparison not found")
        return item

    @router.get("/comparisons")
    def list_comparisons(study_id: str | None = Query(default=None)) -> dict[str, Any]:
        return {
            "contract_version": CONTRACT_VERSION,
            "comparisons": repository.list_comparisons(study_id=study_id),
        }

    @router.get("/studies/{study_id}/analysis/{metric_key}")
    def study_analysis(
        study_id: str,
        metric_key: str,
        time_basis: str | None = Query(default=None),
    ) -> dict[str, Any]:
        if repository.get_study(study_id) is None:
            raise HTTPException(status_code=404, detail="Study not found")
        return repository.study_analysis(study_id, metric_key, time_basis=time_basis)

    @router.get("/surrogates")
    def list_surrogates(study_id: str | None = Query(default=None)) -> dict[str, Any]:
        return {"contract_version": CONTRACT_VERSION, "surrogates": repository.list_surrogates(study_id=study_id)}

    @router.get("/surrogates/{surrogate_id}")
    def get_surrogate(surrogate_id: str) -> dict[str, Any]:
        item = repository.get_surrogate(surrogate_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Surrogate not found")
        return item

    @router.post("/studies/{study_id}/surrogates", status_code=status.HTTP_201_CREATED)
    def train_surrogate(study_id: str, payload: dict[str, Any] = Body(...)) -> dict[str, Any]:
        return _call(lambda: repository.train_surrogate(
            study_id, str(payload.get("metric_key") or ""),
            revision=payload.get("revision"), algorithm=str(payload.get("algorithm") or "linear"),
            min_samples=int(payload.get("min_samples") or 3), created_by=payload.get("created_by")))

    @router.post("/surrogates/{surrogate_id}/predict")
    def predict_surrogate(surrogate_id: str, payload: dict[str, Any] = Body(...)) -> dict[str, Any]:
        return _call(lambda: repository.predict_surrogate(surrogate_id, payload.get("parameters") or {}))

    @router.post("/studies/{study_id}/optimize")
    def optimize_study(study_id: str, payload: dict[str, Any] = Body(...)) -> dict[str, Any]:
        return _call(lambda: repository.optimize_study(
            study_id, payload.get("objectives") or [], limit=int(payload.get("limit") or 10)
        ))

    @router.post("/comparisons", status_code=status.HTTP_201_CREATED)
    def create_comparison(payload: dict[str, Any] = Body(...)) -> dict[str, Any]:
        return _call(lambda: repository.create_comparison(payload))

    @router.get("/reviews")
    def list_reviews(
        project_id: str | None = Query(default=None),
        subject_type: str | None = Query(default=None),
        subject_id: str | None = Query(default=None),
        review_status: str | None = Query(default=None, alias="status"),
        input_fingerprint: str | None = Query(default=None),
    ) -> dict[str, Any]:
        return {
            "contract_version": CONTRACT_VERSION,
            "reviews": _call(
                lambda: repository.list_reviews(
                    project_id=project_id,
                    subject_type=subject_type,
                    subject_id=subject_id,
                    status=review_status,
                    input_fingerprint=input_fingerprint,
                )
            ),
        }

    @router.post("/reviews", status_code=status.HTTP_201_CREATED)
    def create_review(payload: dict[str, Any] = Body(...)) -> dict[str, Any]:
        return _call(lambda: repository.create_review(payload))

    @router.get("/reviews/{review_id}")
    def get_review(review_id: str) -> dict[str, Any]:
        item = repository.get_review(review_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Review not found")
        return item

    @router.get("/reviews/{review_id}/events")
    def list_review_events(review_id: str) -> dict[str, Any]:
        return {
            "contract_version": CONTRACT_VERSION,
            "review_id": review_id,
            "events": _call(lambda: repository.list_review_events(review_id)),
        }

    @router.post("/reviews/{review_id}/transition")
    def transition_review(
        review_id: str, payload: dict[str, Any] = Body(...)
    ) -> dict[str, Any]:
        return _call(
            lambda: repository.transition_review(
                review_id,
                str(payload.get("status") or ""),
                reviewer_id=payload.get("reviewer_id"),
                decision_comment=payload.get("decision_comment"),
                metadata=payload.get("metadata")
                if isinstance(payload.get("metadata"), dict)
                else None,
            )
        )

    @router.get("/reports")
    def list_reports(
        study_id: str | None = Query(default=None),
        comparison_id: str | None = Query(default=None),
    ) -> dict[str, Any]:
        return {
            "contract_version": CONTRACT_VERSION,
            "reports": repository.list_reports(
                study_id=study_id, comparison_id=comparison_id
            ),
        }

    @router.get("/reports/{report_id}")
    def get_report(report_id: str) -> dict[str, Any]:
        item = repository.get_report(report_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Report not found")
        return item

    @router.post("/reports", status_code=status.HTTP_201_CREATED)
    def create_report(payload: dict[str, Any] = Body(...)) -> dict[str, Any]:
        return _call(lambda: repository.create_report(payload))

    return router


__all__ = ["build_research_router"]
