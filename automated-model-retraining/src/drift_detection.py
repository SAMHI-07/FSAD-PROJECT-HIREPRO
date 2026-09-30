from __future__ import annotations
import argparse
import json
import math
from pathlib import Path
import joblib
import pandas as pd
from config import DRIFT_THRESHOLD, MLFLOW_TRACKING_URI, PRODUCTION_DATA, REFERENCE_DATA, REPORT_PATH, TARGET_COLUMN


def psi(reference: pd.Series, current: pd.Series, bins: int = 10) -> float:
    """Population stability index for one numeric or categorical column."""
    ref = reference.dropna(); cur = current.dropna()
    if ref.empty or cur.empty: return 0.0
    if pd.api.types.is_numeric_dtype(ref):
        edges = sorted(set(float(x) for x in ref.quantile([i / bins for i in range(bins + 1)])))
        if len(edges) < 2: return 0.0
        edges[0], edges[-1] = -math.inf, math.inf
        a = pd.cut(ref, edges, include_lowest=True).value_counts(normalize=True, sort=False)
        b = pd.cut(cur, edges, include_lowest=True).value_counts(normalize=True, sort=False).reindex(a.index, fill_value=0)
    else:
        levels = sorted(set(ref.astype(str)) | set(cur.astype(str)))
        a = ref.astype(str).value_counts(normalize=True).reindex(levels, fill_value=0)
        b = cur.astype(str).value_counts(normalize=True).reindex(levels, fill_value=0)
    eps = 1e-6
    return float(sum((q-p) * math.log((q+eps)/(p+eps)) for p, q in zip(a, b)))


def detect(reference_path=REFERENCE_DATA, production_path=PRODUCTION_DATA, target=TARGET_COLUMN, threshold=DRIFT_THRESHOLD, report_path=REPORT_PATH):
    reference = pd.read_csv(reference_path); production = pd.read_csv(production_path)
    features = [c for c in reference.columns if c != target]
    missing = sorted(set(features) - set(production.columns))
    if missing: raise ValueError(f"Production data is missing reference feature columns: {missing}")
    # Keep the PSI decision stable, and also emit Evidently's standard visual report.
    report_path.parent.mkdir(parents=True, exist_ok=True)
    evidently_report = report_path.with_name("evidently_drift_report.html")
    try:
        from evidently import Report
        from evidently.presets import DataDriftPreset
        native_report = Report([DataDriftPreset(method="psi")])
        evaluation = native_report.run(reference_data=reference[features], current_data=production[features])
        evaluation.save_html(str(evidently_report))
    except Exception as exc:
        print(f"Evidently report unavailable; custom PSI report will be used: {exc}")
    scores = {column: psi(reference[column], production[column]) for column in features}
    drifted = [column for column, score in scores.items() if score >= threshold]
    share = len(drifted) / max(len(features), 1)
    result = {"reference_rows": len(reference), "production_rows": len(production), "threshold": threshold, "feature_psi": scores, "drifted_features": drifted, "drift_score": share, "drift_detected": share >= threshold}
    report_path.parent.mkdir(parents=True, exist_ok=True)
    rows = "".join(f"<tr><td>{c}</td><td>{v:.4f}</td><td>{'DRIFT' if v >= threshold else 'OK'}</td></tr>" for c, v in scores.items())
    report_path.write_text(f"""<!doctype html><html><head><meta charset='utf-8'><title>Drift report</title><style>body{{font:16px system-ui;max-width:900px;margin:3rem auto;color:#182230}}table{{border-collapse:collapse;width:100%}}td,th{{padding:.7rem;border-bottom:1px solid #ddd;text-align:left}}.score{{font-size:2rem}}</style></head><body><h1>Production data drift report</h1><p class='score'>{share:.1%} feature drift</p><p>Decision threshold: {threshold:.0%} of features with PSI ≥ {threshold}. Overall drift: <b>{'DETECTED' if result['drift_detected'] else 'within threshold'}</b></p><p>Reference: {len(reference)} rows · Production: {len(production)} rows</p><table><tr><th>Feature</th><th>PSI</th><th>Status</th></tr>{rows}</table></body></html>""", encoding="utf-8")
    print(json.dumps(result, indent=2))
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(); parser.add_argument("--threshold", type=float, default=DRIFT_THRESHOLD); args = parser.parse_args()
    result = detect(threshold=args.threshold)
    raise SystemExit(1 if result["drift_detected"] else 0)







