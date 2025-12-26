const setSize = (container, camera, renderer, composer) => {
	camera.aspect = container.clientWidth / container.clientHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(container.clientWidth, container.clientHeight);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	composer.setSize(container.clientWidth, container.clientHeight);
};

class Resizer {
	constructor(container, camera, renderer, composer) {
		// set initial size on load
		setSize(container, camera, renderer, composer);

		window.addEventListener('resize', () => {
			// set the size again if a resize occurs
			setSize(container, camera, renderer, composer);
			// perform any custom actions
			this.onResize();
		});
	}

	onResize() {}
}

export {Resizer};
