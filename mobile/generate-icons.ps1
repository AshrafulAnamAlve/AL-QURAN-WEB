Add-Type -AssemblyName System.Drawing
$srcPath = "F:\API\AL-Quran\frontend\public\icons\icon-512x512.png"
$src = [System.Drawing.Image]::FromFile($srcPath)

function Resize-Image($img, $w, $h, $outPath) {
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

$configs = @(
    @{ folder = 'mipmap-mdpi'; size = 48; fgSize = 108 },
    @{ folder = 'mipmap-hdpi'; size = 72; fgSize = 162 },
    @{ folder = 'mipmap-xhdpi'; size = 96; fgSize = 216 },
    @{ folder = 'mipmap-xxhdpi'; size = 144; fgSize = 324 },
    @{ folder = 'mipmap-xxxhdpi'; size = 192; fgSize = 432 }
)

foreach ($c in $configs) {
    $dir = Join-Path 'F:\API\AL-Quran\mobile\android\app\src\main\res' $c.folder
    Resize-Image $src $c.size $c.size (Join-Path $dir 'ic_launcher.png')
    Resize-Image $src $c.size $c.size (Join-Path $dir 'ic_launcher_round.png')
    Resize-Image $src $c.fgSize $c.fgSize (Join-Path $dir 'ic_launcher_foreground.png')
    Write-Host "Generated icons for $($c.folder)"
}
$src.Dispose()
Write-Host "All Android App Icons generated successfully!"
