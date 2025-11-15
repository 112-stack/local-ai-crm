# PowerShell Script to Create Executable Launcher with Icon
# This creates a standalone .exe file with custom icon

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "CRM Executable Launcher Creator" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator (recommended for compilation)
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "[WARNING] Not running as Administrator" -ForegroundColor Yellow
    Write-Host "If compilation fails, try running as Administrator" -ForegroundColor Yellow
    Write-Host ""
}

$scriptDir = $PSScriptRoot
$exePath = Join-Path $scriptDir "CRM-Launcher.exe"
$iconPath = Join-Path $scriptDir "app-icon.ico"
$batPath = Join-Path $scriptDir "auto-run.bat"

# Check if auto-run.bat exists
if (-not (Test-Path $batPath)) {
    Write-Host "[ERROR] auto-run.bat not found!" -ForegroundColor Red
    Write-Host "Expected path: $batPath" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "[OK] Found auto-run.bat" -ForegroundColor Green

# Check if icon exists
$hasIcon = Test-Path $iconPath
if ($hasIcon) {
    Write-Host "[OK] Found app-icon.ico" -ForegroundColor Green
} else {
    Write-Host "[WARNING] app-icon.ico not found. Executable will use default icon." -ForegroundColor Yellow
    Write-Host "Run create-icon.ps1 to create an icon first." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Creating C# launcher code..." -ForegroundColor Cyan

# Create C# source code for the launcher
$csharpCode = @"
using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

namespace CRMLauncher
{
    class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            try
            {
                string exeDir = AppDomain.CurrentDomain.BaseDirectory;
                string batFile = Path.Combine(exeDir, "auto-run.bat");

                if (!File.Exists(batFile))
                {
                    MessageBox.Show(
                        "auto-run.bat not found!\n\nExpected location:\n" + batFile,
                        "CRM Launcher - Error",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                    return;
                }

                ProcessStartInfo startInfo = new ProcessStartInfo
                {
                    FileName = batFile,
                    WorkingDirectory = exeDir,
                    UseShellExecute = true
                };

                Process.Start(startInfo);
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    "Failed to start CRM application:\n\n" + ex.Message,
                    "CRM Launcher - Error",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }
    }
}
"@

# Save C# code to temporary file
$csPath = Join-Path $env:TEMP "CRMLauncher.cs"
$csharpCode | Out-File -FilePath $csPath -Encoding UTF8

Write-Host "[OK] C# source code created" -ForegroundColor Green
Write-Host ""
Write-Host "Compiling executable..." -ForegroundColor Cyan

# Find C# compiler
$cscPath = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if (-not (Test-Path $cscPath)) {
    # Try 32-bit version
    $cscPath = "C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"
}

if (-not (Test-Path $cscPath)) {
    Write-Host "[ERROR] C# compiler not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "The .NET Framework compiler is required." -ForegroundColor Yellow
    Write-Host "Please install .NET Framework 4.0 or later." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternative: Use ps2exe (PowerShell to EXE converter)" -ForegroundColor Cyan
    Write-Host "  Install-Module -Name ps2exe" -ForegroundColor White
    Write-Host "  Invoke-ps2exe .\auto-run.bat .\CRM-Launcher.exe" -ForegroundColor White
    Write-Host ""
    pause
    exit 1
}

Write-Host "[OK] Found C# compiler: $cscPath" -ForegroundColor Green

# Compile with or without icon
$compileArgs = @(
    "/target:winexe",
    "/out:`"$exePath`"",
    "/platform:anycpu",
    "/reference:System.Windows.Forms.dll",
    "/reference:System.Drawing.dll"
)

if ($hasIcon) {
    $compileArgs += "/win32icon:`"$iconPath`""
}

$compileArgs += "`"$csPath`""

try {
    & $cscPath $compileArgs 2>&1 | Out-String | Write-Host

    if (Test-Path $exePath) {
        Write-Host ""
        Write-Host "=================================" -ForegroundColor Green
        Write-Host "[OK] Executable created successfully!" -ForegroundColor Green
        Write-Host "=================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Location: $exePath" -ForegroundColor Cyan
        Write-Host "Size: $([Math]::Round((Get-Item $exePath).Length / 1KB, 2)) KB" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "You can now:" -ForegroundColor Yellow
        Write-Host "  1. Double-click CRM-Launcher.exe to start the application" -ForegroundColor White
        Write-Host "  2. Create a desktop shortcut to CRM-Launcher.exe" -ForegroundColor White
        Write-Host "  3. Pin it to taskbar for quick access" -ForegroundColor White
        Write-Host ""

        # Ask if user wants to create desktop shortcut
        $createShortcut = Read-Host "Create desktop shortcut? (Y/N)"
        if ($createShortcut -eq "Y" -or $createShortcut -eq "y") {
            $desktopPath = [Environment]::GetFolderPath("Desktop")
            $shortcutPath = Join-Path $desktopPath "CRM Business Predictor.lnk"

            $WScriptShell = New-Object -ComObject WScript.Shell
            $shortcut = $WScriptShell.CreateShortcut($shortcutPath)
            $shortcut.TargetPath = $exePath
            $shortcut.WorkingDirectory = $scriptDir
            $shortcut.Description = "React CRM Business Predictor"
            if ($hasIcon) {
                $shortcut.IconLocation = $iconPath
            }
            $shortcut.Save()

            Write-Host "[OK] Desktop shortcut created!" -ForegroundColor Green
            Write-Host "Location: $shortcutPath" -ForegroundColor Cyan
        }
    } else {
        Write-Host "[ERROR] Compilation failed. Executable not created." -ForegroundColor Red
    }
} catch {
    Write-Host "[ERROR] Compilation error: $_" -ForegroundColor Red
}

# Cleanup
Remove-Item $csPath -ErrorAction SilentlyContinue

Write-Host ""
pause
