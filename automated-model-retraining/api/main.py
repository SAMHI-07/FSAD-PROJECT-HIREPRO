from __future__ import annotations
from pathlib import Path
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = Path(__import__('os').getenv("MODEL_PATH", ROOT / "models/model.pkl"))
app = FastAPI(title="Drift-aware model API", version="1.0.0")
class PredictionRequest(BaseModel):
    records: list[dict]
@app.get("/health")
def health(): return {"status": "ok", "model_loaded": MODEL_PATH.exists()}
@app.post("/predict")
def predict(request: PredictionRequest):
    if not MODEL_PATH.exists(): raise HTTPException(status_code=503, detail="Model is not trained yet")
    bundle=joblib.load(MODEL_PATH); frame=pd.DataFrame(request.records); missing=sorted(set(bundle["features"])-set(frame.columns))
    if missing: raise HTTPException(status_code=422, detail=f"Missing features: {missing}")
    X=frame[bundle["features"]]; labels=bundle["model"].predict(X); probs=bundle["model"].predict_proba(X)[:,1] if hasattr(bundle["model"],"predict_proba") else [None]*len(labels)
    return {"predictions":[{"prediction":v.item() if hasattr(v,"item") else v,"probability":None if p is None else float(p)} for v,p in zip(labels,probs)]}
