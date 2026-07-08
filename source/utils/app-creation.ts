import { execSync } from 'child_process';
import type { ProjectType } from './project-detection.js';
import {
	detectPackageManager,
	type PackageManager,
} from './package-manager.js';

function shellQuote(value: string): string {
	return `'${value.replace(/'/g, `'\\''`)}'`;
}

export async function createNuxtApp(
	dir: string,
	name: string,
	packageManager?: PackageManager,
): Promise<void> {
	const pm = packageManager ?? (await detectPackageManager(dir));
	const quotedName = shellQuote(name);

	try {
		execSync(
			`npm create nuxt@latest ${quotedName} -- --template minimal --no-install --packageManager ${pm} --gitInit`,
			{
				cwd: dir,
				stdio: 'inherit',
			},
		);
	} catch (error) {
		throw new Error(`Failed to create Nuxt app: ${error}`);
	}
}

export async function createVueApp(
	dir: string,
	name: string,
): Promise<void> {
	const quotedName = shellQuote(name);

	try {
		execSync(`npm create vue@latest ${quotedName} -- --default`, {
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
	packageManager?: PackageManager,
): Promise<void> {
	if (projectType === 'nuxt') {
		await createNuxtApp(dir, name, packageManager);
	} else if (projectType === 'vue') {
		await createVueApp(dir, name);
	} else {
		throw new Error('Cannot create app: project type must be nuxt or vue');
	}
}
