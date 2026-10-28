Add-Type -AssemblyName System.Drawing
$srcPath = "F:\API\AL-Quran\frontend\public\icons\icon-192x192.png"
$src = [System.Drawing.Image]::FromFile($srcPath)

function Resize-Image($img, $w, $h, $outPath) {
    $parent = Split-Path -Parent $outPath
    if (-not (Test-Path $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }
    $dest = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($img, 0, 0, $w, $h)
    $g.Dispose()
    $dest.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Dispose()
}

$base = "F:\API\AL-Quran\mobile\android\app\src\main\res"
Resize-Image $src 48 48 (Join-Path $base "drawable\ic_stat_quran.png")
Resize-Image $src 24 24 (Join-Path $base "drawable-mdpi\ic_stat_quran.png")
Resize-Image $src 36 36 (Join-Path $base "drawable-hdpi\ic_stat_quran.png")
Resize-Image $src 48 48 (Join-Path $base "drawable-xhdpi\ic_stat_quran.png")
Resize-Image $src 72 72 (Join-Path $base "drawable-xxhdpi\ic_stat_quran.png")
Resize-Image $src 96 96 (Join-Path $base "drawable-xxxhdpi\ic_stat_quran.png")

$src.Dispose()
Write-Host "ic_stat_quran generated successfully!"
