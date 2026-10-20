Asklipios 0.15.5 — Laboratory / Admission package fixes

Changed files:
- asklipios.user.js
- src/95-lab-admission-fixes.js

What changed:
1. Vial control now follows the selected package exactly.
   - If the package is exactly representable by existing columns (General / Biochem / Coag / CRP / ESR / Thyroid), those columns are pre-checked.
   - Otherwise the selected package appears as its own checked column, including user-created packages.
2. Admission package opens one Print Hub tab and adds:
   - every blood-test referral generated for the laboratory batch (1, 2, 3 or more laboratory_report.php forms),
   - ABO / Crossmatch,
   - Medical Instructions,
   - X-ray referrals.
3. Medical Instructions are resolved dynamically from the current Care UI / patient pages. Several known PDF endpoint variants are tried only as fallback, so the old hard-coded doctors_orders_odipy.php URL is no longer the only path.

Install/update order on GitHub:
1. Upload src/95-lab-admission-fixes.js
2. Then replace asklipios.user.js
3. Reload Tampermonkey / Care.

No existing factory data or user-created presets are modified by this patch.
