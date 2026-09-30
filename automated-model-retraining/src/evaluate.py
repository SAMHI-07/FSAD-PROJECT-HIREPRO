from __future__ import annotations
import argparse
import json
from pathlib import Path
import joblib
import pandas as pd
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, roc_auc_score
from config import MODEL_PATH, PRODUCTION_DATA, TARGET_COLUMN

def evaluate(model_path: Path, data_path: Path, target=TARGET_COLUMN):
    frame = pd.read_csv(data_path)
    if target not in frame: raise ValueError(f"Evaluation data needs labeled target column {target!r}")
    bundle = joblib.load(model_path); model=bundle["model"]; X=frame[bundle["features"]]; y=frame[target]; pred=model.predict(X)
    metrics={"accuracy":float(accuracy_score(y,pred)),"precision":float(precision_score(y,pred,zero_division=0)),"recall":float(recall_score(y,pred,zero_division=0)),"f1":float(f1_score(y,pred,zero_division=0))}
    if hasattr(model,"predict_proba") and y.nunique()==2: metrics["roc_auc"]=float(roc_auc_score(y,model.predict_proba(X)[:,1]))
    print(json.dumps(metrics,indent=2)); return metrics
if __name__=="__main__":
    parser=argparse.ArgumentParser();parser.add_argument("--model",type=Path,default=MODEL_PATH);parser.add_argument("--data",type=Path,default=PRODUCTION_DATA);args=parser.parse_args();evaluate(args.model,args.data)
