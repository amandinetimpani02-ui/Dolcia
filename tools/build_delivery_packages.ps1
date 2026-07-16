$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$stamp = "2026-07-15"

$publicStage = Join-Path $root ".delivery_public_$stamp"
$depositStage = Join-Path $root "IP_DEPOSIT_DOLCIA_$stamp"

foreach ($target in @($publicStage, $depositStage)) {
    if (Test-Path -LiteralPath $target) {
        $resolved = (Resolve-Path -LiteralPath $target).Path
        if (-not $resolved.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
            throw "Refus de nettoyer un chemin hors du workspace: $resolved"
        }
        Remove-Item -LiteralPath $resolved -Recurse -Force
    }
    New-Item -ItemType Directory -Path $target | Out-Null
}

$publicFiles = @(
    "index.html", "app.js", "style.css", "premium.css", "budget.css", "home-premium.css", "circle.css", "manifest.json", "sw.js", "package.json",
    "vercel.json", ".env.example", "admin.html", "pro.html", "pro.css", "pro-premium.css", "pro.js"
)
foreach ($file in $publicFiles) {
    $src = Join-Path $root $file
    if (Test-Path -LiteralPath $src) { Copy-Item -LiteralPath $src -Destination $publicStage }
}
Copy-Item -LiteralPath (Join-Path $root "api") -Destination $publicStage -Recurse
Copy-Item -LiteralPath (Join-Path $root "server") -Destination $publicStage -Recurse
Copy-Item -LiteralPath (Join-Path $root "assets") -Destination $publicStage -Recurse

$publicZip = Join-Path $root "Dolcia_APPLICATION_ECLAT_MASTER_v17_SERVEUR_$stamp.zip"
if (Test-Path -LiteralPath $publicZip) { Remove-Item -LiteralPath $publicZip -Force }
Compress-Archive -Path (Join-Path $publicStage "*") -DestinationPath $publicZip -CompressionLevel Optimal

$depositFiles = @(
    "index.html", "app.js", "style.css", "manifest.json", "sw.js", "package.json", "vercel.json",
    "MASTER.md", "PROTECTION_IP.md",
    "Dolcia_Product_Book_MASTER_v16_CONFIDENTIEL_2026-07-15.docx"
)
foreach ($file in $depositFiles) {
    $src = Join-Path $root $file
    if (Test-Path -LiteralPath $src) { Copy-Item -LiteralPath $src -Destination $depositStage }
}
Copy-Item -LiteralPath (Join-Path $root "output\pdf\Dolcia_Product_Book_MASTER_v16_CONFIDENTIEL_2026-07-15.pdf") -Destination $depositStage
Copy-Item -LiteralPath (Join-Path $root "assets\dolcia-eclat-concept.png") -Destination $depositStage
Copy-Item -LiteralPath (Join-Path $root "api") -Destination $depositStage -Recurse
Copy-Item -LiteralPath (Join-Path $root "server") -Destination $depositStage -Recurse

$manifest = Join-Path $depositStage "MANIFESTE_SHA256.txt"
$lines = @(
    "DOLCIA - ARCHIVE DE PREUVE",
    "Date de constitution : $stamp",
    "Objet : code MASTER, Product Book v16, identité du D vivant et de L'Éclat",
    "Important : ce manifeste facilite l'identification des fichiers. Le dépôt e-Soleau auprès de l'INPI apporte la preuve de date.",
    ""
)
$files = Get-ChildItem -LiteralPath $depositStage -File -Recurse | Where-Object { $_.FullName -ne $manifest } | Sort-Object FullName
foreach ($file in $files) {
    $hash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
    $relative = $file.FullName.Substring($depositStage.Length + 1)
    $lines += "$hash  $relative"
}
Set-Content -LiteralPath $manifest -Value $lines -Encoding UTF8

$depositZip = Join-Path $root "Dolcia_IP_E-SOLEAU_PRET_A_DEPOSER_$stamp.zip"
if (Test-Path -LiteralPath $depositZip) { Remove-Item -LiteralPath $depositZip -Force }
Compress-Archive -Path (Join-Path $depositStage "*") -DestinationPath $depositZip -CompressionLevel Optimal

$resolvedPublicStage = (Resolve-Path -LiteralPath $publicStage).Path
if ($resolvedPublicStage.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
    Remove-Item -LiteralPath $resolvedPublicStage -Recurse -Force
}

Get-Item $publicZip, $depositZip | Select-Object FullName, Length, LastWriteTime
