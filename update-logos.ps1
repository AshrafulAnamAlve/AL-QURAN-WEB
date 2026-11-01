Add-Type -AssemblyName System.Drawing

$repoRoot = "F:\API\AL-Quran"
$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

# 1. Master Full Icon SVG (with squircle background)
$svgMaster = @'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#14603c"/>
      <stop offset="100%" stop-color="#08301d"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fae29c"/>
      <stop offset="50%" stop-color="#d4af37"/>
      <stop offset="100%" stop-color="#997517"/>
    </linearGradient>
    <linearGradient id="pages" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#e8e2d0"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Background Squircle -->
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>

  <!-- Islamic 8-Pointed Star (Rub el Hizb) Background Motif -->
  <g transform="translate(256, 256) scale(185)" opacity="0.18" stroke="url(#gold)" stroke-width="0.04" fill="none">
    <rect x="-1" y="-1" width="2" height="2"/>
    <rect x="-1" y="-1" width="2" height="2" transform="rotate(45)"/>
  </g>

  <!-- Outer Gold Geometric Rings -->
  <circle cx="256" cy="256" r="218" stroke="url(#gold)" stroke-width="3" opacity="0.4" stroke-dasharray="8 6"/>
  <circle cx="256" cy="256" r="206" stroke="url(#gold)" stroke-width="2" opacity="0.6"/>

  <!-- Subtle Noor (Rays of Light) from center -->
  <g opacity="0.3" stroke="url(#gold)" stroke-width="2">
    <line x1="256" y1="90" x2="256" y2="120"/>
    <line x1="256" y1="392" x2="256" y2="422"/>
    <line x1="90" y1="256" x2="120" y2="256"/>
    <line x1="392" y1="256" x2="422" y2="256"/>
    <line x1="138" y1="138" x2="160" y2="160"/>
    <line x1="374" y1="138" x2="352" y2="160"/>
    <line x1="138" y1="374" x2="160" y2="352"/>
    <line x1="374" y1="374" x2="352" y2="352"/>
  </g>

  <!-- Top Crown: Crescent & 8-point Star -->
  <g transform="translate(256, 126) scale(0.85)">
    <path d="M-18 -12 C-7 -12 2 -3 2 9 C2 19 -5 27 -15 29 C-2 30 11 20 11 6 C11 -8 -1 -20 -18 -20 C-22 -20 -26 -19 -29 -17 C-26 -14 -22 -12 -18 -12 Z" fill="url(#gold)"/>
    <polygon points="12,2 14,7 19,7 15,10 17,15 12,12 7,15 9,10 5,7 10,7" fill="url(#gold)"/>
  </g>

  <!-- Wooden Rehal (X-Stand for Quran) at the bottom -->
  <g stroke="url(#gold)" stroke-width="14" stroke-linecap="round" stroke-linejoin="round">
    <path d="M165 315 L225 365 L180 405"/>
    <path d="M347 315 L287 365 L332 405"/>
    <circle cx="256" cy="365" r="7" fill="url(#gold)"/>
  </g>

  <!-- The Open Mushaf (Holy Quran) -->
  <g filter="url(#shadow)">
    <path d="M125 305 C185 285 240 300 256 312 C272 300 327 285 387 305 L392 230 C332 210 277 225 256 238 C235 225 180 210 120 230 Z" fill="#093621" stroke="url(#gold)" stroke-width="6"/>
    <path d="M130 292 C185 272 238 288 256 300 C274 288 327 272 382 292 L382 215 C327 195 274 212 256 224 C238 212 185 195 130 215 Z" fill="url(#pages)"/>
    <g stroke="#c7bfab" stroke-width="3" stroke-linecap="round" opacity="0.8">
      <line x1="160" y1="230" x2="230" y2="238"/>
      <line x1="155" y1="246" x2="235" y2="254"/>
      <line x1="158" y1="262" x2="232" y2="270"/>
      <line x1="162" y1="278" x2="228" y2="284"/>
    </g>
    <g stroke="#c7bfab" stroke-width="3" stroke-linecap="round" opacity="0.8">
      <line x1="282" y1="238" x2="352" y2="230"/>
      <line x1="277" y1="254" x2="357" y2="246"/>
      <line x1="280" y1="270" x2="354" y2="262"/>
      <line x1="284" y1="284" x2="350" y2="278"/>
    </g>
    <path d="M256 224 L256 302" stroke="url(#gold)" stroke-width="5" stroke-linecap="round"/>
    <path d="M256 300 C256 330 248 350 252 380 L256 370 L260 380 C264 350 256 330 256 300" fill="url(#gold)"/>
  </g>
</svg>
'@

# 2. Transparent Foreground SVG for Android Adaptive Icons (centered in safe-zone)
$svgForeground = @'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fae29c"/>
      <stop offset="50%" stop-color="#d4af37"/>
      <stop offset="100%" stop-color="#997517"/>
    </linearGradient>
    <linearGradient id="pages" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#e8e2d0"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <g transform="translate(0, 0)">
    <!-- Top Crown: Crescent & 8-point Star -->
    <g transform="translate(256, 126) scale(0.85)">
      <path d="M-18 -12 C-7 -12 2 -3 2 9 C2 19 -5 27 -15 29 C-2 30 11 20 11 6 C11 -8 -1 -20 -18 -20 C-22 -20 -26 -19 -29 -17 C-26 -14 -22 -12 -18 -12 Z" fill="url(#gold)"/>
      <polygon points="12,2 14,7 19,7 15,10 17,15 12,12 7,15 9,10 5,7 10,7" fill="url(#gold)"/>
    </g>

    <!-- Wooden Rehal (X-Stand for Quran) -->
    <g stroke="url(#gold)" stroke-width="14" stroke-linecap="round" stroke-linejoin="round">
      <path d="M165 315 L225 365 L180 405"/>
      <path d="M347 315 L287 365 L332 405"/>
      <circle cx="256" cy="365" r="7" fill="url(#gold)"/>
    </g>

    <!-- The Open Mushaf -->
    <g filter="url(#shadow)">
      <path d="M125 305 C185 285 240 300 256 312 C272 300 327 285 387 305 L392 230 C332 210 277 225 256 238 C235 225 180 210 120 230 Z" fill="#093621" stroke="url(#gold)" stroke-width="6"/>
      <path d="M130 292 C185 272 238 288 256 300 C274 288 327 272 382 292 L382 215 C327 195 274 212 256 224 C238 212 185 195 130 215 Z" fill="url(#pages)"/>
      <g stroke="#c7bfab" stroke-width="3" stroke-linecap="round" opacity="0.8">
        <line x1="160" y1="230" x2="230" y2="238"/>
        <line x1="155" y1="246" x2="235" y2="254"/>
        <line x1="158" y1="262" x2="232" y2="270"/>
        <line x1="162" y1="278" x2="228" y2="284"/>
      </g>
      <g stroke="#c7bfab" stroke-width="3" stroke-linecap="round" opacity="0.8">
        <line x1="282" y1="238" x2="352" y2="230"/>
        <line x1="277" y1="254" x2="357" y2="246"/>
        <line x1="280" y1="270" x2="354" y2="262"/>
        <line x1="284" y1="284" x2="350" y2="278"/>
      </g>
      <path d="M256 224 L256 302" stroke="url(#gold)" stroke-width="5" stroke-linecap="round"/>
      <path d="M256 300 C256 330 248 350 252 380 L256 370 L260 380 C264 350 256 330 256 300" fill="url(#gold)"/>
    </g>
  </g>
</svg>
'@

# Save SVGs
Set-Content -Path "$repoRoot\frontend\public\icons\icon.svg" -Value $svgMaster -Encoding utf8
Set-Content -Path "$repoRoot\frontend\public\favicon.svg" -Value $svgMaster -Encoding utf8

# Helper to render SVG to PNG via Edge
function Render-SvgToPng($svg, $outPng) {
    $tempHtml = "$repoRoot\temp_render_wrapper.html"
    $html = @"
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; width: 512px; height: 512px; overflow: hidden; background: transparent; }
  svg { width: 512px; height: 512px; display: block; }
</style>
</head>
<body>
$svg
</body>
</html>
"@
    Set-Content -Path $tempHtml -Value $html -Encoding utf8
    Start-Process -FilePath $edgePath -ArgumentList "--headless", "--disable-gpu", "--hide-scrollbars", "--window-size=512,512", "--default-background-color=00000000", "--screenshot=$outPng", "file:///$($tempHtml.Replace('\', '/'))" -Wait
    Remove-Item $tempHtml -Force -ErrorAction SilentlyContinue
}

$rawMasterPng = "$repoRoot\raw_master.png"
$rawFgPng = "$repoRoot\raw_foreground.png"

Render-SvgToPng $svgMaster $rawMasterPng
Render-SvgToPng $svgForeground $rawFgPng

# Load bitmaps
$rawMaster = [System.Drawing.Image]::FromFile($rawMasterPng)
$masterImg = New-Object System.Drawing.Bitmap(512, 512)
$g = [System.Drawing.Graphics]::FromImage($masterImg)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.DrawImage($rawMaster, [System.Drawing.Rectangle]::new(0, 0, 512, 512), [System.Drawing.Rectangle]::new(0, 0, 512, 512), [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$rawMaster.Dispose()

$rawFg = [System.Drawing.Image]::FromFile($rawFgPng)
$fgImg = New-Object System.Drawing.Bitmap(512, 512)
$g = [System.Drawing.Graphics]::FromImage($fgImg)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.DrawImage($rawFg, [System.Drawing.Rectangle]::new(0, 0, 512, 512), [System.Drawing.Rectangle]::new(0, 0, 512, 512), [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$rawFg.Dispose()

# Resize & save helper
function Save-ResizedPng($src, $w, $h, $outPath) {
    $parent = Split-Path $outPath -Parent
    if (!(Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    
    $dest = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($src, 0, 0, $w, $h)
    $g.Dispose()
    $dest.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Dispose()
}

# Round icon helper
function Save-RoundPng($src, $w, $h, $outPath) {
    $parent = Split-Path $outPath -Parent
    if (!(Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    
    $dest = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse(0, 0, $w, $h)
    $g.SetClip($path)
    $g.DrawImage($src, 0, 0, $w, $h)
    $path.Dispose()
    $g.Dispose()
    
    $dest.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Dispose()
}

# ICO helper
function Save-Ico($pngPaths, $outIcoPath) {
    $parent = Split-Path $outIcoPath -Parent
    if (!(Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }

    $ms = New-Object System.IO.MemoryStream
    $bw = New-Object System.IO.BinaryWriter($ms)
    
    $bw.Write([uint16]0)
    $bw.Write([uint16]1)
    $bw.Write([uint16]$pngPaths.Count)
    
    $imageDataList = @()
    $offset = 6 + (16 * $pngPaths.Count)
    
    foreach ($p in $pngPaths) {
        $bytes = [System.IO.File]::ReadAllBytes($p)
        $img = [System.Drawing.Image]::FromFile($p)
        $w = if ($img.Width -ge 256) { 0 } else { [byte]$img.Width }
        $h = if ($img.Height -ge 256) { 0 } else { [byte]$img.Height }
        $img.Dispose()
        
        $bw.Write([byte]$w)
        $bw.Write([byte]$h)
        $bw.Write([byte]0)
        $bw.Write([byte]0)
        $bw.Write([uint16]1)
        $bw.Write([uint16]32)
        $bw.Write([uint32]$bytes.Length)
        $bw.Write([uint32]$offset)
        
        $offset += $bytes.Length
        $imageDataList += ,$bytes
    }
    
    foreach ($bytes in $imageDataList) {
        $bw.Write($bytes)
    }
    
    $bw.Flush()
    [System.IO.File]::WriteAllBytes($outIcoPath, $ms.ToArray())
    $bw.Dispose()
    $ms.Dispose()
}

# 3. Web & PWA Assets
Save-ResizedPng $masterImg 512 512 "$repoRoot\frontend\public\icons\icon-512x512.png"
Save-ResizedPng $masterImg 192 192 "$repoRoot\frontend\public\icons\icon-192x192.png"
Save-ResizedPng $masterImg 512 512 "$repoRoot\frontend\public\icons\icon-maskable-512x512.png"
Save-ResizedPng $masterImg 192 192 "$repoRoot\frontend\public\icons\icon-maskable-192x192.png"

Save-ResizedPng $masterImg 48 48 "$repoRoot\frontend\public\favicon-48x48.png"
Save-ResizedPng $masterImg 32 32 "$repoRoot\frontend\public\favicon-32x32.png"
Save-ResizedPng $masterImg 16 16 "$repoRoot\frontend\public\favicon-16x16.png"

Save-ResizedPng $masterImg 48 48 "$repoRoot\frontend\public\icons\favicon-48x48.png"
Save-ResizedPng $masterImg 32 32 "$repoRoot\frontend\public\icons\favicon-32x32.png"
Save-ResizedPng $masterImg 16 16 "$repoRoot\frontend\public\icons\favicon-16x16.png"

Save-Ico @(
    "$repoRoot\frontend\public\favicon-16x16.png",
    "$repoRoot\frontend\public\favicon-32x32.png",
    "$repoRoot\frontend\public\favicon-48x48.png"
) "$repoRoot\frontend\public\favicon.ico"

# 4. Android Mobile Assets
$androidConfigs = @(
    @{ folder = 'mipmap-mdpi'; size = 48; fgSize = 108 },
    @{ folder = 'mipmap-hdpi'; size = 72; fgSize = 162 },
    @{ folder = 'mipmap-xhdpi'; size = 96; fgSize = 216 },
    @{ folder = 'mipmap-xxhdpi'; size = 144; fgSize = 324 },
    @{ folder = 'mipmap-xxxhdpi'; size = 192; fgSize = 432 }
)

foreach ($c in $androidConfigs) {
    $dir = Join-Path "$repoRoot\mobile\android\app\src\main\res" $c.folder
    Save-ResizedPng $masterImg $c.size $c.size (Join-Path $dir 'ic_launcher.png')
    Save-RoundPng $masterImg $c.size $c.size (Join-Path $dir 'ic_launcher_round.png')
    Save-ResizedPng $fgImg $c.fgSize $c.fgSize (Join-Path $dir 'ic_launcher_foreground.png')
}

Save-ResizedPng $masterImg 512 512 "$repoRoot\mobile\android\app\src\main\res\drawable\splash.png"

# 5. Desktop App Assets
Save-ResizedPng $masterImg 512 512 "$repoRoot\desktop\assets\icons\icon.png"
Save-ResizedPng $masterImg 256 256 "$repoRoot\desktop\assets\icons\icon-256.png"
Save-ResizedPng $masterImg 32 32 "$repoRoot\desktop\assets\icons\tray-icon.png"
$desktopTmp16 = "$repoRoot\desktop\assets\icons\icon-16.png"
$desktopTmp48 = "$repoRoot\desktop\assets\icons\icon-48.png"
Save-ResizedPng $masterImg 16 16 $desktopTmp16
Save-ResizedPng $masterImg 48 48 $desktopTmp48

Save-Ico @(
    $desktopTmp16,
    "$repoRoot\desktop\assets\icons\tray-icon.png",
    $desktopTmp48,
    "$repoRoot\desktop\assets\icons\icon-256.png"
) "$repoRoot\desktop\assets\icons\icon.ico"

Remove-Item $desktopTmp16 -Force -ErrorAction SilentlyContinue
Remove-Item $desktopTmp48 -Force -ErrorAction SilentlyContinue

# 6. Browser Extension Assets
Save-ResizedPng $masterImg 128 128 "$repoRoot\extension\assets\icons\icon-128.png"
Save-ResizedPng $masterImg 48 48 "$repoRoot\extension\assets\icons\icon-48.png"
Save-ResizedPng $masterImg 32 32 "$repoRoot\extension\assets\icons\icon-32.png"
Save-ResizedPng $masterImg 16 16 "$repoRoot\extension\assets\icons\icon-16.png"

# Cleanup
$masterImg.Dispose()
$fgImg.Dispose()
Remove-Item $rawMasterPng -Force -ErrorAction SilentlyContinue
Remove-Item $rawFgPng -Force -ErrorAction SilentlyContinue

Write-Host "ALL ASSETS GENERATED AND VERIFIED SUCCESSFULLY!"
