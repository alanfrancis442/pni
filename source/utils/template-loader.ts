import {readFileSync, existsSync} from 'fs';
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get the template directory path
 * When compiled: dist/utils/template-loader.js -> dist/template_code
 * When in source: source/utils/template-loader.ts -> source/template_code
 */
function getTemplateDir(): string {
	let templateDir = join(__dirname, '..', 'template_code');
	
	// Check if template directory exists, if not try source location
	if (!existsSync(templateDir)) {
		// Try from source location (for development/testing)
		const sourceTemplateDir = join(
			__dirname,
			'..',
			'..',
			'source',
			'template_code',
		);
		if (existsSync(sourceTemplateDir)) {
			return sourceTemplateDir;
		}
	}
	
	return templateDir;
}

/**
 * Load a template file and return its content
 * @param templatePath - Path to template file relative to template_code directory
 * @returns Template content as string
 */
export function loadTemplate(templatePath: string): string {
	const templateDir = getTemplateDir();
	const fullPath = join(templateDir, templatePath);
	
	try {
		return readFileSync(fullPath, 'utf-8');
	} catch (error) {
		throw new Error(
			`Template not found: ${fullPath}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
		);
	}
}

/**
 * Load a template and replace placeholders
 * @param templatePath - Path to template file relative to template_code directory
 * @param replacements - Object with placeholder keys and replacement values
 * @returns Template content with replacements applied
 */
export function loadTemplateWithReplacements(
	templatePath: string,
	replacements: Record<string, string>,
): string {
	let content = loadTemplate(templatePath);
	
	// Replace all placeholders in format {{KEY}}
	for (const [key, value] of Object.entries(replacements)) {
		const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
		content = content.replace(placeholder, value);
	}
	
	return content;
}

