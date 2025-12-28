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
	
	// Always replace the config with the full template, regardless of whether it exists
	// Generate full config template
	const modules: string[] = [
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

	const configContent = `${tailwindImport}// https://nuxt.com/docs/api/configuration/nuxt-config
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

		configContent = `import { fileURLToPath, URL } from 'node:url'
      ${tailwindImport}import { defineConfig } from 'vite'
      import vue from '@vitejs/plugin-vue'
      import vueDevTools from 'vite-plugin-vue-devtools'
      import viteCompression from 'vite-plugin-compression'
      import Sitemap from 'vite-plugin-sitemap'
      import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

      export default defineConfig(({ mode }) => {
        const isProd = mode === 'production'

        return {
          plugins: [
            vue(),
      ${tailwindPlugin}      // 1. Only load DevTools in development
            !isProd && vueDevTools(),

            ViteImageOptimizer({
              test: /\\.(jpe?g|png|gif|tiff|webp|svg|avif)$/i,
              includePublic: true,
              logStats: true,
              png: { quality: 75 },
              jpeg: { quality: 75 },
              jpg: { quality: 75 },
              webp: { lossless: false, quality: 75 },
              avif: { quality: 70 },
            }),

            Sitemap({
              hostname: 'https://newsetup.com', // Don't forget to update this!
              dynamicRoutes: [],
            }),

            // 2. Gzip Compression (Universal Fallback)
            viteCompression({
              algorithm: 'gzip',
              ext: '.gz',
              threshold: 10240,
              deleteOriginFile: false,
            }),

            // 3. Brotli Compression (Modern Performance)
            viteCompression({
              algorithm: 'brotliCompress',
              ext: '.br',
              threshold: 10240,
              deleteOriginFile: false,
            }),
          ],

          resolve: {
            alias: {
              '@': fileURLToPath(new URL('./src', import.meta.url))
            },
          },

          build: {
            cssMinify: 'lightningcss', // Ensure 'lightningcss' is in package.json
            // 4. Split Chunks for better Browser Caching
            rollupOptions: {
              output: {
                manualChunks(id) {
                  if (id.includes('node_modules')) {
                    // Split standard Vue dependencies into their own chunk
                    if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
                      return 'vue-vendor';
                    }
      ${threejsChunk}
                    
                    return 'vendor';
                  }
                },
              },
            },
          },

          esbuild: {
            drop: isProd ? ['console', 'debugger'] : [],
          },
        }
      })
`;
	}

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
		await generateViteConfig(projectPath, threejs, cssVars);
	}

	// Note: Vue projects with @tailwindcss/vite don't need tailwind.config.js or postcss.config.js
}
