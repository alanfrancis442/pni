import {Scene, Color} from 'three';
import {createCube} from './components/cube.js';
import {createTorus} from './components/torus.js';
import {createSphere} from './components/sphere.js';
import {createLights} from './components/lights.js';

function createScene() {
	const scene = new Scene();
	scene.background = new Color('#1a1a1a');

	// Add meshes
	const cube = createCube();
	const torus = createTorus();
	const sphere = createSphere();

	scene.add(cube, torus, sphere);

	// Add lights
	const {ambientLight, mainLight} = createLights();
	scene.add(ambientLight, mainLight);

	// Store animatable objects
	scene.userData.updatables = [cube, torus, sphere];

	return scene;
}

export {createScene};
