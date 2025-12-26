import {SphereGeometry, MathUtils, Mesh, MeshStandardMaterial} from 'three';

function createSphere() {
	const geometry = new SphereGeometry(1, 32, 32);
	const material = new MeshStandardMaterial({
		color: '#4ecdc4',
		roughness: 0.2,
		metalness: 0.5,
	});
	const sphere = new Mesh(geometry, material);

	sphere.position.set(3, 0, 0);

	const radiansPerSecond = MathUtils.degToRad(15);
	let time = 0;

	sphere.tick = delta => {
		time += delta;
		sphere.position.y = Math.sin(time * 2) * 0.5;
		sphere.rotation.y += radiansPerSecond * delta;
	};

	return sphere;
}

export {createSphere};
