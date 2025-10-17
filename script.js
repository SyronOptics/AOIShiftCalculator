// AOI Shift Simulator logic

(function () {
	const n0 = 1.0; // incident medium: air

	const el = {
		lambda0: document.getElementById('lambda0'),
		neff: document.getElementById('neff'),
		theta: document.getElementById('theta'),
		thetaRange: document.getElementById('thetaRange'),
		lambdaShifted: document.getElementById('lambdaShifted'),
		deltaLambda: document.getElementById('deltaLambda'),
		percentShift: document.getElementById('percentShift')
	};

	function toNumber(input) {
		const v = typeof input === 'number' ? input : parseFloat(String(input));
		return Number.isFinite(v) ? v : NaN;
	}

	function computeShiftedLambda(lambda0Nm, neff, thetaDeg) {
		if (neff <= 0) return NaN;
		const thetaRad = (Math.PI / 180) * thetaDeg;
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
			el.thetaRange.value = el.theta.value;
		} else if (from === 'range') {
			el.theta.value = el.thetaRange.value;
		}
	}

	function update() {
		const lambda0Nm = toNumber(el.lambda0.value);
		const neff = toNumber(el.neff.value);
		const thetaDeg = toNumber(el.theta.value);

		const lambdaTheta = computeShiftedLambda(lambda0Nm, neff, thetaDeg);
		const delta = Number.isFinite(lambdaTheta) ? (lambdaTheta - lambda0Nm) : NaN;
		const pct = Number.isFinite(lambdaTheta) && lambda0Nm !== 0 ? (delta / lambda0Nm) * 100 : NaN;

		el.lambdaShifted.textContent = formatNumber(lambdaTheta, 3);
		el.deltaLambda.textContent = formatNumber(delta, 3);
		el.percentShift.textContent = Number.isFinite(pct) ? `${pct.toFixed(3)}%` : '—';
	}

	['input', 'change'].forEach(function (evt) {
		el.lambda0.addEventListener(evt, update);
		el.neff.addEventListener(evt, update);
		el.theta.addEventListener(evt, function () { syncThetaInputs('number'); update(); });
		el.thetaRange.addEventListener(evt, function () { syncThetaInputs('range'); update(); });
	});

	// initial compute
	syncThetaInputs('number');
	update();
})();


