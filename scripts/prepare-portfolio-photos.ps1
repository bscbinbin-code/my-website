param(
  [string]$SourceDir = "F:\Desktop\web\Photos\f",
  [string]$OutputDir = "F:\Desktop\web\ai-website-cloner-template\public\portfolio\photos",
  [string]$ManifestPath = "F:\Desktop\web\ai-website-cloner-template\src\data\portfolio-photos.json",
  [int]$MaxLongEdge = 2200,
  [long]$JpegQuality = 84
)

Add-Type -AssemblyName System.Drawing

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $ManifestPath) | Out-Null

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq "image/jpeg" } |
  Select-Object -First 1

$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
  [System.Drawing.Imaging.Encoder]::Quality,
  $JpegQuality
)

$items = @()
$index = 0

Get-ChildItem -LiteralPath $SourceDir -File |
  Where-Object { $_.Extension -match "^\.(jpg|jpeg)$" } |
  Sort-Object Name |
  ForEach-Object {
    $index++
    $safeBase = $_.BaseName -replace "[^\w.-]+", "-"
    $fileName = "{0:D2}-{1}.jpg" -f $index, $safeBase
    $target = Join-Path $OutputDir $fileName

    $sourceImage = [System.Drawing.Image]::FromFile($_.FullName)
    try {
      $scale = [Math]::Min(1.0, [double]$MaxLongEdge / [double][Math]::Max($sourceImage.Width, $sourceImage.Height))
      $width = [Math]::Max(1, [int][Math]::Round($sourceImage.Width * $scale))
      $height = [Math]::Max(1, [int][Math]::Round($sourceImage.Height * $scale))

      $bitmap = New-Object System.Drawing.Bitmap($width, $height)
      try {
        $bitmap.SetResolution($sourceImage.HorizontalResolution, $sourceImage.VerticalResolution)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        try {
          $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
          $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
          $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
          $graphics.DrawImage($sourceImage, 0, 0, $width, $height)
        } finally {
          $graphics.Dispose()
        }

        $bitmap.Save($target, $jpegCodec, $encoderParams)
      } finally {
        $bitmap.Dispose()
      }

      $items += [PSCustomObject]@{
        id = $index
        title = ($_.BaseName -replace "[-_]+", " ").ToUpperInvariant()
        originalName = $_.Name
        src = "/portfolio/photos/$fileName"
        width = $width
        height = $height
        orientation = if ($width -gt $height) { "landscape" } elseif ($width -lt $height) { "portrait" } else { "square" }
        ratio = [Math]::Round($width / $height, 4)
      }

      Write-Host "prepared $fileName ($width x $height)"
    } finally {
      $sourceImage.Dispose()
    }
  }

$json = $items | ConvertTo-Json -Depth 4
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($ManifestPath, $json, $utf8NoBom)
Write-Host "Wrote $($items.Count) photos to $ManifestPath"
