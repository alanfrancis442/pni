export interface DependencySet {
	production: string[];
	dev: string[];
}

export const BASE_NUXT_DEPS: DependencySet = {
	production: [
		'@vueuse/core',
		'@nuxtjs/seo',
		'@nuxt/image',
		'@nuxtjs/device',
		'shadcn-nuxt',
	],
	dev: [],
};

export const BASE_VUE_DEPS: DependencySet = {
	production: [],
	dev: [],
};

export const THREEJS_NUXT_DEPS: DependencySet = {
	production: ['three', '@vueuse/core', 'postprocessing'],
	dev: ['@types/three'],
};

export const THREEJS_VUE_DEPS: DependencySet = {
	production: ['three', '@vueuse/core'],
	dev: [],
};

export const CSS_VARS_DEPS: DependencySet = {
	production: [],
	dev: ['tailwindcss', '@tailwindcss/vite'],
};

export const CSS_VARS_NUXT_DEPS: DependencySet = {
	production: [],
	dev: ['typescript', 'tailwindcss', '@tailwindcss/vite'],
};

export function getDependencies(
	projectType: 'nuxt' | 'vue',
	threejs: boolean,
	cssVars: boolean,
): DependencySet {
	const deps: DependencySet = {
		production: ['gsap', 'lenis'],
		dev: [],
	};

	if (projectType === 'nuxt') {
		deps.production.push(...BASE_NUXT_DEPS.production);
		deps.dev.push(...BASE_NUXT_DEPS.dev);
	} else {
		deps.production.push(...BASE_VUE_DEPS.production);
		deps.dev.push(...BASE_VUE_DEPS.dev);
	}

	if (threejs) {
		if (projectType === 'nuxt') {
			deps.production.push(...THREEJS_NUXT_DEPS.production);
			deps.dev.push(...THREEJS_NUXT_DEPS.dev);
		} else {
			deps.production.push(...THREEJS_VUE_DEPS.production);
			deps.dev.push(...THREEJS_VUE_DEPS.dev);
		}
	}

	if (cssVars) {
		if (projectType === 'nuxt') {
			deps.production.push(...CSS_VARS_NUXT_DEPS.production);
			deps.dev.push(...CSS_VARS_NUXT_DEPS.dev);
		} else {
			deps.production.push(...CSS_VARS_DEPS.production);
			deps.dev.push(...CSS_VARS_DEPS.dev);
		}
	}

	// Remove duplicates
	deps.production = [...new Set(deps.production)];
	deps.dev = [...new Set(deps.dev)];

	return deps;
}
