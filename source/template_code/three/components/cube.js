import {BoxGeometry, MathUtils, Mesh, MeshStandardMaterial} from 'three';

function createCube() {
	const geometry = new BoxGeometry(1.5, 1.5, 1.5);
	const material = new MeshStandardMaterial({
		color: '#ffd93d',
		roughness: 0.4,
		metalness: 0.6,
	});
	const cube = new Mesh(geometry, material);

	cube.position.set(0, 0, 0);
	cube.rotation.set(-0.5, -0.1, 0.8);

	const radiansPerSecond = MathUtils.degToRad(30);

	cube.tick = delta => {
		// increase the cube's rotation each frame
		cube.rotation.z += radiansPerSecond * delta;
		cube.rotation.x += radiansPerSecond * delta;
		cube.rotation.y += radiansPerSecond * delta;
	};

	return cube;
}

export {createCube};
