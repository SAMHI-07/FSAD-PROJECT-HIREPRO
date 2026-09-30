from __future__ import annotations
import argparse
import json
import joblib
import pandas as pd
from config import MODEL_PATH, PRODUCTION_DATA, TARGET_COLUMN

def predict(data: pd.DataFrame, bundle):
    model = bundle["model"]
    missing = sorted(set(bundle["features"]) - set(data.columns))
    if missing: raise ValueError(f"Missing model features: {missing}")
    X = data[bundle["features"]]
    labels = model.predict(X)
    probabilities = model.predict_proba(X)[:, 1].tolist() if hasattr(model, "predict_proba") else None
    return [{"prediction": value.item() if hasattr(value, "item") else value, "probability": probabilities[i] if probabilities else None} for i, value in enumerate(labels)]

if __name__ == "__main__":
    parser = argparse.ArgumentParser(); parser.add_argument("--data", default=str(PRODUCTION_DATA)); parser.add_argument("--model", default=str(MODEL_PATH)); parser.add_argument("--output"); args = parser.parse_args()
    frame = pd.read_csv(args.data); frame = frame.drop(columns=[TARGET_COLUMN], errors="ignore"); result = predict(frame, joblib.load(args.model))
    text = json.dumps(result, indent=2); print(text)
    if args.output: open(args.output, "w", encoding="utf-8").write(text)
