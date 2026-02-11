# AOI Shift Concept Calculator

A lightweight browser tool to estimate how a bandpass filter center wavelength shifts with angle of incidence (AOI).

## What this is

- A conceptual calculator for AOI-dependent center-wavelength shift.
- A simple learning and planning tool with compact visuals.
- A static web app (no build step required).

## What this is not

- Not a final optical design or qualification tool.
- Not a replacement for measured filter data or full thin-film simulation.

Use vendor AOI curves and measured data for sign-off decisions.

## Model used

The calculator uses:

`lambda_theta = lambda_0 * sqrt(1 - (n0 / n_eff)^2 * sin^2(theta))`

Where:

- `lambda_0`: center wavelength at normal incidence
- `lambda_theta`: center wavelength at AOI `theta`
- `n0`: incident medium index (fixed to air, `1.000`)
- `n_eff`: effective refractive index of the filter stack

## Input guidance

- `lambda_0` valid range: `193` to `1940` nm
- `theta` valid range: `0` to `85` deg
- `n_eff`: often approximated in `~1.7 to 2.5` for many dielectric stacks (concept-level use)

## Features

- Live AOI shift calculation and percentage shift.
- `n_eff` presets with labeled approximate stack types.
- Compact concept visuals:
  - AOI surface-angle diagram
  - conceptual transmission-curve shift view
- Rounded display values to avoid false precision.

## Run locally

Open `index.html` directly in a browser.

No install or build command is required.

## Project files

- `index.html` - UI structure and text
- `styles.css` - layout and visual styles
- `script.js` - calculation logic and live visual updates

## References shown in app

- OpenStax: Interference in Thin Films
- Northumbria Optical Coatings: Angular Shift
- Alluxa: AOI and Polarization

