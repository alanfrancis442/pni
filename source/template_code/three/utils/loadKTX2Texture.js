import {KTX2Loader} from 'three/examples/jsm/loaders/KTX2Loader.js';

let ktx2Loader = null;

function initKTX2Loader(renderer) {
	if (!ktx2Loader) {
		ktx2Loader = new KTX2Loader();
		ktx2Loader.setTranscoderPath('/basis/');
		ktx2Loader.detectSupport(renderer);
	}
	return ktx2Loader;
}

async function loadKTX2Texture(url) {
	if (!ktx2Loader) {
		throw new Error(
			'KTX2Loader not initialized. Call initKTX2Loader(renderer) first.',
		);
	}

	return new Promise((resolve, reject) => {
		ktx2Loader.load(
			url,
			texture => {
				resolve(texture);
			},
			undefined,
			error => {
				reject(error);
			},
		);
	});
}

function disposeKTX2Loader() {
	if (ktx2Loader) {
		ktx2Loader.dispose();
		ktx2Loader = null;
	}
}

export {initKTX2Loader, loadKTX2Texture, disposeKTX2Loader};
