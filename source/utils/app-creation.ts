import {execSync} from 'child_process';
import type {ProjectType} from './project-detection.js';
import {
	detectPackageManager,
	getCreateNuxtCommand,
	getCreateVueCommand,
	type PackageManager,
} from './package-manager.js';

export type CreateAppOptions = {
	browseNuxtModules?: boolean;
};

function shellQuote(value: string): string {
	return `'${value.replace(/'/g, `'\\''`)}'`;
}

function scaffoldEnv(browseNuxtModules: boolean): NodeJS.ProcessEnv {
	if (browseNuxtModules) {
		return {...process.env};
	}

	// Ink provides a TTY; suppress nuxi prompts unless the user opted in.
	return {...process.env, CI: 'true'};
}

export async function createNuxtApp(
	dir: string,
	name: string,
	packageManager?: PackageManager,
	options: CreateAppOptions = {},
): Promise<void> {
	const pm = packageManager ?? (await detectPackageManager(dir));
	const quotedName = shellQuote(name);
	const browseModules = options.browseNuxtModules ?? false;

	try {
		execSync(getCreateNuxtCommand(pm, quotedName, browseModules), {
			cwd: dir,
			stdio: 'inherit',
			env: scaffoldEnv(browseModules),
		});
	} catch (error) {
		throw new Error(`Failed to create Nuxt app: ${error}`);
	}
}

export async function createVueApp(
	dir: string,
	name: string,
	packageManager?: PackageManager,
): Promise<void> {
	const pm = packageManager ?? (await detectPackageManager(dir));
	const quotedName = shellQuote(name);

	try {
		execSync(getCreateVueCommand(pm, quotedName), {
			cwd: dir,
			stdio: 'inherit',
			env: scaffoldEnv(false),
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
	options: CreateAppOptions = {},
): Promise<void> {
	if (projectType === 'nuxt') {
		await createNuxtApp(dir, name, packageManager, options);
	} else if (projectType === 'vue') {
		await createVueApp(dir, name, packageManager);
	} else {
		throw new Error('Cannot create app: project type must be nuxt or vue');
	}
}
