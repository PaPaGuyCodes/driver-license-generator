# Run as Administrator
# This script installs OpenJDK, Gradle, and Python using Chocolatey if available,
# otherwise attempts to use winget. It does not execute without user consent.

function Install-With-Choco {
    param([string]$package)
    choco install $package -y
}

function Install-With-Winget {
    param([string]$package)
    winget install --silent --accept-source-agreements --accept-package-agreements $package
}

# Detect package manager
$hasChoco = Get-Command choco -ErrorAction SilentlyContinue
$hasWinget = Get-Command winget -ErrorAction SilentlyContinue

if (-not $hasChoco -and -not $hasWinget) {
    Write-Host "Neither Chocolatey nor winget found. Please install one of them or install the required tools manually." -ForegroundColor Yellow
    Write-Host "Manual install links:" -ForegroundColor Cyan
    Write-Host "OpenJDK (Temurin): https://adoptium.net/"
    Write-Host "Gradle: https://gradle.org/install/"
    Write-Host "Python: https://www.python.org/downloads/"
    exit 1
}

# Install OpenJDK (Temurin)
if ($hasChoco) {
    Write-Host "Installing Temurin JDK via Chocolatey..." -ForegroundColor Green
    Install-With-Choco temurin
} else {
    Write-Host "Installing Temurin JDK via winget..." -ForegroundColor Green
    Install-With-Winget EclipseAdoptium.Temurin.17.JDK
}

# Install Gradle
if ($hasChoco) {
    Write-Host "Installing Gradle via Chocolatey..." -ForegroundColor Green
    Install-With-Choco gradle
} else {
    Write-Host "Installing Gradle via winget..." -ForegroundColor Green
    $gradlePackageId = 'Gradle.Gradle'
    $gradleSearch = winget search --id $gradlePackageId 2>$null | Select-String -Pattern $gradlePackageId
    if ($gradleSearch) {
        Install-With-Winget $gradlePackageId
    } else {
        Write-Host "Gradle package not found in winget. Please install Gradle manually from https://gradle.org/install/" -ForegroundColor Yellow
    }
}

# Install Python
if ($hasChoco) {
    Write-Host "Installing Python via Chocolatey..." -ForegroundColor Green
    Install-With-Choco python
} else {
    Write-Host "Installing Python via winget..." -ForegroundColor Green
    Install-With-Winget Python.Python.3.11
}

Write-Host "Installation steps completed. You may need to restart your shell to pick up PATH changes." -ForegroundColor Cyan
Write-Host "Then run in project root: .\gradlew run (if wrapper present) or gradle -p backend/src run" -ForegroundColor Cyan
