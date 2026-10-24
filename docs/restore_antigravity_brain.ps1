# RSBK Online — Antigravity Brain Context Restore Script (PowerShell)
# Author: Dr. Milind Chatrabhuji / Antigravity
# Usage: Run this script on your home laptop in PowerShell:
#        powershell -ExecutionPolicy Bypass -File docs\restore_antigravity_brain.ps1

$ConversationId = "b499811b-2f39-4e2b-957c-38857550e8c0"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ZipPath = Join-Path $ScriptDir "brain_backup\rsbk_brain_full_backup.zip"
$TargetDir = Join-Path $env:USERPROFILE ".gemini\antigravity\brain\$ConversationId"

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host " RSBK Online — Restoring Antigravity Conversation Context" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host " Source archive : $ZipPath"
Write-Host " Target folder  : $TargetDir"
Write-Host ""

if (-not (Test-Path $ZipPath)) {
    Write-Host " Error: Archive not found at $ZipPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
}

Write-Host " Extracting files... (this may take a few moments)" -ForegroundColor Yellow
try {
    Expand-Archive -Path $ZipPath -DestinationPath $TargetDir -Force
    Write-Host ""
    Write-Host " SUCCESS! Context fully restored." -ForegroundColor Green
    Write-Host " Conversation ID : $ConversationId" -ForegroundColor Green
    Write-Host " Target Path     : $TargetDir" -ForegroundColor Green
    Write-Host " You can now resume your Antigravity session on this laptop without starting from scratch!" -ForegroundColor Green
    Write-Host "==================================================================" -ForegroundColor Cyan
} catch {
    Write-Host " Extraction failed: $_" -ForegroundColor Red
    exit 1
}
