import {camera} from './camera.js';
import {createScene} from './scene.js';
import {createControls} from './systems/controls.js';
import {createRenderer} from './systems/renderer.js';
import {Resizer} from './systems/Resizer.js';
import {Loop} from './systems/Loop.js';
import {createPostprocessing} from './systems/post-processing.js';

class World {
	constructor(container) {
		this.container = container;
		this.camera = camera;
		this.scene = null;
		this.renderer = createRenderer();
		this.loop = null;
		this.controls = null;
		this.resizer = null;
		this.composer = null;

		// Append canvas to container
		container.append(this.renderer.domElement);
	}

	init() {
		// Create scene
		this.scene = createScene();

		// Create controls
		this.controls = createControls(this.camera, this.renderer.domElement);

		// Create post-processing composer
		this.composer = createPostprocessing(
			this.scene,
			this.camera,
			this.renderer,
		);

		// Create loop
		this.loop = new Loop(this.camera, this.scene, this.renderer, this.composer);

		// Add scene updatables to loop
		if (this.scene.userData.updatables) {
			this.loop.updatables.push(...this.scene.userData.updatables);
		}

		// Add controls to loop
		this.loop.updatables.push(this.controls);

		// Initialize resizer
		this.resizer = new Resizer(
			this.container,
			this.camera,
			this.renderer,
			this.composer,
		);
	}

	start() {
		if (this.loop) {
			this.loop.start();
		}
	}

	stop() {
		if (this.loop) {
			this.loop.stop();
		}
	}

	dispose() {
		// Stop animation loop
		this.stop();

		// Dispose controls
		if (this.controls) {
			this.controls.dispose();
		}

		// Traverse scene and dispose geometries, materials, and textures
		if (this.scene) {
			this.scene.traverse(object => {
				if (object.geometry) {
					object.geometry.dispose();
				}
				if (object.material) {
					if (Array.isArray(object.material)) {
						object.material.forEach(material => {
							this.disposeMaterial(material);
						});
					} else {
						this.disposeMaterial(object.material);
					}
				}
			});
		}

		// Dispose composer
		if (this.composer) {
			this.composer.dispose();
		}

		// Dispose renderer and remove canvas
		if (this.renderer) {
			this.renderer.dispose();
			if (this.renderer.domElement && this.renderer.domElement.parentNode) {
				this.renderer.domElement.parentNode.removeChild(
					this.renderer.domElement,
				);
			}
		}

		// Clear references
		this.camera = null;
		this.scene = null;
		this.renderer = null;
		this.composer = null;
		this.loop = null;
		this.controls = null;
		this.resizer = null;
	}

	disposeMaterial(material) {
		if (material.map) material.map.dispose();
		if (material.lightMap) material.lightMap.dispose();
		if (material.bumpMap) material.bumpMap.dispose();
		if (material.normalMap) material.normalMap.dispose();
		if (material.specularMap) material.specularMap.dispose();
		if (material.envMap) material.envMap.dispose();
		material.dispose();
	}
}

export {World};
