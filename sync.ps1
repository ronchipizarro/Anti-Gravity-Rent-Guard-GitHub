# RentGuard Sync Script
# This script pulls the latest changes, commits your work, and pushes to GitHub.

Write-Host "--- 🔄 Starting Sync ---" -ForegroundColor Cyan

# 1. Pull latest changes
Write-Host "📥 Pulling latest changes from GitHub..." -ForegroundColor Yellow
git pull origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Warning: Pull failed. You might have conflicts to resolve." -ForegroundColor Red
}

# 2. Stage changes
Write-Host "🚀 Staging all changes..." -ForegroundColor Yellow
git add .

# 3. Commit changes
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$message = "Update: $timestamp"
Write-Host "📝 Committing changes: '$message'..." -ForegroundColor Yellow
git commit -m "$message"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ℹ️ Info: No changes to commit." -ForegroundColor Cyan
}

# 4. Push changes
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Sync Complete! Your work is safe on GitHub." -ForegroundColor Green
} else {
    Write-Host "❌ Push failed. Check your internet connection or git status." -ForegroundColor Red
}

Write-Host "--- 🏁 Finished ---" -ForegroundColor Cyan
