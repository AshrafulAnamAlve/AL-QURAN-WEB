Add-Type -AssemblyName System.Drawing
$iconPath = "F:\API\AL-Quran\frontend\public\icons\icon-512x512.png"
$icon = [System.Drawing.Image]::FromFile($iconPath)

function Make-Splash($w, $h, $outPath) {
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    
    # Fill deep emerald background #061a14
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(6, 26, 20))
    $g.FillRectangle($brush, 0, 0, $w, $h)
    $brush.Dispose()

    # Draw centered icon at ~35% of min dimension
    $iconSize = [Math]::Min($w, $h) * 0.40
    $x = ($w - $iconSize) / 2
    $y = ($h - $iconSize) / 2
    $g.DrawImage($icon, $x, $y, $iconSize, $iconSize)
    $g.Dispose()

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

$splashConfigs = @(
    @{ folder = 'drawable'; w = 480; h = 800 },
    @{ folder = 'drawable-port-mdpi'; w = 320; h = 480 },
    @{ folder = 'drawable-port-hdpi'; w = 480; h = 800 },
    @{ folder = 'drawable-port-xhdpi'; w = 720; h = 1280 },
    @{ folder = 'drawable-port-xxhdpi'; w = 960; h = 1600 },
    @{ folder = 'drawable-port-xxxhdpi'; w = 1280; h = 1920 },
    @{ folder = 'drawable-land-mdpi'; w = 480; h = 320 },
    @{ folder = 'drawable-land-hdpi'; w = 800; h = 480 },
    @{ folder = 'drawable-land-xhdpi'; w = 1280; h = 720 },
    @{ folder = 'drawable-land-xxhdpi'; w = 1600; h = 960 },
    @{ folder = 'drawable-land-xxxhdpi'; w = 1920; h = 1280 }
)

foreach ($s in $splashConfigs) {
    $dir = Join-Path 'F:\API\AL-Quran\mobile\android\app\src\main\res' $s.folder
    if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    Make-Splash $s.w $s.h (Join-Path $dir 'splash.png')
    Write-Host "Generated splash for $($s.folder)"
}
$icon.Dispose()
Write-Host "All Splash screens generated successfully!"
