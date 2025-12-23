import {existsSync} from 'fs';
import {join} from 'path';
import {execSync} from 'child_process';

export type PackageManager = 'npm' | 'pnpm' | 'yarn';

export async function detectPackageManager(cwd: string = process.cwd()): Promise<PackageManager> {
	// Check for lock files
	if (existsSync(join(cwd, 'pnpm-lock.yaml'))) {
		return 'pnpm';
	}

	if (existsSync(join(cwd, 'yarn.lock'))) {
		return 'yarn';
	}

	if (existsSync(join(cwd, 'package-lock.json'))) {
		return 'npm';
	}

	// Check if package managers are available
	try {
		execSync('pnpm --version', {stdio: 'ignore'});
		return 'pnpm';
	} catch {
		// pnpm not available
	}

	try {
		execSync('yarn --version', {stdio: 'ignore'});
		return 'yarn';
	} catch {
		// yarn not available
	}

	// Default to npm
	return 'npm';
}

export function getInstallCommand(pm: PackageManager, packages: string[]): string {
	const packageList = packages.join(' ');
	switch (pm) {
		case 'pnpm':
			return `pnpm add ${packageList}`;
		case 'yarn':
			return `yarn add ${packageList}`;
		case 'npm':
		default:
			return `npm install ${packageList}`;
	}
}

export function getDevInstallCommand(pm: PackageManager, packages: string[]): string {
	const packageList = packages.join(' ');
	switch (pm) {
		case 'pnpm':
			return `pnpm add -D ${packageList}`;
		case 'yarn':
			return `yarn add -D ${packageList}`;
		case 'npm':
		default:
			return `npm install --save-dev ${packageList}`;
	}
}

