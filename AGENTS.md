# Agent Notes

This file helps coding agents work safely and consistently in this frontend app workspace.

## Project intent

- This app is a concept-level AOI shift calculator.
- Prioritize clarity and educational value over apparent numerical precision.
- Preserve wording that warns users not to treat outputs as final specification values.

## Tech stack

- Plain HTML/CSS/JavaScript
- No framework, no build pipeline
- Single-page static app

## Key behavior expectations

- Keep wavelength input constrained to `193..1940` nm.
- Keep AOI constrained to `0..85` deg.
- Keep air as incident medium (`n0 = 1.000`) unless explicitly requested otherwise.
- Keep `n_eff` presets and manual entry behavior intact.
- Maintain the conceptual visuals:
  - AOI surface-angle view
  - conceptual transmission-shift view

## Editing guidelines

- Favor small, focused changes.
- Keep labels and helper text concise and user-facing.
- Avoid introducing false precision in output formatting.
- Keep warnings and assumptions visible in the UI.
- Update both UI text and logic when changing units, bounds, or formula labels.

## Verification checklist

After edits, verify:

1. AOI number field and slider stay synchronized.
2. `n_eff` preset selection updates the input value.
3. Manual `n_eff` input can override presets.
4. Results remain rounded and concept-labeled.
5. Visuals still update on input changes.
6. No linter errors in changed files.

## File map

- `index.html`: structure, labels, references, SVG containers
- `styles.css`: layout and visual polish
- `script.js`: formula, limits, synchronization, visual rendering

