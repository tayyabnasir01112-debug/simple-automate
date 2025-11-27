param(
  [string]$ProjectName = "simpleautomate",
  [string]$Region = "eu-central-1",
  [string]$Database = "simpleautomate"
)

if (-not (Get-Command neonctl -ErrorAction SilentlyContinue)) {
  throw "Neon CLI (neonctl) not installed. See https://neon.tech/docs/reference/neon-cli"
}

Write-Host "`n🔐 Authenticating with Neon..." -ForegroundColor Cyan
neonctl auth switch

Write-Host "🆕 Creating project $ProjectName in $Region..."
$project = neonctl projects create --name $ProjectName --region $Region --output json | ConvertFrom-Json
$projectId = $project.id

Write-Host "📦 Creating branch main..."
neonctl branches create --project-id $projectId --name main --output json | Out-Null

$connection = neonctl connection-string get `
  --project-id $projectId `
  --branch-name main `
  --database-name $Database `
  --output json | ConvertFrom-Json

Write-Host "`nSave this DATABASE_URL in Render and locally:" -ForegroundColor Yellow
Write-Host $connection.value

