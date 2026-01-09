# PowerShell script to clean and rebuild the project

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Cleaning FreexStore Frontend  " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Remove node_modules
if (Test-Path "node_modules") {
    Write-Host "Removing node_modules..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "✓ node_modules removed" -ForegroundColor Green
}

# Remove .next build cache
if (Test-Path ".next") {
    Write-Host "Removing .next build cache..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".next"
    Write-Host "✓ .next removed" -ForegroundColor Green
}

# Clear package-lock.json
if (Test-Path "package-lock.json") {
    Write-Host "Removing package-lock.json..." -ForegroundColor Yellow
    Remove-Item "package-lock.json"
    Write-Host "✓ package-lock.json removed" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  IMPORTANT BROWSER INSTRUCTIONS  " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open your browser" -ForegroundColor White
Write-Host "2. Press Ctrl+Shift+Delete to clear cache" -ForegroundColor White
Write-Host "3. OR:" -ForegroundColor White
Write-Host "   - Open DevTools (F12)" -ForegroundColor White
Write-Host "   - Right-click refresh button" -ForegroundColor White
Write-Host "   - Select 'Empty Cache and Hard Reload'" -ForegroundColor White
Write-Host "4. Close all browser tabs for localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Dependencies installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "  Ready to start!  " -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Run: npm run dev" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    Write-Host "Please check your internet connection and try again" -ForegroundColor Red
    Write-Host ""
}
