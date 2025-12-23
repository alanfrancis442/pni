import {readFileSync, writeFileSync, existsSync} from 'fs-extra';
import {join} from 'path';
import type {ProjectType} from './project-detection.js';

export async function generateNuxtConfig(
	projectPath: string,
	threejs: boolean,
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

	// Add TresJS module if Three.js is selected
	if (threejs && !configContent.includes('@tresjs/nuxt')) {
		// Try to add the module to the modules array
		if (configContent.includes('modules:')) {
			configContent = configContent.replace(
				/modules:\s*\[/,
				'modules: [\n    \'@tresjs/nuxt\',',
			);
		} else {
			// Add modules array if it doesn't exist
			configContent = configContent.replace(
				/export default defineNuxtConfig\(\{/,
				`export default defineNuxtConfig({
  modules: ['@tresjs/nuxt'],`,
			);
		}
	}

	writeFileSync(configPath, configContent, 'utf-8');
}

export async function generateViteConfig(
	projectPath: string,
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
		await generateNuxtConfig(projectPath, threejs);
	} else if (projectType === 'vue') {
		await generateViteConfig(projectPath, threejs);
	}

	if (cssVars) {
		await generateTailwindConfig(projectPath, projectType);
		await generatePostCSSConfig(projectPath);
	}
}

