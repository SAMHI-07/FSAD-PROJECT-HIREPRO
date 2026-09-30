import os
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
os.environ.setdefault("MLFLOW_TRACKING_URI", "file:" + str(ROOT / "mlruns"))
from config import MODEL_PATH, REFERENCE_DATA
from train import train

def test_training_creates_predictive_model(tmp_path):
    output=tmp_path/"model.pkl"
    model,metrics=train(REFERENCE_DATA,output)
    assert output.exists()
    assert 0 <= metrics["f1"] <= 1
    assert model.predict(__import__("pandas").read_csv(REFERENCE_DATA).drop(columns=["churned"]).head(2)).shape == (2,)
