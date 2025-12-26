import {TextureLoader} from 'three';

// Global texture loader instance
const textureLoader = new TextureLoader();

async function loadTexture(url) {
	return new Promise((resolve, reject) => {
		textureLoader.load(
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

export {textureLoader, loadTexture};
