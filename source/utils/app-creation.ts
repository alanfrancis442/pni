import {execSync} from 'child_process';
import {join} from 'path';
import type {ProjectType} from './project-detection.js';
import {
	detectPackageManager,
	getCreateNuxtCommand,
	getCreateVueCommand,
	type PackageManager,
} from './package-manager.js';
import {
	ensurePnpmAllowBuilds,
	seedPnpmAllowBuildsWhenReady,
} from './pnpm-allow-builds.js';

export type CreateAppOptions = {
	browseNuxtModules?: boolean;
};

function shellQuote(value: string): string {
	if (process.platform === 'win32') {
		return `"${value.replace(/"/g, '\\"')}"`;
	}

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
	const projectPath = join(dir, name);

	let stopPnpmSeed: (() => void) | undefined;
	if (browseModules && pm === 'pnpm') {
		stopPnpmSeed = seedPnpmAllowBuildsWhenReady(projectPath).stop;
	}

	try {
		execSync(getCreateNuxtCommand(pm, quotedName, browseModules), {
			cwd: dir,
			stdio: 'inherit',
			env: scaffoldEnv(browseModules),
		});
	} catch (error) {
		throw new Error(`Failed to create Nuxt app: ${error}`);
	} finally {
		stopPnpmSeed?.();
		if (browseModules && pm === 'pnpm') {
			ensurePnpmAllowBuilds(projectPath);
		}
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
