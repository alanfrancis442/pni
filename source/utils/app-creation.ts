import {execSync} from 'child_process';
import type {ProjectType} from './project-detection.js';

export async function createNuxtApp(dir: string, name: string): Promise<void> {
	try {
		execSync(`npx nuxi@latest init ${name}`, {
			cwd: dir,
			stdio: 'inherit',
		});
	} catch (error) {
		throw new Error(`Failed to create Nuxt app: ${error}`);
	}
}

export async function createVueApp(dir: string, name: string): Promise<void> {
	try {
		// Use npm create vue@latest for Vue 3
		execSync(`npm create vue@latest ${name}`, {
			cwd: dir,
			stdio: 'inherit',
		});
	} catch (error) {
		throw new Error(`Failed to create Vue app: ${error}`);
	}
}

export async function createApp(
	projectType: ProjectType,
	dir: string,
	name: string,
): Promise<void> {
	if (projectType === 'nuxt') {
		await createNuxtApp(dir, name);
	} else if (projectType === 'vue') {
		await createVueApp(dir, name);
	} else {
		throw new Error('Cannot create app: project type must be nuxt or vue');
	}
}
