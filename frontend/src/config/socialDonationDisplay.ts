/**
 * Social donation predictions use `predicted_donation_value_php` — values are on a **Philippine peso**
 * scale (see `prediction_columns_handoff.md` / Pipeline 10). For US-facing admin UI and OKRs, we
 * convert to approximate USD **for display only** so judges and stakeholders see plausible per-post
 * magnitudes (~hundreds of dollars, not tens of thousands mislabeled as USD).
 *
 * Not a live exchange-rate feed; update this ratio if you need stricter FX accuracy.
 */
export const PHP_PER_USD_APPROX = 56;

export function predictedDonationPhpToDisplayUsd(php: number): number {
  return php / PHP_PER_USD_APPROX;
}
