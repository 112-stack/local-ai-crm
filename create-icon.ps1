# PowerShell Script to Create Icon from SVG
# This script helps convert the SVG icon to ICO format

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "CRM Icon Creator" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$svgPath = Join-Path $PSScriptRoot "app-icon.svg"
$icoPath = Join-Path $PSScriptRoot "app-icon.ico"

if (-not (Test-Path $svgPath)) {
    Write-Host "[ERROR] app-icon.svg not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please ensure app-icon.svg exists in the current directory." -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "[INFO] SVG icon found: $svgPath" -ForegroundColor Green
Write-Host ""

# Method 1: Try using ImageMagick if available
$magickPath = Get-Command "magick" -ErrorAction SilentlyContinue

if ($magickPath) {
    Write-Host "[INFO] ImageMagick found. Converting SVG to ICO..." -ForegroundColor Green
    try {
        & magick convert -background none -density 256 $svgPath -define icon:auto-resize=256,128,64,48,32,16 $icoPath
        if (Test-Path $icoPath) {
            Write-Host "[OK] Icon created successfully: $icoPath" -ForegroundColor Green
            Write-Host ""
            exit 0
        }
    } catch {
        Write-Host "[WARNING] ImageMagick conversion failed: $_" -ForegroundColor Yellow
    }
}

# Method 2: Provide alternative instructions
Write-Host "=================================" -ForegroundColor Yellow
Write-Host "Manual Icon Creation Required" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "ImageMagick is not installed. Please use one of these methods:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 1: Install ImageMagick" -ForegroundColor Cyan
Write-Host "  1. Download from: https://imagemagick.org/script/download.php#windows" -ForegroundColor White
Write-Host "  2. Install and add to PATH" -ForegroundColor White
Write-Host "  3. Run this script again" -ForegroundColor White
Write-Host ""
Write-Host "Option 2: Use Online Converter" -ForegroundColor Cyan
Write-Host "  1. Visit: https://convertio.co/svg-ico/" -ForegroundColor White
Write-Host "  2. Upload: $svgPath" -ForegroundColor White
Write-Host "  3. Convert and download as app-icon.ico" -ForegroundColor White
Write-Host "  4. Save to: $PSScriptRoot" -ForegroundColor White
Write-Host ""
Write-Host "Option 3: Use GIMP (Free)" -ForegroundColor Cyan
Write-Host "  1. Download GIMP from: https://www.gimp.org/" -ForegroundColor White
Write-Host "  2. Open app-icon.svg" -ForegroundColor White
Write-Host "  3. Export as .ico file (256x256)" -ForegroundColor White
Write-Host ""

# Create a simple fallback icon using PowerShell (bitmap-based)
Write-Host "Creating a simple fallback icon..." -ForegroundColor Cyan

# Note: This is a basic implementation - for production, use ImageMagick or professional tools
Add-Type -AssemblyName System.Drawing

try {
    # Create a 256x256 bitmap
    $bitmap = New-Object System.Drawing.Bitmap 256, 256
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

    # Set high quality rendering
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Background - rounded rectangle (simplified)
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(59, 130, 246))
    $graphics.FillEllipse($brush, 0, 0, 256, 256)

    # White document
    $whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $graphics.FillRectangle($whiteBrush, 68, 58, 120, 140)

    # Blue bar
    $blueBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(59, 130, 246))
    $graphics.FillRectangle($blueBrush, 83, 148, 20, 35)

    # Green bar
    $greenBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(16, 185, 129))
    $graphics.FillRectangle($greenBrush, 113, 128, 20, 55)

    # Orange bar
    $orangeBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(245, 158, 11))
    $graphics.FillRectangle($orangeBrush, 143, 158, 20, 25)

    # Save as PNG first
    $pngPath = Join-Path $PSScriptRoot "app-icon-temp.png"
    $bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

    Write-Host "[OK] Temporary PNG created: $pngPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "[INFO] You can use this PNG to create an ICO file using online tools." -ForegroundColor Cyan

    $graphics.Dispose()
    $bitmap.Dispose()

} catch {
    Write-Host "[ERROR] Failed to create fallback icon: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "1. Create app-icon.ico using one of the methods above" -ForegroundColor White
Write-Host "2. Run create-exe.ps1 to build the executable launcher" -ForegroundColor White
Write-Host ""

pause
