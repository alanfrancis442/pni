import {existsSync, readFileSync} from 'fs';
import {join} from 'path';
import {execSync} from 'child_process';
import {
	getInstallCommand,
	type PackageManager,
} from './package-manager.js';

/** Map a Nuxt module entry to its npm package name. */
export function moduleToPackageName(module: string): string | null {
	if (
		module.startsWith('.') ||
		module.startsWith('~/') ||
		module.startsWith('@/')
	) {
		return null;
	}

	if (module.startsWith('@')) {
		const parts = module.split('/');
		return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : module;
	}

	if (module.includes('/')) {
		return module.split('/')[0] ?? null;
	}

	return module;
}

export function parseNuxtModulesFromConfig(projectPath: string): string[] {
	const configPath = join(projectPath, 'nuxt.config.ts');
	if (!existsSync(configPath)) {
		return [];
	}

	const content = readFileSync(configPath, 'utf-8');
	const match = content.match(/modules\s*:\s*\[([\s\S]*?)\]/);
	if (!match?.[1]) {
		return [];
	}

	const modules: string[] = [];
	const re = /['"]([^'"]+)['"]/g;
	let capture: RegExpExecArray | null;
	while ((capture = re.exec(match[1])) !== null) {
		if (capture[1]) {
			modules.push(capture[1]);
		}
	}

	return modules;
}

export function getMissingNuxtModulePackages(projectPath: string): string[] {
	const modules = parseNuxtModulesFromConfig(projectPath);
	const packageJsonPath = join(projectPath, 'package.json');
	if (!existsSync(packageJsonPath)) {
		return modules
			.map(moduleToPackageName)
			.filter((pkg): pkg is string => pkg !== null);
	}

	const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
	const deps = {...pkg.dependencies, ...pkg.devDependencies};

	const missing = new Set<string>();
	for (const mod of modules) {
		const pkgName = moduleToPackageName(mod);
		if (pkgName && !deps[pkgName]) {
			missing.add(pkgName);
		}
	}

	return [...missing];
}

export async function installNuxtModulesFromConfig(
	projectPath: string,
	packageManager: PackageManager,
): Promise<void> {
	const missing = getMissingNuxtModulePackages(projectPath);
	if (missing.length === 0) {
		return;
	}

	execSync(getInstallCommand(packageManager, missing), {
		cwd: projectPath,
		stdio: 'inherit',
	});
}
