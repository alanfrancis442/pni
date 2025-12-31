import {writeFileSync, mkdirSync, readFileSync, existsSync} from 'fs';
import {join, dirname} from 'path';
import type {ProjectType} from './project-detection.js';
import {loadTemplate} from './template-loader.js';

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
		// Vue: src/assets/main.css
		cssPath = join(projectPath, 'src', 'assets', 'main.css');
	}

	// Ensure directory exists
	mkdirSync(dirname(cssPath), {recursive: true});

	if (initialSetup && projectType === 'nuxt') {
		// For initial Nuxt setup, just write the basic import
		writeFileSync(cssPath, '@import "tailwindcss";\n', 'utf-8');
	} else {
		// Overwrite the CSS file with full content
		let cssContent = loadTemplate('css/tailwind.css.template');
		
		// Remove tw-animate-css import for Vue projects
		if (projectType === 'vue') {
			cssContent = cssContent.replace(/@import "tw-animate-css";\n/g, '');
		}
		
		writeFileSync(cssPath, cssContent.trim() + '\n', 'utf-8');
	}
}

export async function updateIndexHtml(projectPath: string): Promise<void> {
	const indexPath = join(projectPath, 'index.html');
	
	if (!existsSync(indexPath)) {
		return; // Skip if index.html doesn't exist
	}
	
	let htmlContent = readFileSync(indexPath, 'utf-8');
	
	// Check if stylesheet link already exists
	if (htmlContent.includes('/src/assets/main.css')) {
		return; // Already added
	}
	
	// Add stylesheet link in the head section
	// Look for <head> tag and add the link before closing </head>
	if (htmlContent.includes('</head>')) {
		htmlContent = htmlContent.replace(
			'</head>',
			'  <link href="/src/assets/main.css" rel="stylesheet">\n</head>',
		);
	} else if (htmlContent.includes('<head>')) {
		// If no closing head tag, add after opening head tag
		htmlContent = htmlContent.replace(
			'<head>',
			'<head>\n  <link href="/src/assets/main.css" rel="stylesheet">',
		);
	} else {
		// If no head tag at all, add it after <html>
		htmlContent = htmlContent.replace(
			'<html>',
			'<html>\n<head>\n  <link href="/src/assets/main.css" rel="stylesheet">\n</head>',
		);
	}
	
	writeFileSync(indexPath, htmlContent, 'utf-8');
}

export async function createTypographyPage(projectPath: string, projectType?: ProjectType): Promise<void> {
	if (projectType === 'nuxt') {
		// For Nuxt, create in app/pages
		const pagesDir = join(projectPath, 'app', 'pages');
		const typographyPagePath = join(pagesDir, 'typography', 'index.vue');
		
		// Ensure directory exists
		mkdirSync(dirname(typographyPagePath), {recursive: true});
		
		const typographyPageContent = loadTemplate('nuxt/pages/typography/index.vue.template');
		writeFileSync(typographyPagePath, typographyPageContent, 'utf-8');
	} else if (projectType === 'vue') {
		// For Vue, Typography.vue is already created in setupVueAppStructure
		// This function is mainly for Nuxt, but kept for consistency
		// Vue typography page is created during setupVueAppStructure
	}
}
