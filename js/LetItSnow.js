window.addEventListener('resize', LetItSnow, { passive: true });
LetItSnow();
function LetItSnow() {
	const framerate = 30;
	let snowCanvasId = 'snowCanvas';
	let flakeNumberModifier = 0.05;
	let fallSpeedModifier = 0.4;
	let width = window.innerWidth;
	let sliceWidth = Math.min(width, 1000); // limit max width to window's
	while (width % sliceWidth != 0 && (sliceWidth - width % sliceWidth > sliceWidth / 3)) { // if most of the slice is wasted, adjust it's size
		sliceWidth += Math.ceil((width % sliceWidth) / Math.ceil(width / sliceWidth));
	}
	console.log(width, sliceWidth);
	let height = window.innerHeight;
	let numFlakes = Math.min((sliceWidth * height / 400 * flakeNumberModifier), 10150);
	let flakes = [];
	let TWO_PI = Math.PI * 2;
	let radHeight = 40;
	let range = (start, end) => { // get a random number inside a range
		return Math.random() * (end - start) + start;
	}
	let getRandomFlake = init => ({
		x: range(10, sliceWidth + 10),
		y: init ? range(-5, height + 5) : range(-5 * fallSpeedModifier, -5),
		size: (Math.max(range(1, 4), 2)),
		yMod: range(0, 150),
		waveSize: range(1, 4)
	});
	const tick = (frameTimes = []) => { // main routine
		context.clearRect(0, 0, width, height);
		flakes.forEach((flake, k, flakes) => {
			const framerateModifier = ((frameTimes.length === 2) ? (30 / (1e3 / (frameTimes[1] - frameTimes[0]))) : 1) || 1;
			const x = flake.x + Math.sin(flake.yMod + flake.y / radHeight * (5 - flake.size)) * flake.waveSize * (1 - flake.size) * framerateModifier;
			flake.y += flake.size * fallSpeedModifier * framerateModifier; // bigger flakes are nearer to screen, thus they fall faster to create 3d effect
			if (flake.y > height + 5) {
				flakes[k] = getRandomFlake(); // if snowflake is out of bounds, reset
			}
			context.globalAlpha = (flake.size - 1) / 3;
			context.drawImage(flakeTemplate, x, flake.y, flake.size, flake.size);
		});
		// repeat (sliceWidth)px wide strip with snowflakes to fill whole canvas
		if (width > sliceWidth) {
			context.globalAlpha = 1;
			for (var i = sliceWidth; i < width; i *= 2) {
				context.drawImage(canvas, i, 0);
			}
		}
		window.snowCanvasFrameRequest = requestAnimationFrame(newFrameTime => tick([frameTimes[1], newFrameTime]));
	}
	$('#' + snowCanvasId).forEach(Element.remove);

	let canvas = Element.create('canvas', document.body, { width, height }, snowCanvasId);
	let context = canvas.getContext('2d');
	let flakeTemplate = Element.create('canvas', false, { width : 8, height: 8 }); // create flake graphic
	let flakeTemplateContext = flakeTemplate.getContext('2d');
	flakeTemplateContext.fillStyle = '#fff';
	flakeTemplateContext.beginPath();
	flakeTemplateContext.arc(4, 4, 4, 0, TWO_PI);
	flakeTemplateContext.fill();
	// init snowflakes
	for (i = 0; i < numFlakes; i++) {
		flakes.push(getRandomFlake(true));
	}
	if (window.snowCanvasFrameRequest) cancelAnimationFrame(window.snowCanvasFrameRequest);
	tick();
	
	console.log(
		'Resolution: ', width, 'x', height, ' ~', Math.round(width * height * 100 / 1e6) / 100, 'M', '\n',
		'Slice width: ', sliceWidth, '\n',
		'Slices: ', Math.ceil(width / sliceWidth), '\n',
		'Flakes: ', flakes.length
	);
}
