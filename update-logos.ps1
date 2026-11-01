Add-Type -AssemblyName System.Drawing

$repoRoot = "F:\API\AL-Quran"
$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

# Master SVG - Exactly as user provided (NO dashed lines, clean pages)
$svgMaster = @'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient matching user's original artwork -->
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#145b3a"/>
      <stop offset="30%" stop-color="#0f4a2f"/>
      <stop offset="70%" stop-color="#093521"/>
      <stop offset="100%" stop-color="#042014"/>
    </linearGradient>

    <!-- Warm Golden Gradient for emblem -->
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fae49d"/>
      <stop offset="35%" stop-color="#e2bf5c"/>
      <stop offset="70%" stop-color="#ca9f33"/>
      <stop offset="100%" stop-color="#a47c1b"/>
    </linearGradient>

    <!-- Linear Gold for Borders -->
    <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f5dc8e"/>
      <stop offset="50%" stop-color="#c99e31"/>
      <stop offset="100%" stop-color="#8f6a14"/>
    </linearGradient>

    <!-- Radial Soft Gold Glow -->
    <radialGradient id="emblemGlow" cx="50%" cy="52%" r="45%">
      <stop offset="0%" stop-color="#dfbd58" stop-opacity="0.22"/>
      <stop offset="60%" stop-color="#dfbd58" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#dfbd58" stop-opacity="0"/>
    </radialGradient>

    <!-- Pure Warm Gold Glow Filter -->
    <filter id="pureGoldGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#fae49d" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- 1. Squircle Container -->
  <rect x="16" y="16" width="480" height="480" rx="116" fill="url(#bg)"/>

  <!-- 2. Inset Thin Gold Rounded Border -->
  <rect x="42" y="42" width="428" height="428" rx="88" fill="none" stroke="url(#goldBorder)" stroke-width="3.5" opacity="0.6"/>

  <!-- 3. Ambient Gold Backlight -->
  <circle cx="256" cy="265" r="170" fill="url(#emblemGlow)"/>

  <!-- 4. Master Emblem (Exactly as user image: NO dashed lines, pure clean artwork) -->
  <g filter="url(#pureGoldGlow)">

    <!-- A. The Teardrop Dome / Mihrab Arch -->
    <path d="M256 122
             C278 170 326 218 326 264
             C326 298 304 322 278 328
             M256 122
             C234 170 186 218 186 264
             C186 298 208 322 234 328"
          fill="none" stroke="url(#gold)" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- B. The Open Holy Quran Outer Shell -->
    <path d="M116 274
             C136 256 172 244 206 250
             C228 254 246 266 256 284
             C266 266 284 254 306 250
             C340 244 376 256 396 274
             L396 348
             C376 332 338 326 304 336
             C282 342 266 358 256 396
             C246 358 230 342 208 336
             C174 326 136 332 116 348
             Z"
          fill="none" stroke="url(#gold)" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Center Spine Valley Line -->
    <line x1="256" y1="284" x2="256" y2="396" stroke="url(#gold)" stroke-width="9" stroke-linecap="round"/>

    <!-- C. Left Page Inner Border (Layered depth) -->
    <path d="M132 284
             C150 270 180 260 206 266
             C224 270 238 280 246 294
             L246 364
             C238 350 224 342 206 346
             C180 352 150 342 132 334
             Z"
          fill="none" stroke="url(#gold)" stroke-width="3.5" opacity="0.85"/>

    <!-- D. Right Page Inner Border (Layered depth) -->
    <path d="M380 284
             C362 270 332 260 306 266
             C288 270 274 280 266 294
             L266 364
             C274 350 288 342 306 346
             C332 352 362 342 380 334
             Z"
          fill="none" stroke="url(#gold)" stroke-width="3.5" opacity="0.85"/>

    <!-- E. Center Arabesque Rosette / Medallion at Spine -->
    <g transform="translate(256, 335)">
      <circle cx="0" cy="0" r="14" fill="none" stroke="url(#gold)" stroke-width="3"/>
      <circle cx="0" cy="0" r="4.5" fill="url(#gold)"/>
      <path d="M0 -14 C-3.5 -8 -3.5 -3 0 0 C3.5 -3 3.5 -8 0 -14 Z" fill="url(#gold)"/>
      <path d="M0 14 C-3.5 8 -3.5 3 0 0 C3.5 3 3.5 8 0 14 Z" fill="url(#gold)"/>
      <path d="M-14 0 C-8 -3.5 -3 -3.5 0 0 C-3 3.5 -8 3.5 -14 0 Z" fill="url(#gold)"/>
      <path d="M14 0 C8 -3.5 3 -3.5 0 0 C3 3.5 8 3.5 14 0 Z" fill="url(#gold)"/>
      <circle cx="-7.5" cy="-7.5" r="2.5" fill="url(#gold)"/>
      <circle cx="7.5" cy="-7.5" r="2.5" fill="url(#gold)"/>
      <circle cx="-7.5" cy="7.5" r="2.5" fill="url(#gold)"/>
      <circle cx="7.5" cy="7.5" r="2.5" fill="url(#gold)"/>
    </g>

  </g>
</svg>
'@

# Transparent Foreground SVG for Android Adaptive Icons (Zero dashed lines)
$svgForeground = @'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fae49d"/>
      <stop offset="35%" stop-color="#e2bf5c"/>
      <stop offset="70%" stop-color="#ca9f33"/>
      <stop offset="100%" stop-color="#a47c1b"/>
    </linearGradient>
    <filter id="pureGoldGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#fae49d" flood-opacity="0.4"/>
    </filter>
  </defs>

  <g filter="url(#pureGoldGlow)">
    <path d="M256 122
             C278 170 326 218 326 264
             C326 298 304 322 278 328
             M256 122
             C234 170 186 218 186 264
             C186 298 208 322 234 328"
          fill="none" stroke="url(#gold)" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>

    <path d="M116 274
             C136 256 172 244 206 250
             C228 254 246 266 256 284
             C266 266 284 254 306 250
             C340 244 376 256 396 274
             L396 348
             C376 332 338 326 304 336
             C282 342 266 358 256 396
             C246 358 230 342 208 336
             C174 326 136 332 116 348
             Z"
          fill="none" stroke="url(#gold)" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>

    <line x1="256" y1="284" x2="256" y2="396" stroke="url(#gold)" stroke-width="9" stroke-linecap="round"/>

    <path d="M132 284 C150 270 180 260 206 266 C224 270 238 280 246 294 L246 364 C238 350 224 342 206 346 C180 352 150 342 132 334 Z" fill="none" stroke="url(#gold)" stroke-width="3.5" opacity="0.85"/>
    <path d="M380 284 C362 270 332 260 306 266 C288 270 274 280 266 294 L266 364 C274 350 288 342 306 346 C332 352 362 342 380 334 Z" fill="none" stroke="url(#gold)" stroke-width="3.5" opacity="0.85"/>

    <g transform="translate(256, 335)">
      <circle cx="0" cy="0" r="14" fill="none" stroke="url(#gold)" stroke-width="3"/>
      <circle cx="0" cy="0" r="4.5" fill="url(#gold)"/>
      <path d="M0 -14 C-3.5 -8 -3.5 -3 0 0 C3.5 -3 3.5 -8 0 -14 Z" fill="url(#gold)"/>
      <path d="M0 14 C-3.5 8 -3.5 3 0 0 C3.5 3 3.5 8 0 14 Z" fill="url(#gold)"/>
      <path d="M-14 0 C-8 -3.5 -3 -3.5 0 0 C-3 3.5 -8 3.5 -14 0 Z" fill="url(#gold)"/>
      <path d="M14 0 C8 -3.5 3 -3.5 0 0 C2 3.5 8 3.5 14 0 Z" fill="url(#gold)"/>
      <circle cx="-7.5" cy="-7.5" r="2.5" fill="url(#gold)"/>
      <circle cx="7.5" cy="-7.5" r="2.5" fill="url(#gold)"/>
      <circle cx="-7.5" cy="7.5" r="2.5" fill="url(#gold)"/>
      <circle cx="7.5" cy="7.5" r="2.5" fill="url(#gold)"/>
    </g>
  </g>
</svg>
'@

# Save SVGs
Set-Content -Path "$repoRoot\frontend\public\icons\icon.svg" -Value $svgMaster -Encoding utf8
Set-Content -Path "$repoRoot\frontend\public\favicon.svg" -Value $svgMaster -Encoding utf8
Write-Host "Updated SVGs (exact match to user image, 3 lines removed)"

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

# Helper function to resize bitmap
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

# Helper function to create round icon
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

# Helper function to create ICO file
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

# Re-package extension zip
$destDir = "$repoRoot\frontend\public\downloads"
$zipPath = "$destDir\al-quran-halal-shield-v1.1.0.zip"
$latestZip = "$destDir\al-quran-halal-shield-latest.zip"
Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
Remove-Item $latestZip -Force -ErrorAction SilentlyContinue
Compress-Archive -Path "$repoRoot\extension\*" -DestinationPath $zipPath -Force
Copy-Item $zipPath -Destination $latestZip -Force

# Cleanup
$masterImg.Dispose()
$fgImg.Dispose()
Remove-Item $rawMasterPng -Force -ErrorAction SilentlyContinue
Remove-Item $rawFgPng -Force -ErrorAction SilentlyContinue

Write-Host "ALL ASSETS GENERATED EXACTLY AS USER PROVIDED!"
