import {writeFileSync, mkdirSync, readFileSync, existsSync} from 'fs';
import {join, dirname} from 'path';
import type {ProjectType} from './project-detection.js';

const CSS_VARIABLES_CONTENT = `
@import "tailwindcss";
@import "tw-animate-css";

@font-face {
  font-family: 'Helvetica';
  src: url('~/assets/fonts/Helvetica.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@custom-variant dark (&:is(.dark *));

@theme inline {
  --spacing: 4rem;
  --font-helvetica: 'Helvetica', sans-serif;
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

:root {
  /* osmo scaling system starts here  */
  --size-unit: 16; /* body font-size in design - no px */
  --size-container-ideal: 1440; /* screen-size in design - no px */
  --size-container-min: 992px;
  --size-container-max: 1920px;
  --size-container: clamp(var(--size-container-min), 100vw, var(--size-container-max));
  --size-font: calc(var(--size-container) / (var(--size-container-ideal) / var(--size-unit)));

  /* 1 fluid pixel unit */
  --fluid-px: calc(var(--size-font) / 16);
  /* osmo scaling system ends here  */



  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground;
  }
}

html {
  font-size: var(--fluid-px);
}

body {
  /* figma design 16px fontsize = 16rem fluid pixel unit */
  font-size: 16rem;
  font-family: var(--font-helvetica);
}


/* osmo scaling system starts here  */


.container {
  max-width: var(--size-container);
}

.container.medium {
  max-width: calc(var(--size-container) * 0.85);
}

.container.small {
  max-width: calc(var(--size-container) * 0.7);
}

/* Tablet */
@media screen and (max-width: 991px) {
  :root {
    --size-container-ideal: 834;
    /* screen-size in design - no px */
    --size-container-min: 768px;
    --size-container-max: 991px;
  }

  body {
    background-color: red;
  }
}

/* Mobile Landscape */
@media screen and (max-width: 767px) {
  :root {
    --size-container-ideal: 550;
    /* screen-size in design - no px */
    --size-container-min: 480px;
    --size-container-max: 767px;
  }

  body {
    background-color: blue;
  }
}

/* Mobile Portrait */
@media screen and (max-width: 479px) {
  :root {
    --size-container-ideal: 375;
    /* screen-size in design - no px */
    --size-container-min: 320px;
    --size-container-max: 479px;
  }

  body {
    background-color: green;
  }
}

`;

export async function generateCSSVariables(
	projectType: ProjectType,
	projectPath: string,
	initialSetup: boolean = false,
): Promise<void> {
	let cssPath: string;

	if (projectType === 'nuxt') {
		// Nuxt: always use app/assets/css/tailwind.css
		cssPath = join(projectPath, 'app', 'assets', 'css', 'tailwind.css');
	} else {
		// Vue: src/assets/style.css
		cssPath = join(projectPath, 'src', 'assets', 'style.css');
	}

	// Ensure directory exists
	mkdirSync(dirname(cssPath), {recursive: true});

	if (initialSetup && projectType === 'nuxt') {
		// For initial Nuxt setup, just write the basic import
		writeFileSync(cssPath, '@import "tailwindcss";\n', 'utf-8');
	} else {
		// Overwrite the CSS file with full content
		writeFileSync(cssPath, CSS_VARIABLES_CONTENT.trim() + '\n', 'utf-8');
	}
}

export async function updateIndexHtml(projectPath: string): Promise<void> {
	const indexPath = join(projectPath, 'index.html');
	
	if (!existsSync(indexPath)) {
		return; // Skip if index.html doesn't exist
	}
	
	let htmlContent = readFileSync(indexPath, 'utf-8');
	
	// Check if stylesheet link already exists
	if (htmlContent.includes('/src/assets/style.css')) {
		return; // Already added
	}
	
	// Add stylesheet link in the head section
	// Look for <head> tag and add the link before closing </head>
	if (htmlContent.includes('</head>')) {
		htmlContent = htmlContent.replace(
			'</head>',
			'  <link href="/src/assets/style.css" rel="stylesheet">\n</head>',
		);
	} else if (htmlContent.includes('<head>')) {
		// If no closing head tag, add after opening head tag
		htmlContent = htmlContent.replace(
			'<head>',
			'<head>\n  <link href="/src/assets/style.css" rel="stylesheet">',
		);
	} else {
		// If no head tag at all, add it after <html>
		htmlContent = htmlContent.replace(
			'<html>',
			'<html>\n<head>\n  <link href="/src/assets/style.css" rel="stylesheet">\n</head>',
		);
	}
	
	writeFileSync(indexPath, htmlContent, 'utf-8');
}

export async function createTypographyPage(projectPath: string, projectType?: ProjectType): Promise<void> {
	// For Nuxt, create in app/pages, for Vue use pages
	const pagesDir = projectType === 'nuxt' 
		? join(projectPath, 'app', 'pages')
		: join(projectPath, 'pages');
	const typographyPagePath = join(pagesDir, 'typography', 'index.vue');
	
	// Ensure directory exists
	mkdirSync(dirname(typographyPagePath), {recursive: true});
	
	const typographyPageContent = `<script setup lang="ts">
</script>

<template>
    <section class="w-full py-20 px-4 min-h-screen flex items-center justify-center bg-[#DADADA] flex-col gap-16 ">
        <div class="hero-container flex flex-col gap-16 leading-[1.2]">
            <!-- figma design 120px fontsize -->
            <h1 class="md:text-[120rem] text-[72rem]">Heading H1</h1>
            <div class="divider"></div>
            <!-- figma design 80px fontsize -->
            <h2 class="md:text-[80rem] text-[64rem]">Heading H2</h2>
            <div class="divider"></div>
            <h3 class="md:text-[40rem] text-[32rem]">Heading H3</h3>
            <!-- figma design 40px fontsize -->
            <div class="divider"></div>
            <h4 class="md:text-[28rem] text-[24rem]">Heading H4</h4>
            <!-- figma design 28px fontsize -->
            <div class="divider"></div>
            <h5 class="md:text-[20rem] text-[18rem]">Heading H5</h5>
            <!-- figma design 20px fontsize -->
            <div class="divider"></div>
            <!-- figma design  16px fontsize -->
            <p class="text-[16rem] leading-[1.4] max-md:max-w-85.75 w-full font-helvetica">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum
                tristique. Duis cursus,  all links in the website, eros dolor interdum nulla, ut commodo diam libero
                vitae erat. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
                laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae
                vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
                sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
            </p>
        </div>
    </section>
</template>

<style scoped>
.hero-container {
    max-width: calc(1184em / 16);
}

.divider {
    background-color: #969696;
    height: 1px;
    width: 100%;
}
</style>
`;
	
	writeFileSync(typographyPagePath, typographyPageContent, 'utf-8');
}
