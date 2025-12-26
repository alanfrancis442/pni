import {SRGBColorSpace, WebGLRenderer} from 'three';

function createRenderer() {
	const renderer = new WebGLRenderer({
		powerPreference: 'high-performance',
		// antialias: false,
		// stencil: false,
		// depth: false,
		alpha: true,
	});
	renderer.outputColorSpace = SRGBColorSpace;
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

	return renderer;
}

export {createRenderer};
