# Automated Model Retraining System Using Data Drift Detection

A small, runnable MLOps example that follows **monitor → detect drift → retrain → compare → register → serve**. It uses a scikit-learn logistic-regression pipeline, PSI-based drift checks, MLflow tracking/registry, GitHub Actions, Docker, and FastAPI. The included customer-churn CSV files are synthetic examples; replace them with representative data before relying on its outputs.

## Layout

- `data/reference/train.csv`: labeled training/reference data.
- `data/production/production.csv`: sample labeled production batch. In a real monitor, production features can be unlabeled; retraining and evaluation require labels.
- `src/drift_detection.py`: feature-level PSI and a share-of-features drift decision; writes a custom report and Evidently's standard visual report.
- `src/train.py`, `src/evaluate.py`, `src/retrain.py`: train, score, compare and conditionally promote a candidate.
- `src/predict.py` and `api/main.py`: batch and HTTP inference.
- `.github/workflows/retrain.yml`: scheduled/push monitoring and same-run conditional retraining.

## Quick start

Use Python 3.11 or newer.

```bash
cd automated-model-retraining
python -m venv .venv
# Windows: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python src/prepare_environment.py
python src/train.py
python src/drift_detection.py
python src/retrain.py
uvicorn api.main:app --reload
```

The API is at `http://127.0.0.1:8000`; interactive docs are at `/docs`. Example request:

```json
{"records":[{"age":35,"monthly_spend":120,"tenure_months":12,"support_calls":3}]}
```

The setup script applies a narrow Evidently type-alias workaround needed by the packaged legacy UI module on Python 3.11. The drift command exits `1` when drift is detected and `0` otherwise (other nonzero errors indicate a failed check). It compares shared feature columns and excludes the configured target column. For each column, PSI compares production proportions against reference-derived decile bins (categorical columns use category proportions). A feature is drifted at PSI ≥ threshold; overall drift triggers when the share of drifted features is ≥ the threshold. The default is `0.30`. PSI is a monitoring heuristic; set the threshold against domain impact and historical data.

## Configuration

Environment variables: `TARGET_COLUMN` (`churned`), `DRIFT_THRESHOLD` (`0.30`), `REFERENCE_DATA`, `PRODUCTION_DATA`, `MODEL_PATH`, `DRIFT_REPORT_PATH`, `MLFLOW_TRACKING_URI`, `MLFLOW_EXPERIMENT`, `MLFLOW_MODEL_NAME`, and `MIN_F1_DELTA` (`0.0`). Paths may be absolute. MLflow defaults to a project-local SQLite database (`mlflow.db`) and artifact directory (`mlartifacts/`). On Windows, start its UI/API with `.\start_mlflow.ps1` (then visit `http://127.0.0.1:5000`). To use a shared server, set `MLFLOW_TRACKING_URI` and its credentials in the environment.

The retraining script fits on the labeled production batch, then evaluates both current and candidate models on the same held-out slice of labeled reference data. A rejected candidate is a successful validation outcome and does not fail the CI job. It promotes only if candidate F1 is at least current F1 plus `MIN_F1_DELTA`. This is a basic gate; production rollout should also validate business costs, calibration, subgroup performance and a time-appropriate holdout. MLflow logs both training runs and registers a candidate only after it passes this gate. The local `models/model.pkl` is the API's active bundle. A rejected candidate is kept as a local candidate artifact but does not replace the active model.

## No-cost hosted tracking and API

The GitHub Actions workflow supports hosted MLflow through DagsHub. DagsHub provides an MLflow endpoint for each repository. Its Individual plan is $0 and includes up to 100 tracked experiments in private repositories and 20 GB of storage; public repositories have unlimited experiment tracking. Review [DagsHub's current plan limits](https://dagshub.com/pricing). Create a DagsHub repository named `FSAD-PROJECT-HIREPRO` under your account, then add these GitHub Actions repository secrets:

- `MLFLOW_TRACKING_URI`: `https://dagshub.com/<your-DagsHub-username>/FSAD-PROJECT-HIREPRO.mlflow`
- `MLFLOW_TRACKING_USERNAME`: your DagsHub username
- `MLFLOW_TRACKING_PASSWORD`: a DagsHub access token

The workflow then writes experiment runs, artifacts, and registered models to the persistent hosted tracker. If these secrets are not configured, CI retains its local per-run SQLite fallback. Keep the DagsHub token private.

The root `render.yaml` is an optional **free-tier** API deployment only; it does not create a paid tracker, database, or disk. Connect the GitHub repository in [Render Blueprints](https://dashboard.render.com/blueprints) and create a Blueprint from `render.yaml`. Render generates an API key for `/predict`, which must be sent in the `X-API-Key` header. The free service can spin down when idle, so the first request may be delayed. Its initial model is trained from the included reference CSV at build time. Local API use remains unauthenticated unless `API_KEY` is set.

The example datasets are synthetic. Keep real production data in private storage and check the free-tier limits before logging artifacts.

## GitHub Actions setup

Because this project is nested inside a larger repository, the active workflow is at the repository root in `.github/workflows/automated-model-retraining.yml`. The copy in this folder is retained for when the project is used as its own repository.

Commit/push this folder to GitHub. Keep real production data and models in a private repository; the example CSVs are synthetic. The scheduled monitor and retraining run in the same workflow, so no long-lived GitHub token is required for workflow-to-workflow dispatch. Set the optional repository variable `DRIFT_THRESHOLD` to change the drift gate. Set `MLFLOW_TRACKING_URI` as a repository secret to use a secured shared tracking server; otherwise CI uses a SQLite tracking database and uploads the run database, artifacts, and model as workflow artifacts.
## Docker

```bash
docker build -t drift-retraining .
docker run --rm -p 8000:8000 drift-retraining
```

Mount a persistent model/data directory for non-demo use. Do not expose MLflow or the prediction API publicly without authentication, access controls and TLS.














