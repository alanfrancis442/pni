import {PerspectiveCamera} from 'three';

const getAspectRatio = () => {
	if (typeof window !== 'undefined') {
		return window.innerWidth / window.innerHeight;
	}
	return 16 / 9; // Default aspect ratio for SSR
};

const getFov = (z = 500) => {
	// avoid accessing window during SSR
	if (typeof window !== 'undefined') {
		return (180 * (2 * Math.atan(window.innerHeight / 2 / z))) / Math.PI;
	}
	// Use a default 16:9 height for SSR (e.g., 1080p)
	const defaultHeight = 1080;
	return (180 * (2 * Math.atan(defaultHeight / 2 / z))) / Math.PI;
};

const camera = new PerspectiveCamera(
	50, // fov = Field Of View
	getAspectRatio(), // aspect ratio
	0.01, // near clipping plane
	1000, // far clipping plane
);

camera.position.set(0, 0, 8);

export {camera};
export default camera;
