from __future__ import annotations
import argparse
import json
import sys
from pathlib import Path
import joblib
import mlflow
import mlflow.sklearn
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from config import MLFLOW_EXPERIMENT, MLFLOW_MODEL_NAME, MLFLOW_TRACKING_URI, MODEL_PATH, RANDOM_STATE, TARGET_COLUMN


def load_xy(path: Path, target: str):
    frame = pd.read_csv(path)
    if target not in frame.columns:
        raise ValueError(f"Target column {target!r} is missing from {path}")
    if frame.empty or len(frame) < 10:
        raise ValueError(f"Need at least 10 labeled rows in {path}")
    return frame.drop(columns=[target]), frame[target]


def build_pipeline(X: pd.DataFrame) -> Pipeline:
    numeric = X.select_dtypes(include="number").columns.tolist()
    categorical = [column for column in X.columns if column not in numeric]
    transformers = []
    if numeric:
        transformers.append(("numeric", Pipeline([("imputer", SimpleImputer(strategy="median")), ("scale", StandardScaler())]), numeric))
    if categorical:
        transformers.append(("categorical", Pipeline([("imputer", SimpleImputer(strategy="most_frequent")), ("encode", OneHotEncoder(handle_unknown="ignore"))]), categorical))
    if not transformers:
        raise ValueError("Dataset has no usable feature columns")
    return Pipeline([("features", ColumnTransformer(transformers)), ("classifier", LogisticRegression(max_iter=1000, class_weight="balanced", random_state=RANDOM_STATE))])


def metrics_for(model, X, y):
    pred = model.predict(X)
    result = {"accuracy": float(accuracy_score(y, pred)), "precision": float(precision_score(y, pred, zero_division=0)), "recall": float(recall_score(y, pred, zero_division=0)), "f1": float(f1_score(y, pred, zero_division=0))}
    if hasattr(model, "predict_proba") and y.nunique() == 2:
        result["roc_auc"] = float(roc_auc_score(y, model.predict_proba(X)[:, 1]))
    return result


def train(data_path: Path, output_path: Path, target: str = TARGET_COLUMN, register: bool = False):
    X, y = load_xy(data_path, target)
    stratify = y if y.nunique() > 1 and y.value_counts().min() >= 2 else None
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=RANDOM_STATE, stratify=stratify)
    model = build_pipeline(X_train)
    mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
    mlflow.set_experiment(MLFLOW_EXPERIMENT)
    with mlflow.start_run() as run:
        mlflow.log_params({"algorithm": "logistic_regression", "target": target, "train_rows": len(X_train), "test_rows": len(X_test), "features": len(X.columns)})
        model.fit(X_train, y_train)
        metrics = metrics_for(model, X_test, y_test)
        mlflow.log_metrics(metrics)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump({"model": model, "features": X.columns.tolist(), "target": target, "metrics": metrics}, output_path)
        mlflow.log_artifact(str(output_path), artifact_path="model_bundle")
        mlflow.sklearn.log_model(model, artifact_path="model", registered_model_name=MLFLOW_MODEL_NAME if register else None, input_example=X_test.head(2), skops_trusted_types=["numpy.dtype"])
        mlflow.set_tag("model.validation", "pending")
        print(json.dumps({"run_id": run.info.run_id, "metrics": metrics, "model_path": str(output_path)}, indent=2))
    return model, metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train and log a scikit-learn classifier")
    parser.add_argument("--data", type=Path)
    parser.add_argument("--output", type=Path, default=MODEL_PATH)
    parser.add_argument("--target", default=TARGET_COLUMN)
    parser.add_argument("--register", action="store_true")
    args = parser.parse_args()
    from config import REFERENCE_DATA
    train(args.data or REFERENCE_DATA, args.output, args.target, args.register)

