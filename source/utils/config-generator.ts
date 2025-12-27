import {readFileSync, writeFileSync, existsSync} from 'fs';
import {join} from 'path';
import type {ProjectType} from './project-detection.js';

export async function generateNuxtConfig(
	projectPath: string,
 //@ts-ignore
	threejs: boolean,
	cssVars: boolean,
): Promise<void> {
	const configPath = join(projectPath, 'nuxt.config.ts');
	let configContent = '';

	if (existsSync(configPath)) {
		configContent = readFileSync(configPath, 'utf-8');
	} else {
		// Generate full config template
		const modules: string[] = [
			'shadcn-nuxt',
			'@nuxtjs/seo',
			'@nuxt/image',
			'@nuxtjs/device',
		];

		// Always use app/assets/css/tailwind.css for Nuxt projects
		const cssImport = '~/app/assets/css/tailwind.css';

		const tailwindImport = cssVars
			? "import tailwindcss from '@tailwindcss/vite'\n\n"
			: '';

		configContent = `${tailwindImport}// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // 1. Updated to a realistic 2024/2025 date for Nuxt 4 features
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

${cssVars ? `  css: ['${cssImport}'],\n\n` : ''}  ssr: true,


  // SEO: Centralizing data
  site: {
    name: 'New Setup',
    url: 'https://newsetup.com',
    description: 'A new setup for your project',
    defaultLocale: 'en',
  },

  // App Config for UI-wide settings
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { name: 'description', content: 'A new setup for your project' },
        { name: 'author', content: 'New Setup' },
        { property: 'og:type', content: 'website' },
        { name: 'msapplication-TileColor', content: '#000000' },
        { name: 'theme-color', content: '#000000' },
      ],
      link: [
        // { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        // { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon-180x180.png' },
        // { rel: 'manifest', href: '/manifest.webmanifest' },
      ],
    },
  },

${
	cssVars
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
		: ''
}  nitro: {
    compressPublicAssets: {
      brotli: true,
      gzip: true,
    },
    // Enable crawling for SEO module compatibility
    prerender: {
      //  set to true for production
      crawlLinks: false,
      routes: ['/']
    }
  },

  modules: [${modules.map(m => `'${m}'`).join(', ')}],


  //  Image Optimization
  image: {
    quality: 95,
    format: ['webp'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1200,
      xl: 1400,
      xxl: 1800,
      '2xl': 2000,
    },
  },

  // UI Framework: Shadcn
${
	cssVars
		? `  shadcn: {
    prefix: '',
    componentDir: '@/components/ui',
  },

`
		: ''
}  ogImage: {
    defaults: {
      component: 'OgImageTemplate',
      props: {
        title: 'New Setup',
        description: 'A new setup for your project',
        image: 'https://newsetup.com/og-image.png',
      },
    }
  },
  robots: {
    disallow: ['/api',],
  },



  sitemap: {
    // sources: ['/api/__sitemap__/urls'] // Fetch from API
  },
})
`;
		writeFileSync(configPath, configContent, 'utf-8');
		return;
	}

	// If config exists, merge new modules and settings
	const modules: string[] = [];
	if (cssVars && !configContent.includes('shadcn-nuxt')) {
		modules.push('shadcn-nuxt');
	}
	if (!configContent.includes('@nuxtjs/seo')) {
		modules.push('@nuxtjs/seo');
	}
	if (!configContent.includes('@nuxt/image')) {
		modules.push('@nuxt/image');
	}
	if (!configContent.includes('@nuxtjs/device')) {
		modules.push('@nuxtjs/device');
	}

	// Add compatibilityDate if not present
	if (!configContent.includes('compatibilityDate')) {
		configContent = configContent.replace(
			/export default defineNuxtConfig\(\{/,
			`export default defineNuxtConfig({
  // 1. Updated to a realistic 2024/2025 date for Nuxt 4 features
  compatibilityDate: '2024-11-01',`,
		);
	}

	// Add ssr if not present
	if (!configContent.includes('ssr:')) {
		configContent = configContent.replace(
			/compatibilityDate:\s*'[^']*',/,
			`$&\n  ssr: true,`,
		);
	}

	// Add CSS import if cssVars is true
	if (cssVars) {
		// Always use app/assets/css/tailwind.css for Nuxt projects
		const cssImport = '~/app/assets/css/tailwind.css';

		if (!configContent.includes('import tailwindcss')) {
			configContent = `import tailwindcss from '@tailwindcss/vite'\n\n${configContent}`;
		}

		if (!configContent.includes('css:')) {
			configContent = configContent.replace(
				/devtools:\s*\{[^}]*\},/,
				`$&\n\n  css: ['${cssImport}'],`,
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
		if (!configContent.includes('vite:')) {
			configContent = configContent.replace(
				/ssr:\s*true,/,
				`$&\n\n  vite: {
    plugins: [tailwindcss()],
    esbuild: {
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
    build: {
      // Ensures CSS is also minified correctly by lightningcss (default in Vite 6)
      cssMinify: 'lightningcss'
    }
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
				/ssr:\s*true,/,
				`$&\n\n  modules: [${modules.map(m => `'${m}'`).join(', ')}],`,
			);
		}
	}

	// Add app.head config if not present
	if (!configContent.includes('app:')) {
		configContent = configContent.replace(
			/site:\s*\{[^}]*\},/,
			`$&\n\n  // App Config for UI-wide settings
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { name: 'description', content: 'A new setup for your project' },
        { name: 'author', content: 'New Setup' },
        { property: 'og:type', content: 'website' },
        { name: 'msapplication-TileColor', content: '#000000' },
        { name: 'theme-color', content: '#000000' },
      ],
      link: [
        // { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        // { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon-180x180.png' },
        // { rel: 'manifest', href: '/manifest.webmanifest' },
      ],
    },
  },`,
		);
	}

	// Add nitro config if not present
	if (!configContent.includes('nitro:')) {
		configContent = configContent.replace(
			/vite:\s*\{[^}]*\},/,
			`$&\n\n  nitro: {
    compressPublicAssets: {
      brotli: true,
      gzip: true,
    },
    // Enable crawling for SEO module compatibility
    prerender: {
      //  set to true for production
      crawlLinks: false,
      routes: ['/']
    }
  },`,
		);
	}

	// Add image config if not present
	if (!configContent.includes('image:')) {
		configContent = configContent.replace(
			/modules:\s*\[[^\]]*\],/,
			`$&\n\n  //  Image Optimization
  image: {
    quality: 95,
    format: ['webp'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1200,
      xl: 1400,
      xxl: 1800,
      '2xl': 2000,
    },
  },`,
		);
	}

	// Add shadcn config if cssVars is true
	if (cssVars && !configContent.includes('shadcn:')) {
		configContent = configContent.replace(
			/image:\s*\{[^}]*\},/,
			`$&\n\n  // UI Framework: Shadcn
  shadcn: {
    prefix: '',
    componentDir: '@/components/ui',
  },`,
		);
	}

	// Update site config if not present
	if (!configContent.includes('site:')) {
		configContent = configContent.replace(
			/compatibilityDate:\s*'[^']*',/,
			`$&\n\n  // SEO: Centralizing data
  site: {
    name: 'New Setup',
    url: 'https://newsetup.com',
    description: 'A new setup for your project',
    defaultLocale: 'en',
  },`,
		);
	}

	// Update ogImage config if not present
	if (!configContent.includes('ogImage:')) {
		configContent = configContent.replace(
			/sitemap:\s*\{[^}]*\},/,
			`$&\n  ogImage: {
    defaults: {
      component: 'OgImageTemplate',
      props: {
        title: 'New Setup',
        description: 'A new setup for your project',
        image: 'https://newsetup.com/og-image.png',
      },
    }
  },`,
		);
	}

	// Update robots config if not present
	if (!configContent.includes('robots:')) {
		configContent = configContent.replace(
			/ogImage:\s*\{[^}]*\},/,
			`$&\n  robots: {
    disallow: ['/api',],
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
    ${
			projectType === 'nuxt'
				? "'./components/**/*.{js,vue,ts}',"
				: "'./index.html',"
		}
    ${
			projectType === 'nuxt'
				? "'./layouts/**/*.vue',"
				: "'./src/**/*.{vue,js,ts,jsx,tsx}',"
		}
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

export async function generatePostCSSConfig(
	projectPath: string,
): Promise<void> {
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
