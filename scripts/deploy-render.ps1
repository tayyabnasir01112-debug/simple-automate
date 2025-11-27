param(
  [string]$BlueprintPath = "$PSScriptRoot/../render.yaml"
)

Write-Host "`n🚀 Applying Render blueprint..." -ForegroundColor Cyan

if (-not (Test-Path $BlueprintPath)) {
  throw "Blueprint file not found at $BlueprintPath"
}

if (-not (Get-Command render -ErrorAction SilentlyContinue)) {
  throw "Render CLI not installed. Install it from https://render.com/docs/cli"
}

render login
render blueprint apply $BlueprintPath --yes

Write-Host "✅ Render deployment triggered." -ForegroundColor Green

