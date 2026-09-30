from __future__ import annotations
import json
import os
import shutil
from pathlib import Path
import joblib
import mlflow
import mlflow.sklearn
from mlflow.exceptions import MlflowException
import pandas as pd
from sklearn.model_selection import train_test_split
from config import MLFLOW_MODEL_NAME, MLFLOW_TRACKING_URI, MODEL_PATH, PRODUCTION_DATA, REFERENCE_DATA, TARGET_COLUMN, RANDOM_STATE
from train import metrics_for, train

ROOT = Path(__file__).resolve().parents[1]
CANDIDATE = ROOT / "models/candidate.pkl"
MIN_F1_DELTA = float(os.getenv("MIN_F1_DELTA", "0.0"))

def run_retraining():
    if not MODEL_PATH.exists(): train(REFERENCE_DATA, MODEL_PATH)
    reference=pd.read_csv(REFERENCE_DATA)
    X=reference.drop(columns=[TARGET_COLUMN]); y=reference[TARGET_COLUMN]
    stratify=y if y.nunique()>1 and y.value_counts().min()>=2 else None
    X_train, X_holdout, y_train, y_holdout=train_test_split(X,y,test_size=0.25,random_state=RANDOM_STATE,stratify=stratify)
    mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
    registry = mlflow.tracking.MlflowClient()
    try:
        registry.get_registered_model(MLFLOW_MODEL_NAME)
    except MlflowException:
        active_bundle = joblib.load(MODEL_PATH)
        with mlflow.start_run(run_name="initial-baseline-registration"):
            mlflow.sklearn.log_model(active_bundle["model"], name="validated_model", registered_model_name=MLFLOW_MODEL_NAME, skops_trusted_types=["numpy.dtype"])
    baseline_bundle=joblib.load(MODEL_PATH)
    baseline=metrics_for(baseline_bundle["model"],X_holdout,y_holdout)
    train(PRODUCTION_DATA, CANDIDATE)
    candidate_bundle=joblib.load(CANDIDATE)
    candidate=metrics_for(candidate_bundle["model"],X_holdout,y_holdout)
    accepted = candidate["f1"] >= baseline["f1"] + MIN_F1_DELTA
    decision = {"accepted": accepted, "baseline_reference_holdout_f1": baseline["f1"], "candidate_reference_holdout_f1": candidate["f1"], "minimum_f1_delta": MIN_F1_DELTA}
    mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
    with mlflow.start_run(run_name="model-promotion-validation"):
        mlflow.log_metrics({"baseline_reference_holdout_f1": baseline["f1"], "candidate_reference_holdout_f1": candidate["f1"]})
        mlflow.set_tag("promotion.accepted", str(accepted).lower())
        mlflow.log_dict(decision, "promotion_decision.json")
        if accepted:
            mlflow.sklearn.log_model(candidate_bundle["model"], artifact_path="validated_model", registered_model_name=MLFLOW_MODEL_NAME, skops_trusted_types=["numpy.dtype"])
            shutil.copy2(CANDIDATE, MODEL_PATH)
    print(json.dumps(decision, indent=2))
    return accepted

if __name__ == "__main__":
    run_retraining()





