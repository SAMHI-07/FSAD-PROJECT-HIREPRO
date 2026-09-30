"""Build the small inference bundle during Vercel's deployment build."""
from __future__ import annotations

import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from config import MODEL_PATH, RANDOM_STATE, REFERENCE_DATA, TARGET_COLUMN


def main() -> None:
    frame = pd.read_csv(REFERENCE_DATA)
    if TARGET_COLUMN not in frame or frame.empty:
        raise ValueError(f"Reference CSV must contain labeled rows and {TARGET_COLUMN!r}")
    X = frame.drop(columns=[TARGET_COLUMN])
    y = frame[TARGET_COLUMN]
    numeric = X.select_dtypes(include="number").columns.tolist()
    categorical = [name for name in X.columns if name not in numeric]
    transforms = []
    if numeric:
        transforms.append(("numeric", Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scale", StandardScaler()),
        ]), numeric))
    if categorical:
        transforms.append(("categorical", Pipeline([
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encode", OneHotEncoder(handle_unknown="ignore")),
        ]), categorical))
    if not transforms:
        raise ValueError("Reference CSV has no usable feature columns")
    model = Pipeline([
        ("features", ColumnTransformer(transforms)),
        ("classifier", LogisticRegression(
            max_iter=1000, class_weight="balanced", random_state=RANDOM_STATE
        )),
    ])
    model.fit(X, y)
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({
        "model": model,
        "features": X.columns.tolist(),
        "target": TARGET_COLUMN,
        "metrics": {},
    }, MODEL_PATH)
    print(json.dumps({"model_path": str(MODEL_PATH), "features": X.columns.tolist()}))


if __name__ == "__main__":
    main()
