import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'fs';
import {join} from 'path';

// Packages that require lifecycle scripts for a typical PNI Nuxt/Vue stack.
// Kept explicit for pnpm v10+ build-script security.
export const PNPM_ALLOWED_BUILDS = [
	'esbuild',
	'@parcel/watcher',
	'sharp',
	'vue-demi',
] as const;

function formatAllowBuildsYaml(): string {
	const entries = PNPM_ALLOWED_BUILDS.map(pkg => {
		const key = pkg.includes('/') ? `'${pkg}'` : pkg;
		return `  ${key}: true`;
	});

	return `allowBuilds:\n${entries.join('\n')}\n`;
}

export function ensurePnpmAllowBuilds(projectPath: string): void {
	const workspacePath = join(projectPath, 'pnpm-workspace.yaml');
	const allowBuildsBlock = formatAllowBuildsYaml();

	mkdirSync(projectPath, {recursive: true});

	if (!existsSync(workspacePath)) {
		writeFileSync(workspacePath, allowBuildsBlock, 'utf-8');
		return;
	}

	const existingContent = readFileSync(workspacePath, 'utf-8');
	if (existingContent.includes('allowBuilds:')) {
		return;
	}

	const separator = existingContent.endsWith('\n') ? '\n' : '\n\n';
	writeFileSync(
		workspacePath,
		`${existingContent.trimEnd()}${separator}${allowBuildsBlock}`,
		'utf-8',
	);
}

/**
 * nuxi init writes package.json before the module browser runs. On Windows with
 * pnpm, module add expects pnpm-workspace.yaml to already exist — seed it as
 * soon as the project directory is created.
 */
export function seedPnpmAllowBuildsWhenReady(
	projectPath: string,
): {stop: () => void} {
	if (existsSync(join(projectPath, 'pnpm-workspace.yaml'))) {
		return {stop: () => {}};
	}

	const interval = setInterval(() => {
		if (existsSync(join(projectPath, 'package.json'))) {
			ensurePnpmAllowBuilds(projectPath);
			clearInterval(interval);
		}
	}, 25);

	return {
		stop: () => clearInterval(interval),
	};
}
