// AOI Shift Simulator logic

(function () {
	const n0 = 1.0; // incident medium: air
	const DEG_TO_RAD = Math.PI / 180;
	const LAMBDA_MIN = 193;
	const LAMBDA_MAX = 1940;
	const THETA_MIN = 0;
	const THETA_MAX = 85;

	const el = {
		lambda0: document.getElementById('lambda0'),
		neff: document.getElementById('neff'),
		neffPreset: document.getElementById('neffPreset'),
		theta: document.getElementById('theta'),
		thetaRange: document.getElementById('thetaRange'),
		lambdaShifted: document.getElementById('lambdaShifted'),
		deltaLambda: document.getElementById('deltaLambda'),
		percentShift: document.getElementById('percentShift'),
		incidentRay: document.getElementById('incidentRay'),
		thetaArcAir: document.getElementById('thetaArcAir'),
		airAngleLabel: document.getElementById('airAngleLabel'),
		neffVizLabel: document.getElementById('neffVizLabel'),
		curveBaseline: document.getElementById('curveBaseline'),
		curveShifted: document.getElementById('curveShifted'),
		baselineCenterLine: document.getElementById('baselineCenterLine'),
		shiftedCenterLine: document.getElementById('shiftedCenterLine'),
		baselineLabel: document.getElementById('baselineLabel'),
		shiftedLabel: document.getElementById('shiftedLabel')
	};

	function toNumber(input) {
		const v = typeof input === 'number' ? input : parseFloat(String(input));
		return Number.isFinite(v) ? v : NaN;
	}

	function clamp(value, min, max) {
		return Math.min(max, Math.max(min, value));
	}

	function computeShiftedLambda(lambda0Nm, neff, thetaDeg) {
		if (lambda0Nm < LAMBDA_MIN || lambda0Nm > LAMBDA_MAX || neff <= 0) return NaN;
		const thetaRad = DEG_TO_RAD * thetaDeg;
		const sinTheta = Math.sin(thetaRad);
		const ratio = n0 / neff;
		const inside = 1 - (ratio * ratio) * (sinTheta * sinTheta);
		if (inside < 0) return NaN; // invalid for the given parameters
		return lambda0Nm * Math.sqrt(inside);
	}

	function formatNumber(x, digits) {
		if (!Number.isFinite(x)) return '—';
		return x.toFixed(digits);
	}

	function syncThetaInputs(from) {
		if (from === 'number') {
			const theta = clamp(toNumber(el.theta.value), THETA_MIN, THETA_MAX);
			el.theta.value = Number.isFinite(theta) ? String(theta) : String(THETA_MIN);
			el.thetaRange.value = el.theta.value;
		} else if (from === 'range') {
			const theta = clamp(toNumber(el.thetaRange.value), THETA_MIN, THETA_MAX);
			el.thetaRange.value = Number.isFinite(theta) ? String(theta) : String(THETA_MIN);
			el.theta.value = el.thetaRange.value;
		}
	}

	function syncLambdaInput() {
		const lambda0Nm = clamp(toNumber(el.lambda0.value), LAMBDA_MIN, LAMBDA_MAX);
		el.lambda0.value = Number.isFinite(lambda0Nm) ? String(lambda0Nm) : String(LAMBDA_MIN);
	}

	function setText(elm, nextValue) {
		if (elm.textContent !== nextValue) {
			elm.textContent = nextValue;
		}
	}

	function describeArc(cx, cy, radius, startDeg, endDeg) {
		const startRad = DEG_TO_RAD * startDeg;
		const endRad = DEG_TO_RAD * endDeg;
		const x1 = cx + radius * Math.cos(startRad);
		const y1 = cy + radius * Math.sin(startRad);
		const x2 = cx + radius * Math.cos(endRad);
		const y2 = cy + radius * Math.sin(endRad);
		const sweep = endDeg > startDeg ? 1 : 0;
		const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
		return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${x2.toFixed(2)} ${y2.toFixed(2)}`;
	}

	function buildGaussianCurvePath(xMin, xMax, yBase, amp, center, sigma, samples) {
		let d = '';
		for (let i = 0; i <= samples; i += 1) {
			const t = i / samples;
			const x = xMin + t * (xMax - xMin);
			const z = (x - center) / sigma;
			const y = yBase - amp * Math.exp(-0.5 * z * z);
			d += `${i === 0 ? 'M' : ' L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
		}
		return d;
	}

	function wavelengthToX(w, wMin, wMax, xMin, xMax) {
		return xMin + ((w - wMin) / (wMax - wMin)) * (xMax - xMin);
	}

	function updateTransmissionViz(lambda0Nm, lambdaThetaNm) {
		if (!Number.isFinite(lambda0Nm)) {
			const xMinFallback = 54;
			const xMaxFallback = 486;
			const yBaseFallback = 180;
			const center = (xMinFallback + xMaxFallback) / 2;
			el.curveBaseline.setAttribute('d', buildGaussianCurvePath(xMinFallback, xMaxFallback, yBaseFallback, 112, center, 42, 96));
			el.curveShifted.setAttribute('d', buildGaussianCurvePath(xMinFallback, xMaxFallback, yBaseFallback, 105, center, 44, 96));
			el.baselineCenterLine.setAttribute('x1', center.toFixed(2));
			el.baselineCenterLine.setAttribute('y1', '68');
			el.baselineCenterLine.setAttribute('x2', center.toFixed(2));
			el.baselineCenterLine.setAttribute('y2', yBaseFallback.toString());
			el.shiftedCenterLine.setAttribute('x1', center.toFixed(2));
			el.shiftedCenterLine.setAttribute('y1', '74');
			el.shiftedCenterLine.setAttribute('x2', center.toFixed(2));
			el.shiftedCenterLine.setAttribute('y2', yBaseFallback.toString());
			setText(el.baselineLabel, '0 deg baseline: —');
			setText(el.shiftedLabel, 'Current AOI: —');
			return;
		}

		const xMin = 54;
		const xMax = 486;
		const yBase = 180;
		const amp = 112;
		const width = Math.max(8, lambda0Nm * 0.015);
		const wMin = clamp(lambda0Nm - 4.2 * width, LAMBDA_MIN, LAMBDA_MAX);
		const wMax = clamp(lambda0Nm + 4.2 * width, LAMBDA_MIN, LAMBDA_MAX);
		const lambdaShifted = Number.isFinite(lambdaThetaNm) ? lambdaThetaNm : lambda0Nm;

		const baseCx = wavelengthToX(lambda0Nm, wMin, wMax, xMin, xMax);
		const shiftedCx = wavelengthToX(lambdaShifted, wMin, wMax, xMin, xMax);

		el.curveBaseline.setAttribute('d', buildGaussianCurvePath(xMin, xMax, yBase, amp, baseCx, 42, 96));
		el.curveShifted.setAttribute('d', buildGaussianCurvePath(xMin, xMax, yBase, amp * 0.94, shiftedCx, 44, 96));

		el.baselineCenterLine.setAttribute('x1', baseCx.toFixed(2));
		el.baselineCenterLine.setAttribute('y1', '68');
		el.baselineCenterLine.setAttribute('x2', baseCx.toFixed(2));
		el.baselineCenterLine.setAttribute('y2', yBase.toString());

		el.shiftedCenterLine.setAttribute('x1', shiftedCx.toFixed(2));
		el.shiftedCenterLine.setAttribute('y1', '74');
		el.shiftedCenterLine.setAttribute('x2', shiftedCx.toFixed(2));
		el.shiftedCenterLine.setAttribute('y2', yBase.toString());

		el.baselineLabel.setAttribute('x', (baseCx - 50).toFixed(2));
		el.baselineLabel.setAttribute('y', '58');
		setText(el.baselineLabel, `0 deg baseline: ${formatNumber(lambda0Nm, 1)} nm`);

		el.shiftedLabel.setAttribute('x', (shiftedCx - 54).toFixed(2));
		el.shiftedLabel.setAttribute('y', '208');
		setText(el.shiftedLabel, `Current AOI: ${formatNumber(lambdaShifted, 1)} nm`);
	}

	function updateViz(neff, thetaDeg) {
		const cx = 260;
		const cy = 112;
		const topLen = 90;
		const tAir = DEG_TO_RAD * thetaDeg;

		const ix = cx - topLen * Math.sin(tAir);
		const iy = cy - topLen * Math.cos(tAir);
		el.incidentRay.setAttribute('x1', ix.toFixed(2));
		el.incidentRay.setAttribute('y1', iy.toFixed(2));
		el.incidentRay.setAttribute('x2', String(cx));
		el.incidentRay.setAttribute('y2', String(cy));

		el.thetaArcAir.setAttribute('d', describeArc(cx, cy, 28, -90, -90 - thetaDeg));

		el.airAngleLabel.setAttribute('x', (cx - 54).toString());
		el.airAngleLabel.setAttribute('y', (cy - 28).toString());
		setText(el.airAngleLabel, `AOI = ${thetaDeg.toFixed(1)} deg`);

		setText(el.neffVizLabel, `n_eff = ${Number.isFinite(neff) ? neff.toFixed(3) : '—'}`);
	}

	function syncNeffPresetFromInput() {
		const neff = toNumber(el.neff.value);
		if (!Number.isFinite(neff)) {
			el.neffPreset.value = '';
			return;
		}
		const match = Array.prototype.find.call(el.neffPreset.options, function (opt) {
			if (!opt.value) return false;
			return Math.abs(toNumber(opt.value) - neff) < 1e-6;
		});
		el.neffPreset.value = match ? match.value : '';
	}

	function update() {
		const lambda0Nm = toNumber(el.lambda0.value);
		const neff = toNumber(el.neff.value);
		const thetaDeg = clamp(toNumber(el.theta.value), THETA_MIN, THETA_MAX);

		const lambdaTheta = computeShiftedLambda(lambda0Nm, neff, thetaDeg);
		const delta = Number.isFinite(lambdaTheta) ? (lambdaTheta - lambda0Nm) : NaN;
		const pct = Number.isFinite(lambdaTheta) && lambda0Nm !== 0 ? (delta / lambda0Nm) * 100 : NaN;

		setText(el.lambdaShifted, formatNumber(lambdaTheta, 1));
		setText(el.deltaLambda, formatNumber(delta, 1));
		setText(el.percentShift, Number.isFinite(pct) ? `${pct.toFixed(1)}%` : '—');
		updateViz(neff, thetaDeg);
		updateTransmissionViz(lambda0Nm, lambdaTheta);
	}

	const scheduleUpdate = (function () {
		let rafId = 0;
		return function () {
			if (rafId) return;
			rafId = requestAnimationFrame(function () {
				rafId = 0;
				update();
			});
		};
	})();

	el.lambda0.addEventListener('input', scheduleUpdate);
	el.neff.addEventListener('input', function () {
		syncNeffPresetFromInput();
		scheduleUpdate();
	});
	el.theta.addEventListener('input', function () { syncThetaInputs('number'); scheduleUpdate(); });
	el.thetaRange.addEventListener('input', function () { syncThetaInputs('range'); scheduleUpdate(); });
	el.neffPreset.addEventListener('change', function () {
		if (el.neffPreset.value) {
			el.neff.value = el.neffPreset.value;
		}
		update();
	});
	el.lambda0.addEventListener('change', function () { syncLambdaInput(); update(); });
	el.theta.addEventListener('change', function () { syncThetaInputs('number'); update(); });
	el.thetaRange.addEventListener('change', function () { syncThetaInputs('range'); update(); });

	// initial compute
	syncLambdaInput();
	syncThetaInputs('number');
	syncNeffPresetFromInput();
	update();
})();


