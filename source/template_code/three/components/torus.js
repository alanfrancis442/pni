import {TorusGeometry, MathUtils, Mesh, MeshStandardMaterial} from 'three';

function createTorus() {
	const geometry = new TorusGeometry(1, 0.4, 16, 100);
	const material = new MeshStandardMaterial({
		color: '#ff6b9d',
		roughness: 0.3,
		metalness: 0.8,
	});
	const torus = new Mesh(geometry, material);

	torus.position.set(-3, 0, 0);
	torus.rotation.set(0.5, 0, 0);

	const radiansPerSecond = MathUtils.degToRad(20);

	torus.tick = delta => {
		torus.rotation.x += radiansPerSecond * delta;
		torus.rotation.y += radiansPerSecond * delta * 0.5;
	};

	return torus;
}

export {createTorus};
