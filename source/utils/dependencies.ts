export interface DependencySet {
	production: string[];
	dev: string[];
}

export const BASE_NUXT_DEPS: DependencySet = {
	production: [],
	dev: [],
};

export const BASE_VUE_DEPS: DependencySet = {
	production: [],
	dev: [],
};

export const THREEJS_NUXT_DEPS: DependencySet = {
	production: ['three', '@vueuse/core', '@tresjs/nuxt'],
	dev: [],
};

export const THREEJS_VUE_DEPS: DependencySet = {
	production: ['three', '@vueuse/core', '@tresjs/core', '@tresjs/cientos'],
	dev: [],
};

export const CSS_VARS_DEPS: DependencySet = {
	production: [],
	dev: ['tailwindcss', 'postcss', 'autoprefixer'],
};

export function getDependencies(
	projectType: 'nuxt' | 'vue',
	threejs: boolean,
	cssVars: boolean,
): DependencySet {
	const deps: DependencySet = {
		production: [],
		dev: [],
	};

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
		deps.production.push(...CSS_VARS_DEPS.production);
		deps.dev.push(...CSS_VARS_DEPS.dev);
	}

	return deps;
}

