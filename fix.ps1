$path = 'c:\inventory mangement system\INVOICE_FE\src\pages\Settings\components\ProductSetupModule.tsx'
$lines = [System.IO.File]::ReadAllLines($path)
$newLines = $lines[0..325] + $lines[505..($lines.Length - 1)]
[System.IO.File]::WriteAllLines($path, $newLines, [System.Text.Encoding]::UTF8)
