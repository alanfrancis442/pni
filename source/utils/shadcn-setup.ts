import {execSync} from 'child_process';
import {writeFileSync, mkdirSync, existsSync} from 'fs';
import {join, dirname} from 'path';
import type {PackageManager} from './package-manager.js';

function getExecCommand(packageManager: PackageManager): string {
	return packageManager === 'pnpm' ? 'pnpm dlx' : 'npx';
}

export async function addShadcnNuxtModule(
	projectPath: string,
	packageManager: PackageManager,
): Promise<void> {
	const execCommand = getExecCommand(packageManager);

	execSync(`${execCommand} nuxi@latest module add shadcn-nuxt`, {
		cwd: projectPath,
		stdio: 'inherit',
	});
}

export async function setupSsrWidthPlugin(projectPath: string): Promise<void> {
	const pluginPath1 = join(projectPath, 'app', 'plugins', 'ssr-width.ts');
	const pluginPath2 = join(projectPath, 'plugins', 'ssr-width.ts');
	const pluginPath = existsSync(join(projectPath, 'app'))
		? pluginPath1
		: pluginPath2;

	mkdirSync(dirname(pluginPath), {recursive: true});
	const pluginContent = `import { provideSSRWidth } from '@vueuse/core'

export default defineNuxtPlugin((nuxtApp) => {
  provideSSRWidth(1024, nuxtApp.vueApp)
})
`;
	writeFileSync(pluginPath, pluginContent, 'utf-8');
}

export async function runNuxtPrepare(
	projectPath: string,
	packageManager: PackageManager,
): Promise<void> {
	const execCommand = getExecCommand(packageManager);

	execSync(`${execCommand} nuxi@latest prepare`, {
		cwd: projectPath,
		stdio: 'inherit',
	});
}

export async function initShadcnVue(
	projectPath: string,
	packageManager: PackageManager,
): Promise<void> {
	const execCommand = getExecCommand(packageManager);

	execSync(
		`${execCommand} shadcn-vue@latest init --defaults --template nuxt -b neutral -y`,
		{
			cwd: projectPath,
			stdio: 'inherit',
		},
	);

	execSync(`${execCommand} shadcn-vue@latest add button -y`, {
		cwd: projectPath,
		stdio: 'inherit',
	});
}
