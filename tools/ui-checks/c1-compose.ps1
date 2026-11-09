param([string]$Root)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$out = Join-Path $Root 'compare'
New-Item -ItemType Directory -Force $out | Out-Null
$jpeg = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]82)
$font = New-Object System.Drawing.Font 'Segoe UI', 16, ([System.Drawing.FontStyle]::Bold)
foreach ($name in 'analyzer-1440', 'analyzer-1280', 'analyzer-375', 'dashboard-1440', 'history-1440', 'results-1440', 'admin-1440', 'settings-1440') {
  $a = [System.Drawing.Image]::FromFile((Join-Path $Root "before\$name.png"))
  $b = [System.Drawing.Image]::FromFile((Join-Path $Root "after\$name.png"))
  $gap = 24; $head = 44
  $canvas = New-Object System.Drawing.Bitmap ($a.Width + $b.Width + $gap), ($a.Height + $head)
  $g = [System.Drawing.Graphics]::FromImage($canvas)
  $g.Clear([System.Drawing.Color]::FromArgb(45, 45, 45))
  $g.DrawString('ANTES', $font, [System.Drawing.Brushes]::White, 8, 8)
  $g.DrawString(('DESPU' + [char]0xC9 + 'S'), $font, [System.Drawing.Brushes]::White, ($a.Width + $gap + 8), 8)
  $g.DrawImage($a, 0, $head, $a.Width, $a.Height)
  $g.DrawImage($b, ($a.Width + $gap), $head, $b.Width, $b.Height)
  $g.Dispose()
  $canvas.Save((Join-Path $out "$name.jpg"), $jpeg, $params)
  $canvas.Dispose(); $a.Dispose(); $b.Dispose()
}
Get-ChildItem $out | Select-Object Name, Length | Format-Table -AutoSize
