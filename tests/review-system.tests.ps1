$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$html = Get-Content -Raw (Join-Path $root 'index.html')
$js = Get-Content -Raw (Join-Path $root 'reviews.js')
$sql = Get-Content -Raw (Join-Path $root 'supabase\reviews.sql')

function Assert-Contains([string]$Value, [string]$Pattern, [string]$Message) {
  if ($Value -notmatch $Pattern) { throw $Message }
}

1..5 | ForEach-Object {
  Assert-Contains $html ('value="' + $_ + '"') "Missing rating value $_"
}
Assert-Contains $html 'name="displayName"[^>]+required' 'Display name must be required'
Assert-Contains $html 'name="reviewText"[^>]+minlength="10"[^>]+maxlength="600"[^>]+required' 'Review length constraints are missing'
Assert-Contains $html 'name="website"' 'Spam honeypot is missing'

Assert-Contains $js 'total / reviews\.length' 'Average calculation is missing'
Assert-Contains $js 'reviews\.length' 'Review count calculation is missing'
Assert-Contains $js 'submitted for approval' 'Pending confirmation is missing'
Assert-Contains $js 'textContent = review\.review_text' 'Reviews must be rendered as text'
Assert-Contains $js 'if \(/\^eyJ/\.test\(apiKey\)\)' 'Publishable-key header compatibility is missing'
if ($js -match 'localStorage|sessionStorage') { throw 'Reviews must persist in the backend, not browser storage' }

Assert-Contains $sql "using \(status = 'approved'\)" 'Approved-only read policy is missing'
Assert-Contains $sql "with check \(status = 'pending' and approved_at is null\)" 'Pending-only insert policy is missing'
Assert-Contains $sql 'grant select, insert on table public\.reviews to anon' 'PostgREST table grants are missing'
if ($sql -match 'grant\s+(update|delete).*anon') { throw 'Anonymous moderation privileges must not be granted' }
Assert-Contains $sql 'rating between 1 and 5' 'Server rating constraint is missing'
Assert-Contains $sql 'between 10 and 600' 'Server review length constraint is missing'

Write-Output 'Review system source and security tests passed.'
