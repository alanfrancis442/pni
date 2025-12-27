#!/usr/bin/env node
import {cpSync} from 'fs';
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sourceDir = join(__dirname, '..', 'source', 'template_code');
const destDir = join(__dirname, '..', 'dist', 'template_code');

try {
	cpSync(sourceDir, destDir, {recursive: true});
	console.log('✓ Template files copied to dist/');
} catch (error) {
	console.error('Error copying template files:', error);
	process.exit(1);
}

