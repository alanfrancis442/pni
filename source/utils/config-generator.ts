import {readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync} from 'fs';
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
	// For Vue projects, use .js extension; check both .ts and .js
	const configJsPath = join(projectPath, 'vite.config.js');
	const configTsPath = join(projectPath, 'vite.config.ts');
	
	// Determine which file exists or which to create
	let configPath = configJsPath;
	let existingPath: string | null = null;
	
	if (existsSync(configJsPath)) {
		existingPath = configJsPath;
		configPath = configJsPath;
	} else if (existsSync(configTsPath)) {
		existingPath = configTsPath;
		// We'll convert .ts to .js
		configPath = configJsPath;
	}
	
	let configContent = '';

	if (existingPath) {
		configContent = readFileSync(existingPath, 'utf-8');
		
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
		
		// If we're converting from .ts to .js, write to .js and remove .ts
		if (existingPath === configTsPath && configPath === configJsPath) {
			writeFileSync(configJsPath, configContent, 'utf-8');
			// Remove the .ts file
			unlinkSync(configTsPath);
			return;
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

		// Use .js template for Vue projects
		configContent = loadTemplateWithReplacements('vite/vite.config.js.template', {
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
	// Ensure app directory exists
	const appDir = join(projectPath, 'app');
	if (!existsSync(appDir)) {
		mkdirSync(appDir, {recursive: true});
	}

	// Set up app.vue with NuxtLayout, NuxtPage, and Lenis in app folder
	const appVuePath = join(appDir, 'app.vue');
	const appVueContent = loadTemplate('nuxt/app.vue.template');
	writeFileSync(appVuePath, appVueContent, 'utf-8');

	// Create app/pages directory if it doesn't exist
	const pagesDir = join(appDir, 'pages');
	if (!existsSync(pagesDir)) {
		mkdirSync(pagesDir, {recursive: true});
	}

	// Create app/pages/index.vue
	const indexPagePath = join(pagesDir, 'index.vue');
	const indexPageContent = loadTemplate('nuxt/pages/index.vue.template');
	writeFileSync(indexPagePath, indexPageContent, 'utf-8');
}

export async function setupVueAppStructure(projectPath: string): Promise<void> {
	const srcDir = join(projectPath, 'src');
	if (!existsSync(srcDir)) {
		mkdirSync(srcDir, {recursive: true});
	}

	// Set up App.vue with RouterView and Lenis
	const appVuePath = join(srcDir, 'App.vue');
	const appVueContent = loadTemplate('vue/App.vue.template');
	writeFileSync(appVuePath, appVueContent, 'utf-8');

	// Create router directory
	const routerDir = join(srcDir, 'router');
	if (!existsSync(routerDir)) {
		mkdirSync(routerDir, {recursive: true});
	}

	// Create router/index.js
	const routerPath = join(routerDir, 'index.js');
	const routerContent = loadTemplate('vue/router/index.js.template');
	writeFileSync(routerPath, routerContent, 'utf-8');

	// Create pages directory
	const pagesDir = join(srcDir, 'pages');
	if (!existsSync(pagesDir)) {
		mkdirSync(pagesDir, {recursive: true});
	}

	// Create pages/Home.vue
	const homePagePath = join(pagesDir, 'Home.vue');
	const homePageContent = loadTemplate('vue/pages/Home.vue.template');
	writeFileSync(homePagePath, homePageContent, 'utf-8');

	// Create pages/Typography.vue
	const typographyPagePath = join(pagesDir, 'Typography.vue');
	const typographyPageContent = loadTemplate('vue/pages/Typography.vue.template');
	writeFileSync(typographyPagePath, typographyPageContent, 'utf-8');

	// Check package.json for installed Vue packages
	const packageJsonPath = join(projectPath, 'package.json');
	const detectedPlugins: Array<{name: string; import: string; use: string}> = [];
	
	// Map of common Vue packages to their import and usage patterns
	const vuePluginMap: Record<string, {import: string; use: string; checkFile?: string}> = {
		pinia: {
			import: "import { createPinia } from 'pinia'",
			use: 'app.use(createPinia())',
		},
		vuex: {
			import: "import store from './store'",
			use: 'app.use(store)',
			checkFile: 'src/store/index.js', // Check if store file exists
		},
		'vue-i18n': {
			import: "import i18n from './i18n'",
			use: 'app.use(i18n)',
			checkFile: 'src/i18n/index.js',
		},
		'vue-toastification': {
			import: "import Toast from 'vue-toastification'\nimport 'vue-toastification/dist/index.css'",
			use: 'app.use(Toast)',
		},
		'@vueuse/core': {
			// VueUse doesn't need app.use(), but we can detect it for reference
			import: '',
			use: '',
		},
	};
	
	if (existsSync(packageJsonPath)) {
		try {
			const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
			const deps = {...packageJson.dependencies, ...packageJson.devDependencies};
			
			// Detect installed plugins
			for (const [pkgName, config] of Object.entries(vuePluginMap)) {
				if (deps[pkgName] && config.import && config.use) {
					// For plugins that require a file check (like vuex store), verify file exists
					if (config.checkFile) {
						const checkFilePath = join(projectPath, config.checkFile);
						// Also check for .ts and .js variants
						const checkFileTs = checkFilePath.replace(/\.js$/, '.ts');
						if (!existsSync(checkFilePath) && !existsSync(checkFileTs)) {
							continue; // Skip if required file doesn't exist
						}
					}
					
					detectedPlugins.push({
						name: pkgName,
						import: config.import,
						use: config.use,
					});
				}
			}
		} catch {
			// If package.json can't be read, continue without plugins
		}
	}

	// Update or create main.js to use router and handle Pinia
	const mainJsPath = join(srcDir, 'main.js');
	const mainTsPath = join(srcDir, 'main.ts');
	
	// Check if main.ts exists (legacy) or main.js exists
	let mainPath = existsSync(mainJsPath) ? mainJsPath : (existsSync(mainTsPath) ? mainTsPath : null);
	
	if (mainPath) {
		let mainContent = readFileSync(mainPath, 'utf-8');
		
		// Check if router is already imported
		if (!mainContent.includes('import router')) {
			// Add router import
			if (mainContent.includes("import { createApp } from 'vue'")) {
				let importsToAdd = "import router from './router'";
				
				// Add plugin imports
				for (const plugin of detectedPlugins) {
					if (plugin.import) {
						const firstImportLine = plugin.import.split('\n')[0];
						if (firstImportLine && !mainContent.includes(firstImportLine)) {
							importsToAdd += '\n' + plugin.import;
						}
					}
				}
				
				mainContent = mainContent.replace(
					"import { createApp } from 'vue'",
					`import { createApp } from 'vue'\n${importsToAdd}`,
				);
			}
			
			// Add router and plugins to app.use() - find the createApp line and modify
			if (mainContent.includes('createApp')) {
				// Check if it's a one-liner or multi-line
				if (mainContent.match(/createApp\([^)]+\)\.(use|mount)\(/)) {
					// One-liner: createApp(App).use(...).mount(...)
					let useChain = 'app.use(router)';
					for (const plugin of detectedPlugins) {
						if (!mainContent.includes(plugin.use)) {
							useChain += '\n' + plugin.use;
						}
					}
					mainContent = mainContent.replace(
						/(createApp\([^)]+\))/,
						'const app = $1\n\n' + useChain + '\n',
					);
					mainContent = mainContent.replace(
						/\.(use|mount)\([^)]+\)\.mount\(/,
						'.mount(',
					);
				} else {
					// Multi-line: already has const app = createApp(...)
					if (!mainContent.includes('app.use(router)')) {
						let useChain = 'app.use(router)';
						for (const plugin of detectedPlugins) {
							if (!mainContent.includes(plugin.use)) {
								useChain += '\n' + plugin.use;
							}
						}
						mainContent = mainContent.replace(
							/(const app = createApp\([^)]+\))/,
							`$1\n\n${useChain}`,
						);
					} else {
						// Router already added, just add missing plugins
						for (const plugin of detectedPlugins) {
							if (!mainContent.includes(plugin.use)) {
								mainContent = mainContent.replace(
									/(app\.use\([^)]+\))/,
									`$1\n${plugin.use}`,
								);
							}
						}
					}
				}
			}
			
			// If main.ts exists, rename to main.js
			if (mainPath === mainTsPath && mainPath !== mainJsPath) {
				writeFileSync(mainJsPath, mainContent, 'utf-8');
				// Optionally remove main.ts (but we'll leave it for now to avoid breaking things)
			} else {
				writeFileSync(mainPath, mainContent, 'utf-8');
			}
		}
	} else {
		// Create main.js if it doesn't exist
		// Build plugin imports and uses
		let pluginImports = '';
		let pluginUses = '';
		
		for (const plugin of detectedPlugins) {
			pluginImports += plugin.import + '\n';
			pluginUses += plugin.use + '\n';
		}
		
		const mainContent = loadTemplateWithReplacements('vue/main.js.template', {
			PLUGIN_IMPORTS: pluginImports,
			PLUGIN_USES: pluginUses,
		});
		writeFileSync(mainJsPath, mainContent, 'utf-8');
	}
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
