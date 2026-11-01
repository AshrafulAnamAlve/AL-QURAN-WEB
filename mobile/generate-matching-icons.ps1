Add-Type -AssemblyName System.Drawing

function Render-AppIcon {
    param(
        [int]$size,
        [string]$shape = "squircle", # "squircle", "circle", "fullbleed", "transparent"
        [float]$glyphScale = 0.52
    )

    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # 1. Background Fill (unless transparent foreground)
    if ($shape -ne "transparent") {
        $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
            (New-Object System.Drawing.Point(0, 0)),
            (New-Object System.Drawing.Point($size, $size)),
            [System.Drawing.Color]::FromArgb(15, 81, 50),   # #0f5132 (--aq-green-700)
            [System.Drawing.Color]::FromArgb(14, 124, 90)   # #0e7c5a (--aq-green-500)
        )

        if ($shape -eq "circle") {
            $g.FillEllipse($brush, 0, 0, $size, $size)
            # Subtle inner gold/white highlight
            $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(45, 255, 255, 255), [Math]::Max(1.0, $size * 0.012))
            $g.DrawEllipse($pen, [float]($size * 0.02), [float]($size * 0.02), [float]($size * 0.96), [float]($size * 0.96))
            $pen.Dispose()
        } elseif ($shape -eq "fullbleed") {
            $g.FillRectangle($brush, 0, 0, $size, $size)
        } else {
            # Squircle / rounded rectangle
            $rad = [int]($size * 0.22)
            $path = New-Object System.Drawing.Drawing2D.GraphicsPath
            $path.AddArc(0, 0, $rad * 2, $rad * 2, 180, 90)
            $path.AddArc($size - $rad * 2, 0, $rad * 2, $rad * 2, 270, 90)
            $path.AddArc($size - $rad * 2, $size - $rad * 2, $rad * 2, $rad * 2, 0, 90)
            $path.AddArc(0, $size - $rad * 2, $rad * 2, $rad * 2, 90, 90)
            $path.CloseFigure()
            $g.FillPath($brush, $path)

            # Subtle inner highlight border
            $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(45, 255, 255, 255), [Math]::Max(1.0, $size * 0.012))
            $innerRad = [int]($rad * 0.9)
            $inPad = [float]($size * 0.02)
            $inSize = [float]($size * 0.96)
            $innerPath = New-Object System.Drawing.Drawing2D.GraphicsPath
            $innerPath.AddArc($inPad, $inPad, $innerRad * 2, $innerRad * 2, 180, 90)
            $innerPath.AddArc($inPad + $inSize - $innerRad * 2, $inPad, $innerRad * 2, $innerRad * 2, 270, 90)
            $innerPath.AddArc($inPad + $inSize - $innerRad * 2, $inPad + $inSize - $innerRad * 2, $innerRad * 2, $innerRad * 2, 0, 90)
            $innerPath.AddArc($inPad, $inPad + $inSize - $innerRad * 2, $innerRad * 2, $innerRad * 2, 90, 90)
            $innerPath.CloseFigure()
            $g.DrawPath($pen, $innerPath)

            $pen.Dispose()
            $path.Dispose()
            $innerPath.Dispose()
        }
        $brush.Dispose()
    }

    # 2. Draw the Signature Quran Sajda Glyph ۩
    $fontSize = [int]($size * $glyphScale)
    $font = New-Object System.Drawing.Font("Segoe UI", $fontSize, [System.Drawing.FontStyle]::Bold)
    $glyph = [char]0x06E9
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center

    $yOffset = [float]($size * -0.015)
    $drawRect = New-Object System.Drawing.RectangleF(0.0, $yOffset, [float]$size, [float]$size)

    # Soft drop shadow
    $shadowY = [float]($yOffset + [Math]::Max(1.0, $size * 0.015))
    $shadowRect = New-Object System.Drawing.RectangleF(0.0, $shadowY, [float]$size, [float]$size)
    $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(70, 0, 0, 0))
    $g.DrawString($glyph, $font, $shadowBrush, $shadowRect, $format)
    $shadowBrush.Dispose()

    # Pure white emblem
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.DrawString($glyph, $font, $textBrush, $drawRect, $format)
    $textBrush.Dispose()

    $font.Dispose()
    $format.Dispose()
    $g.Dispose()

    return $bmp
}

Write-Host "Rendering Master Matching Icons..."

# --- 1. ANDROID RES MAPPINGS ---
$androidResDir = "F:\API\AL-Quran\mobile\android\app\src\main\res"

$androidConfigs = @(
    @{ folder = 'mipmap-mdpi';    legacy = 48;  round = 48;  fg = 108 },
    @{ folder = 'mipmap-hdpi';    legacy = 72;  round = 72;  fg = 162 },
    @{ folder = 'mipmap-xhdpi';   legacy = 96;  round = 96;  fg = 216 },
    @{ folder = 'mipmap-xxhdpi';  legacy = 144; round = 144; fg = 324 },
    @{ folder = 'mipmap-xxxhdpi'; legacy = 192; round = 192; fg = 432 }
)

foreach ($c in $androidConfigs) {
    $dir = Join-Path $androidResDir $c.folder

    # Legacy squircle icon
    $legacyIcon = Render-AppIcon $c.legacy "squircle" 0.52
    $legacyIcon.Save((Join-Path $dir 'ic_launcher.png'), [System.Drawing.Imaging.ImageFormat]::Png)
    $legacyIcon.Dispose()

    # Legacy round icon
    $roundIcon = Render-AppIcon $c.round "circle" 0.50
    $roundIcon.Save((Join-Path $dir 'ic_launcher_round.png'), [System.Drawing.Imaging.ImageFormat]::Png)
    $roundIcon.Dispose()

    # Adaptive Icon Foreground (Transparent background, glyph within safe 66% zone)
    $fgIcon = Render-AppIcon $c.fg "transparent" 0.40
    $fgIcon.Save((Join-Path $dir 'ic_launcher_foreground.png'), [System.Drawing.Imaging.ImageFormat]::Png)
    $fgIcon.Dispose()

    Write-Host "  -> Generated Android $($c.folder) (legacy, round, foreground)"
}

# --- 2. UPDATE ANDROID BACKGROUND COLOR ---
$bgXmlPath = Join-Path $androidResDir "values\ic_launcher_background.xml"
$bgXmlContent = @"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#0f5132</color>
</resources>
"@
[System.IO.File]::WriteAllText($bgXmlPath, $bgXmlContent)

$bgDrawablePath = Join-Path $androidResDir "drawable\ic_launcher_background.xml"
$bgDrawableContent = @"
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#0f5132"
        android:pathData="M0,0h108v108h-108z" />
</vector>
"@
[System.IO.File]::WriteAllText($bgDrawablePath, $bgDrawableContent)
Write-Host "  -> Updated Android ic_launcher_background to match #0f5132"

# --- 3. FRONTEND PUBLIC ASSETS ---
$feIconsDir = "F:\API\AL-Quran\frontend\public\icons"
$fePublicDir = "F:\API\AL-Quran\frontend\public"

# 512x512 Master PWA Icon
$pwa512 = Render-AppIcon 512 "squircle" 0.52
$pwa512.Save((Join-Path $feIconsDir 'icon-512x512.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$pwa512.Dispose()

# 192x192 Master PWA Icon
$pwa192 = Render-AppIcon 192 "squircle" 0.52
$pwa192.Save((Join-Path $feIconsDir 'icon-192x192.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$pwa192.Dispose()

# 512x512 Maskable PWA Icon (Full bleed background, safe 60% glyph)
$pwaMask512 = Render-AppIcon 512 "fullbleed" 0.40
$pwaMask512.Save((Join-Path $feIconsDir 'icon-maskable-512x512.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$pwaMask512.Dispose()

# 192x192 Maskable PWA Icon
$pwaMask192 = Render-AppIcon 192 "fullbleed" 0.40
$pwaMask192.Save((Join-Path $feIconsDir 'icon-maskable-192x192.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$pwaMask192.Dispose()

# Favicons (48, 32, 16)
$fav48 = Render-AppIcon 48 "squircle" 0.54
$fav48.Save((Join-Path $feIconsDir 'favicon-48x48.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$fav48.Save((Join-Path $fePublicDir 'favicon-48x48.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$fav48.Dispose()

$fav32 = Render-AppIcon 32 "squircle" 0.54
$fav32.Save((Join-Path $feIconsDir 'favicon-32x32.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$fav32.Save((Join-Path $fePublicDir 'favicon-32x32.png'), [System.Drawing.Imaging.ImageFormat]::Png)

# Convert 32x32 to favicon.ico
$icoStream = New-Object System.IO.MemoryStream
$hIcon = $fav32.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$icoFileStream = New-Object System.IO.FileStream ((Join-Path $fePublicDir 'favicon.ico'), [System.IO.FileMode]::Create)
$icon.Save($icoFileStream)
$icoFileStream.Close()
$icon.Dispose()
$fav32.Dispose()

$fav16 = Render-AppIcon 16 "squircle" 0.55
$fav16.Save((Join-Path $feIconsDir 'favicon-16x16.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$fav16.Save((Join-Path $fePublicDir 'favicon-16x16.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$fav16.Dispose()

Write-Host "  -> Generated Frontend PWA & Favicon icons"

# --- 4. GENERATE SVG ICONS ---
$svgContent = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f5132"/>
      <stop offset="50%" stop-color="#14683f"/>
      <stop offset="100%" stop-color="#0e7c5a"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.32"/>
    </filter>
  </defs>

  <!-- Emerald Gradient Rounded Tile (Matches Website Navbar Brand) -->
  <rect width="512" height="512" rx="114" fill="url(#bgGrad)"/>

  <!-- Subtle ambient inner border -->
  <rect x="20" y="20" width="472" height="472" rx="96" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.18"/>

  <!-- Islamic Place of Sajdah Symbol ۩ in Crisp White -->
  <text x="256" y="278"
        font-family="'Amiri Quran', 'Traditional Arabic', 'Segoe UI', serif"
        font-size="280"
        font-weight="bold"
        fill="#ffffff"
        text-anchor="middle"
        dominant-baseline="central"
        filter="url(#shadow)">۩</text>
</svg>
"@
[System.IO.File]::WriteAllText((Join-Path $feIconsDir 'icon.svg'), $svgContent)
[System.IO.File]::WriteAllText((Join-Path $fePublicDir 'favicon.svg'), $svgContent)
Write-Host "  -> Generated Unified SVGs (icon.svg & favicon.svg)"

# --- 5. REGENERATE SPLASH SCREENS ---
Write-Host "  -> Regenerating Android Splash Screens with Website Logo..."
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

$masterLogo = Render-AppIcon 384 "squircle" 0.52

foreach ($s in $splashConfigs) {
    $dir = Join-Path $androidResDir $s.folder
    if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    
    $bmp = New-Object System.Drawing.Bitmap($s.w, $s.h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    # Fill deep emerald nocturnal background #061a14
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(6, 26, 20))
    $g.FillRectangle($bgBrush, 0, 0, $s.w, $s.h)
    $bgBrush.Dispose()

    # Draw centered logo at ~36% of min dimension
    $iconSize = [Math]::Min($s.w, $s.h) * 0.36
    $x = ($s.w - $iconSize) / 2
    $y = ($s.h - $iconSize) / 2
    $g.DrawImage($masterLogo, [float]$x, [float]$y, [float]$iconSize, [float]$iconSize)

    $g.Dispose()
    $bmp.Save((Join-Path $dir 'splash.png'), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}
$masterLogo.Dispose()

Write-Host "`nSUCCESS: All Mobile App & Website Icons and Splash screens are now 100% unified with the website brand logo!"
