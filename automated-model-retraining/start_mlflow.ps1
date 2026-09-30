$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$python = Join-Path $projectRoot ".venv\Scripts\python.exe"
$mlflow = Join-Path $projectRoot ".venv\Scripts\mlflow.exe"
if (-not (Test-Path $mlflow)) { throw "Install project dependencies first: .venv\Scripts\python.exe -m pip install -r requirements.txt" }
$listener = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue
if ($listener) { Write-Output "MLflow is already listening on http://127.0.0.1:5000"; exit 0 }
$db = (Join-Path $projectRoot "mlflow.db").Replace('\','/')
$artifacts = (Join-Path $projectRoot "mlartifacts").Replace('\','/')
New-Item -ItemType Directory -Force -Path (Join-Path $projectRoot "mlartifacts") | Out-Null
$storeUri = "sqlite:///" + $db
$artifactUri = "file:///" + $artifacts
$arguments = "-m mlflow server --backend-store-uri `"$storeUri`" --default-artifact-root `"$artifactUri`" --host 127.0.0.1 --port 5000 --workers 1"
Start-Process -FilePath $python -ArgumentList $arguments -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $projectRoot "mlflow-server.out.log") -RedirectStandardError (Join-Path $projectRoot "mlflow-server.err.log")
for ($i = 0; $i -lt 30; $i++) {
  try { Invoke-WebRequest -Uri "http://127.0.0.1:5000/health" -TimeoutSec 2 | Out-Null; Write-Output "MLflow is ready at http://127.0.0.1:5000"; exit 0 } catch { Start-Sleep -Seconds 1 }
}
throw "MLflow did not start. See mlflow-server.err.log."




