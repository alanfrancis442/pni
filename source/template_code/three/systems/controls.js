import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

function createControls(camera, canvas) {
	const controls = new OrbitControls(camera, canvas);

	controls.enableDamping = true;
	controls.dampingFactor = 0.05;
	controls.enablePan = true;
	controls.enableZoom = true;
	controls.autoRotate = false;
	controls.autoRotateSpeed = 1;

	// forward controls.update to our custom .tick method
	controls.tick = () => controls.update();

	return controls;
}

export {createControls};
