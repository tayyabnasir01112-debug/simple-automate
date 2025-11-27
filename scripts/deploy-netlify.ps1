param(
  [string]$SiteName = "simpleautomate-web",
  [string]$Team = "",
  [switch]$SkipBuild
)

Write-Host "`n🚀 Deploying SimpleAutomate client to Netlify..." -ForegroundColor Cyan

if (-not (Get-Command netlify -ErrorAction SilentlyContinue)) {
  throw "Netlify CLI not found. Install it with 'npm install -g netlify-cli'."
}

netlify status > $null 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "Logging in to Netlify..."
  netlify login
}

Push-Location "$PSScriptRoot/../client"

if (-not $SkipBuild) {
  npm install
  npm run build
}

$initArgs = @("--manual", "--name", $SiteName)
if ($Team) {
  $initArgs += @("--team", $Team)
}

Write-Host "Linking site $SiteName..."
netlify init @initArgs

if ($env:VITE_API_URL) {
  netlify env:set VITE_API_URL $env:VITE_API_URL
}

if ($env:VITE_APP_URL) {
  netlify env:set VITE_APP_URL $env:VITE_APP_URL
}

netlify deploy --dir "dist" --prod

Pop-Location
Write-Host "✅ Netlify deployment completed." -ForegroundColor Green

