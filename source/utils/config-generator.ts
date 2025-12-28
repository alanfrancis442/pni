import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'fs';
import {join} from 'path';
import type {ProjectType} from './project-detection.js';
import {loadTemplateWithReplacements, loadTemplate} from './template-loader.js';

export async function generateNuxtConfig(
	projectPath: string,
	//@ts-ignore
	threejs: boolean,
	cssVars: boolean,
): Promise<void> {
	const configPath = join(projectPath, 'nuxt.config.ts');
	
	// Always replace the config with the full template, regardless of whether it exists
	const modules: string[] = [
		'lenis/nuxt',
		'shadcn-nuxt',
		'@nuxtjs/seo',
		'@nuxt/image',
		'@nuxtjs/device',
	];

	// Use assets/css/tailwind.css for Nuxt projects
	const cssImport = '~/assets/css/tailwind.css';

	const tailwindImport = cssVars
		? "import tailwindcss from '@tailwindcss/vite'\n\n"
		: '';

	const viteConfig = cssVars
		? `  vite: {
    plugins: [tailwindcss()],
    esbuild: {
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
    build: {
      // Ensures CSS is also minified correctly by lightningcss (default in Vite 6)
      cssMinify: 'lightningcss'
    }
  },

`
		: '';

	const shadcnConfig = cssVars
		? `  shadcn: {
    prefix: '',
    componentDir: '@/components/ui',
  },


`
		: '';

	const cssImportLine = cssVars ? `  css: ['${cssImport}'],\n\n` : '';

	const configContent = loadTemplateWithReplacements('nuxt/nuxt.config.ts.template', {
		TAILWIND_IMPORT: tailwindImport,
		CSS_IMPORT: cssImportLine,
		VITE_CONFIG: viteConfig,
		MODULES: modules.map(m => `'${m}'`).join(', '),
		SHADCN_CONFIG: shadcnConfig,
	});

	// Always write the full config, replacing any existing one
	writeFileSync(configPath, configContent, 'utf-8');
}

export async function generateViteConfig(
	projectPath: string,
	//@ts-ignore
	threejs: boolean,
	cssVars: boolean = false,
): Promise<void> {
	const configPath = join(projectPath, 'vite.config.ts');
	let configContent = '';

	if (existsSync(configPath)) {
		configContent = readFileSync(configPath, 'utf-8');
		
		// If cssVars is enabled and tailwindcss plugin is not present, add it
		if (cssVars && !configContent.includes('@tailwindcss/vite')) {
			// Add import
			if (!configContent.includes("import tailwindcss from '@tailwindcss/vite'")) {
				configContent = configContent.replace(
					/import { defineConfig } from 'vite'/,
					"import { defineConfig } from 'vite'\nimport tailwindcss from '@tailwindcss/vite'",
				);
			}
			
			// Add to plugins array
			if (configContent.includes('plugins: [')) {
				configContent = configContent.replace(
					/plugins:\s*\[/,
					'plugins: [\n      tailwindcss(),',
				);
			}
		}
	} else {
		const threejsChunk = threejs
			? `              // If you use heavy libs (like Three.js), split them too
              if (id.includes('three')) return 'three-vendor';`
			: '';

		const tailwindImport = cssVars
			? "import tailwindcss from '@tailwindcss/vite'\n"
			: '';

		const tailwindPlugin = cssVars ? '      tailwindcss(),\n' : '';

		configContent = loadTemplateWithReplacements('vite/vite.config.ts.template', {
			TAILWIND_IMPORT: tailwindImport,
			TAILWIND_PLUGIN: tailwindPlugin,
			THREEJS_CHUNK: threejsChunk,
		});
	}

	writeFileSync(configPath, configContent, 'utf-8');
}

export async function generateTailwindConfig(
	projectPath: string,
	projectType: ProjectType,
): Promise<void> {
	const configPath = join(projectPath, 'tailwind.config.js');
	
	let contentPaths: string;
	if (projectType === 'nuxt') {
		contentPaths = `    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',`;
	} else {
		contentPaths = `    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',`;
	}

	const configContent = loadTemplateWithReplacements('tailwind/tailwind.config.js.template', {
		CONTENT_PATHS: contentPaths,
	});

	writeFileSync(configPath, configContent, 'utf-8');
}

export async function generatePostCSSConfig(
	projectPath: string,
): Promise<void> {
	const configPath = join(projectPath, 'postcss.config.js');
	const configContent = loadTemplate('postcss/postcss.config.js.template');
	writeFileSync(configPath, configContent, 'utf-8');
}

export async function setupNuxtAppStructure(projectPath: string): Promise<void> {
	// Set up app.vue with NuxtLayout, NuxtPage, and Lenis
	const appVuePath = join(projectPath, 'app.vue');
	const appVueContent = loadTemplate('nuxt/app.vue.template');
	writeFileSync(appVuePath, appVueContent, 'utf-8');

	// Create app/pages directory if it doesn't exist
	const pagesDir = join(projectPath, 'app', 'pages');
	if (!existsSync(pagesDir)) {
		mkdirSync(pagesDir, {recursive: true});
	}

	// Create app/pages/index.vue
	const indexPagePath = join(pagesDir, 'index.vue');
	const indexPageContent = loadTemplate('nuxt/pages/index.vue.template');
	writeFileSync(indexPagePath, indexPageContent, 'utf-8');
}

export async function generateConfigFiles(
	projectType: ProjectType,
	projectPath: string,
	threejs: boolean,
	cssVars: boolean,
): Promise<void> {
	if (projectType === 'nuxt') {
		await generateNuxtConfig(projectPath, threejs, cssVars);
	} else if (projectType === 'vue') {
		await generateViteConfig(projectPath, threejs, cssVars);
	}

	// Note: Vue projects with @tailwindcss/vite don't need tailwind.config.js or postcss.config.js
}
