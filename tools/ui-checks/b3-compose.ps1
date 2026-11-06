param([string]$Root, [string]$Left, [string]$Right, [string]$LeftLabel, [string]$RightLabel, [string]$OutName, [string[]]$Names)
$ErrorActionPreference = 'Stop'
$Names = $Names -split ','
$RightLabel = $RightLabel.Replace('DESPUES', 'DESPU' + [char]0xC9 + 'S')
Add-Type -AssemblyName System.Drawing
$out = Join-Path $Root $OutName
New-Item -ItemType Directory -Force $out | Out-Null
$jpeg = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]82)
$font = New-Object System.Drawing.Font 'Segoe UI', 16, ([System.Drawing.FontStyle]::Bold)
foreach ($name in $Names) {
  $a = [System.Drawing.Image]::FromFile((Join-Path $Root "$Left\$name.png"))
  $b = [System.Drawing.Image]::FromFile((Join-Path $Root "$Right\$name.png"))
  $gap = 24; $head = 44
  $canvas = New-Object System.Drawing.Bitmap ($a.Width + $b.Width + $gap), ($a.Height + $head)
  $g = [System.Drawing.Graphics]::FromImage($canvas)
  $g.Clear([System.Drawing.Color]::FromArgb(45, 45, 45))
  $g.DrawString($LeftLabel, $font, [System.Drawing.Brushes]::White, 8, 8)
  $g.DrawString($RightLabel, $font, [System.Drawing.Brushes]::White, ($a.Width + $gap + 8), 8)
  $g.DrawImage($a, 0, $head, $a.Width, $a.Height)
  $g.DrawImage($b, ($a.Width + $gap), $head, $b.Width, $b.Height)
  $g.Dispose()
  $canvas.Save((Join-Path $out "$name.jpg"), $jpeg, $params)
  $canvas.Dispose(); $a.Dispose(); $b.Dispose()
}
"composed $($Names.Count) into $OutName"
