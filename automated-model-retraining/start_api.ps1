$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$python = Join-Path $projectRoot ".venv\Scripts\python.exe"
$model = Join-Path $projectRoot "models\model.pkl"
if (-not (Test-Path $model)) { throw "Train a model first: .venv\Scripts\python.exe src\train.py" }
$listener = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
if ($listener) { Write-Output "Prediction API is already listening on http://127.0.0.1:8000"; exit 0 }
$arguments = "-m uvicorn api.main:app --host 127.0.0.1 --port 8000 --workers 1"
Start-Process -FilePath $python -ArgumentList $arguments -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $projectRoot "api-server.out.log") -RedirectStandardError (Join-Path $projectRoot "api-server.err.log")
for ($i = 0; $i -lt 30; $i++) {
  try { Invoke-WebRequest -Uri "http://127.0.0.1:8000/health" -TimeoutSec 2 | Out-Null; Write-Output "Prediction API is ready at http://127.0.0.1:8000"; exit 0 } catch { Start-Sleep -Seconds 1 }
}
throw "Prediction API did not start. See api-server.err.log."
