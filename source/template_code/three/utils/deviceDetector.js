// Device detection utility with resize handling

const BREAKPOINTS = {
	mobile: 768,
	tablet: 1024,
};

let deviceType = 'desktop';
let windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
let resizeHandler = null;

/**
 * Determines the device type based on window width
 * @returns {string} 'mobile' | 'tablet' | 'desktop'
 */
function getDeviceType() {
	if (typeof window === 'undefined') {
		return 'desktop';
	}

	const width = window.innerWidth;

	if (width < BREAKPOINTS.mobile) {
		return 'mobile';
	} else if (width < BREAKPOINTS.tablet) {
		return 'tablet';
	}
	return 'desktop';
}

/**
 * Updates the current device type
 */
function updateDeviceType() {
	const newDeviceType = getDeviceType();
	const newWidth = window.innerWidth;

	if (newDeviceType !== deviceType || newWidth !== windowWidth) {
		deviceType = newDeviceType;
		windowWidth = newWidth;

		// Dispatch custom event for listeners
		if (typeof window !== 'undefined') {
			window.dispatchEvent(
				new CustomEvent('devicechange', {
					detail: {deviceType, width: windowWidth},
				}),
			);
		}
	}
}

/**
 * Initializes device detection and sets up resize listener
 */
function initDeviceDetector() {
	if (typeof window === 'undefined') {
		return;
	}

	// Initial detection
	updateDeviceType();

	// Set up resize listener with debounce
	let resizeTimeout;
	resizeHandler = () => {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(() => {
			updateDeviceType();
		}, 150);
	};

	window.addEventListener('resize', resizeHandler);
}

/**
 * Cleans up the resize listener
 */
function disposeDeviceDetector() {
	if (resizeHandler && typeof window !== 'undefined') {
		window.removeEventListener('resize', resizeHandler);
		resizeHandler = null;
	}
}

/**
 * Gets the current device type
 * @returns {string} Current device type
 */
function getCurrentDevice() {
	return deviceType;
}

/**
 * Gets the current window width
 * @returns {number} Current window width
 */
function getCurrentWidth() {
	return windowWidth;
}

/**
 * Checks if current device is mobile
 * @returns {boolean}
 */
function isMobile() {
	return deviceType === 'mobile';
}

/**
 * Checks if current device is tablet
 * @returns {boolean}
 */
function isTablet() {
	return deviceType === 'tablet';
}

/**
 * Checks if current device is desktop
 * @returns {boolean}
 */
function isDesktop() {
	return deviceType === 'desktop';
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
	initDeviceDetector();
}

export {
	initDeviceDetector,
	disposeDeviceDetector,
	getCurrentDevice,
	getCurrentWidth,
	getDeviceType,
	isMobile,
	isTablet,
	isDesktop,
	BREAKPOINTS,
};
