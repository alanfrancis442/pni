import {existsSync, readFileSync} from 'fs';
import {join} from 'path';

export type ProjectType = 'nuxt' | 'vue' | 'none';

export async function detectProjectType(
	cwd: string = process.cwd(),
): Promise<ProjectType> {
	// Check for Nuxt project
	const nuxtConfigFiles = [
		'nuxt.config.ts',
		'nuxt.config.js',
		'nuxt.config.mjs',
	];
	const hasNuxtConfig = nuxtConfigFiles.some(file =>
		existsSync(join(cwd, file)),
	);

	if (hasNuxtConfig) {
		return 'nuxt';
	}

	// Check package.json for Nuxt
	const packageJsonPath = join(cwd, 'package.json');
	if (existsSync(packageJsonPath)) {
		try {
			const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
			const deps = {
				...packageJson.dependencies,
				...packageJson.devDependencies,
			};
			if (deps.nuxt || deps['@nuxt/kit']) {
				return 'nuxt';
			}
		} catch {
			// Ignore parse errors
		}
	}

	// Check for Vue project
	const viteConfigFiles = [
		'vite.config.ts',
		'vite.config.js',
		'vite.config.mjs',
	];
	const vueConfigFiles = ['vue.config.js', 'vue.config.ts'];
	const hasViteConfig = viteConfigFiles.some(file =>
		existsSync(join(cwd, file)),
	);
	const hasVueConfig = vueConfigFiles.some(file => existsSync(join(cwd, file)));

	if (hasViteConfig || hasVueConfig) {
		return 'vue';
	}

	// Check package.json for Vue
	if (existsSync(packageJsonPath)) {
		try {
			const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
			const deps = {
				...packageJson.dependencies,
				...packageJson.devDependencies,
			};
			if (deps.vue && !deps.nuxt) {
				return 'vue';
			}
		} catch {
			// Ignore parse errors
		}
	}

	return 'none';
}
