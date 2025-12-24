import {readFileSync, writeFileSync, existsSync} from 'fs';
import {join} from 'path';
import type {ProjectType} from './project-detection.js';

export async function generateNuxtConfig(
	projectPath: string,
	threejs: boolean,
	cssVars: boolean,
): Promise<void> {
	const configPath = join(projectPath, 'nuxt.config.ts');
	let configContent = '';

	if (existsSync(configPath)) {
		configContent = readFileSync(configPath, 'utf-8');
	} else {
		configContent = `// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true }
})
`;
	}

	// Build modules array
	const modules: string[] = [];
	if (threejs && !configContent.includes('@tresjs/nuxt')) {
		modules.push('@tresjs/nuxt');
	}
	if (cssVars && !configContent.includes('shadcn-nuxt')) {
		modules.push('shadcn-nuxt');
	}
	if (!configContent.includes('@nuxtjs/seo')) {
		modules.push('@nuxtjs/seo');
	}

	// Add compatibilityDate if not present
	if (!configContent.includes('compatibilityDate')) {
		configContent = configContent.replace(
			/export default defineNuxtConfig\(\{/,
			`export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',`,
		);
	}

	// Add CSS import if cssVars is true
	if (cssVars) {
		const tailwindCssPath1 = join(projectPath, 'app', 'assets', 'css', 'tailwind.css');
		const tailwindCssPath2 = join(projectPath, 'assets', 'css', 'tailwind.css');
		const tailwindCssPath = existsSync(join(projectPath, 'app')) ? tailwindCssPath1 : tailwindCssPath2;
		const cssImport = tailwindCssPath.includes('app/') ? '~/app/assets/css/tailwind.css' : '~/assets/css/tailwind.css';
		
		if (!configContent.includes('css:')) {
			configContent = configContent.replace(
				/export default defineNuxtConfig\(\{/,
				`export default defineNuxtConfig({
  css: ['${cssImport}'],`,
			);
		} else if (!configContent.includes(cssImport)) {
			configContent = configContent.replace(
				/css:\s*\[/,
				`css: ['${cssImport}',`,
			);
		}
	}

	// Add vite plugins for Tailwind if cssVars is true
	if (cssVars && !configContent.includes('@tailwindcss/vite')) {
		if (!configContent.includes('import tailwindcss')) {
			configContent = `import tailwindcss from '@tailwindcss/vite'\n\n${configContent}`;
		}

		if (!configContent.includes('vite:')) {
			configContent = configContent.replace(
				/export default defineNuxtConfig\(\{/,
				`export default defineNuxtConfig({
  vite: {
    plugins: [tailwindcss()],
  },`,
			);
		} else if (!configContent.includes('tailwindcss()')) {
			configContent = configContent.replace(
				/vite:\s*\{/,
				`vite: {
    plugins: [tailwindcss()],`,
			);
		}
	}

	// Add modules
	if (modules.length > 0) {
		if (configContent.includes('modules:')) {
			// Add to existing modules array
			const existingModules = configContent.match(/modules:\s*\[([^\]]*)\]/);
			if (existingModules && existingModules[1]) {
				const existingModuleList = existingModules[1].trim();
				const allModules = [...modules];
				if (existingModuleList) {
					const existing = existingModuleList
						.split(',')
						.map(m => m.trim().replace(/['"]/g, ''));
					allModules.push(...existing);
				}
				const uniqueModules = [...new Set(allModules)];
				configContent = configContent.replace(
					/modules:\s*\[[^\]]*\]/,
					`modules: [${uniqueModules.map(m => `'${m}'`).join(', ')}]`,
				);
			}
		} else {
			// Add new modules array
			configContent = configContent.replace(
				/export default defineNuxtConfig\(\{/,
				`export default defineNuxtConfig({
  modules: [${modules.map(m => `'${m}'`).join(', ')}],`,
			);
		}
	}

	// Add shadcn config if cssVars is true
	if (cssVars && !configContent.includes('shadcn:')) {
		configContent = configContent.replace(
			/export default defineNuxtConfig\(\{/,
			`export default defineNuxtConfig({
  shadcn: {
    prefix: '',
    componentDir: '@/components/ui',
  },`,
		);
	}

	// Add SEO config if not present
	if (!configContent.includes('site:')) {
		configContent = configContent.replace(
			/export default defineNuxtConfig\(\{/,
			`export default defineNuxtConfig({
  site: {
    name: 'New Setup',
    url: 'https://newsetup.com',
    description: 'A new setup for your project',
    image: 'https://newsetup.com/og-image.png',
  },
  ogImage: {
    defaults: {
      component: 'OgImage',
      props: {
        title: 'New Setup',
        description: 'A new setup for your project',
        image: 'https://newsetup.com/og-image.png',
      },
    }
  },
  robots: {
    disallow: ['/api'],
  },
  sitemap: {
    // sources: ['/api/__sitemap__/urls'] // Fetch from API
  },`,
		);
	}

	writeFileSync(configPath, configContent, 'utf-8');
}

export async function generateViteConfig(
	projectPath: string,
  //@ts-ignore
	threejs: boolean,
): Promise<void> {
	const configPath = join(projectPath, 'vite.config.ts');
	let configContent = '';

	if (existsSync(configPath)) {
		configContent = readFileSync(configPath, 'utf-8');
	} else {
		configContent = `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
})
`;
	}

	// For Vue projects with Three.js, we might need to add optimizations
	// The actual Three.js setup would be done in the Vue app itself
	// This is a placeholder for any Vite-specific Three.js optimizations

	writeFileSync(configPath, configContent, 'utf-8');
}

export async function generateTailwindConfig(
	projectPath: string,
	projectType: ProjectType,
): Promise<void> {
	const configPath = join(projectPath, 'tailwind.config.js');
	const configContent = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    ${projectType === 'nuxt' ? "'./components/**/*.{js,vue,ts}'," : "'./index.html',"}
    ${projectType === 'nuxt' ? "'./layouts/**/*.vue'," : "'./src/**/*.{vue,js,ts,jsx,tsx}',"}
    ${projectType === 'nuxt' ? "'./pages/**/*.vue'," : ''}
    ${projectType === 'nuxt' ? "'./plugins/**/*.{js,ts}'," : ''}
    ${projectType === 'nuxt' ? "'./app.vue'," : ''}
    ${projectType === 'nuxt' ? "'./error.vue'," : ''}
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
`;

	writeFileSync(configPath, configContent, 'utf-8');
}

export async function generatePostCSSConfig(projectPath: string): Promise<void> {
	const configPath = join(projectPath, 'postcss.config.js');
	const configContent = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;

	writeFileSync(configPath, configContent, 'utf-8');
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
		await generateViteConfig(projectPath, threejs);
	}

	if (cssVars && projectType !== 'nuxt') {
		// Only generate Tailwind config for Vue projects
		// Nuxt uses @tailwindcss/vite which doesn't need this
		await generateTailwindConfig(projectPath, projectType);
		await generatePostCSSConfig(projectPath);
	}
}

