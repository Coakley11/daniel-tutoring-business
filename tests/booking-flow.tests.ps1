$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$html = Get-Content -Raw (Join-Path $root 'index.html')
$config = Get-Content -Raw (Join-Path $root 'config.js')
$script = Get-Content -Raw (Join-Path $root 'script.js')
$reviews = Get-Content -Raw (Join-Path $root 'reviews.js')
$styles = Get-Content -Raw (Join-Path $root 'styles.css')

function Assert-Contains([string]$Value, [string]$Pattern, [string]$Message) {
  if ($Value -notmatch $Pattern) { throw $Message }
}

$stripeUrl = 'https://buy.stripe.com/test_28EeVdfz1b352KR1QSdIA00'
$calendlyUrl = 'https://calendly.com/coakley1112/60min'

Assert-Contains $config ([regex]::Escape($stripeUrl)) 'Configured Stripe test URL is incorrect'
Assert-Contains $config ([regex]::Escape($calendlyUrl)) 'Configured Calendly URL is incorrect'
Assert-Contains $config 'TEST / SANDBOX' 'Stripe sandbox warning is missing'
Assert-Contains $script 'querySelectorAll\("\[data-stripe\]"\)' 'Central Stripe binding is missing'

$paidCtas = [regex]::Matches($html, '<a[^>]+data-stripe[^>]*>')
if ($paidCtas.Count -lt 5) { throw 'Expected all major booking CTAs to use the payment-first flow' }
if ($html -match 'data-calendly') { throw 'A customer-facing CTA still bypasses payment through Calendly' }
if ([regex]::Matches($html, [regex]::Escape($stripeUrl)).Count -gt 0) {
  throw 'Stripe URL must remain centralized in config.js'
}
Assert-Contains $html 'Book a 60-Minute Tutoring Session — \$140' 'Primary booking CTA copy is missing'
Assert-Contains $html 'Online Math Tutoring — 60 Minutes' 'Product name is missing'
Assert-Contains $html '<span>\$</span>140<small>/ session</small>' 'Per-session price is missing'
Assert-Contains $html '<strong>Pay securely</strong>' 'Payment-first step is missing'
Assert-Contains $html '<strong>Choose your time</strong>' 'Scheduling step is missing'
Assert-Contains $html '<strong>Meet online</strong>' 'Online meeting step is missing'

# Reviews regression guard: preserve markup, behavior, and responsive styling.
Assert-Contains $html 'id="reviews"' 'Reviews section was removed'
Assert-Contains $html 'id="review-form"' 'Review form was removed'
Assert-Contains $html 'src="reviews.js"' 'Reviews script was removed'
Assert-Contains $reviews 'status=eq\.approved' 'Approved-only review query was changed'
Assert-Contains $styles '\.reviews-grid' 'Review styling was removed'
Assert-Contains $styles '@media \(max-width: 520px\)' 'Phone breakpoint is missing'

Write-Output "Booking flow tests passed ($($paidCtas.Count) payment-first CTAs)."
