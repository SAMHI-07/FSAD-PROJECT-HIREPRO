from __future__ import annotations
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REFERENCE_DATA = Path(os.getenv("REFERENCE_DATA", ROOT / "data/reference/train.csv"))
PRODUCTION_DATA = Path(os.getenv("PRODUCTION_DATA", ROOT / "data/production/production.csv"))
MODEL_PATH = Path(os.getenv("MODEL_PATH", ROOT / "models/model.pkl"))
REPORT_PATH = Path(os.getenv("DRIFT_REPORT_PATH", ROOT / "monitoring/drift_report.html"))
TARGET_COLUMN = os.getenv("TARGET_COLUMN", "churned")
DRIFT_THRESHOLD = float(os.getenv("DRIFT_THRESHOLD", "0.30"))
RANDOM_STATE = int(os.getenv("RANDOM_STATE", "42"))
MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "sqlite:///" + (ROOT / "mlflow.db").as_posix())
MLFLOW_EXPERIMENT = os.getenv("MLFLOW_EXPERIMENT", "data-drift-retraining")
MLFLOW_MODEL_NAME = os.getenv("MLFLOW_MODEL_NAME", "churn-predictor")

