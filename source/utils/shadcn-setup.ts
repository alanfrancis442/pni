import {execSync} from 'child_process';
import {writeFileSync, mkdirSync, existsSync} from 'fs';
import {join, dirname} from 'path';
import type {PackageManager} from './package-manager.js';

export async function setupShadcnNuxt(
	projectPath: string,
	packageManager: PackageManager,
): Promise<void> {
	const isPnpm = packageManager === 'pnpm';
	const execCommand = isPnpm ? 'pnpm dlx' : 'npx';

	// Step 1: Create initial tailwind.css with basic import
	// Always use app/assets/css/tailwind.css for Nuxt projects
	const tailwindCssPath = join(
		projectPath,
		'app',
		'assets',
		'css',
		'tailwind.css',
	);

	mkdirSync(dirname(tailwindCssPath), {recursive: true});
	writeFileSync(tailwindCssPath, '@import "tailwindcss";\n', 'utf-8');

	// Step 2: Run nuxi module add shadcn-nuxt
	execSync(`${execCommand} nuxi@latest module add shadcn-nuxt`, {
		cwd: projectPath,
		stdio: 'inherit',
	});

	// Step 3: Create SSR width plugin
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

	// Step 4: Run nuxi prepare
	execSync(`${execCommand} nuxi@latest prepare`, {
		cwd: projectPath,
		stdio: 'inherit',
	});

	// Step 5: Run shadcn-vue init
	execSync(`${execCommand} shadcn-vue@latest init`, {
		cwd: projectPath,
		stdio: 'inherit',
	});

	// Step 6: Run shadcn-vue add button
	execSync(`${execCommand} shadcn-vue@latest add button`, {
		cwd: projectPath,
		stdio: 'inherit',
	});
}
