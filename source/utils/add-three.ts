import {existsSync, readFileSync, writeFileSync, mkdirSync, cpSync} from 'fs';
import {join, dirname, basename, resolve, relative} from 'path';
import {fileURLToPath} from 'url';
import {detectProjectType} from './project-detection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Find app folder by looking for app directory going up the directory tree (Nuxt)
 * or src folder (Vue)
 */
function findComposablesFolder(startPath: string, projectType: 'nuxt' | 'vue'): string {
	let currentPath = resolve(startPath);

	while (currentPath !== dirname(currentPath)) {
		if (projectType === 'nuxt') {
			const appPath = join(currentPath, 'app');
			if (existsSync(appPath)) {
				return join(appPath, 'composables');
			}
		} else {
			// Vue project
			const srcPath = join(currentPath, 'src');
			if (existsSync(srcPath)) {
				return join(srcPath, 'composables');
			}
		}
		currentPath = dirname(currentPath);
	}

	if (projectType === 'nuxt') {
		throw new Error(
			'app folder not found. Please run this command in a Nuxt project with an app directory.',
		);
	} else {
		throw new Error(
			'src folder not found. Please run this command in a Vue project.',
		);
	}
}

/**
 * Find project root by looking for package.json going up the directory tree
 */
function findProjectRoot(startPath: string): string {
	let currentPath = resolve(startPath);

	while (currentPath !== dirname(currentPath)) {
		const packageJsonPath = join(currentPath, 'package.json');
		if (existsSync(packageJsonPath)) {
			return currentPath;
		}
		currentPath = dirname(currentPath);
	}

	throw new Error(
		'Project root not found. Please run this command in a Nuxt/Vue project.',
	);
}

export async function addThree(
	currentDir: string,
): Promise<{
	directoryName: string;
	appFolder: string;
	threePath: string;
	projectType: 'nuxt' | 'vue';
	fileExtension: 'js' | 'ts';
}> {
	const currentPath = resolve(currentDir);
	const directoryName = basename(currentPath);

	// Find project root to check for three.js
	const projectRoot = findProjectRoot(currentPath);
	const packageJsonPath = join(projectRoot, 'package.json');
	const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
	const deps = {...packageJson.dependencies, ...packageJson.devDependencies};

	if (!deps.three) {
		throw new Error(
			'Three.js is not installed. Please install it first: npm install three',
		);
	}

	// Detect project type
	const projectType = await detectProjectType(projectRoot);
	if (projectType !== 'nuxt' && projectType !== 'vue') {
		throw new Error(
			'Project type not supported. Please run this command in a Nuxt or Vue project.',
		);
	}

	// Find composables folder (app/composables for Nuxt, src/composables for Vue)
	const composablesFolder = findComposablesFolder(currentPath, projectType);
	const appFolder = projectType === 'nuxt' 
		? join(composablesFolder, '..') // app folder
		: join(composablesFolder, '..'); // src folder

	// Get template directory path
	// When compiled: dist/utils/add-three.js -> dist/template_code/three
	// When in source: source/utils/add-three.ts -> source/template_code/three
	let templateDir = join(__dirname, '..', 'template_code', 'three');
	if (!existsSync(templateDir)) {
		// Try from source location (for development/testing)
		const sourceTemplateDir = join(
			__dirname,
			'..',
			'..',
			'source',
			'template_code',
			'three',
		);
		if (existsSync(sourceTemplateDir)) {
			templateDir = sourceTemplateDir;
		} else {
			throw new Error(
				'Three.js template not found. Expected at: ' +
					templateDir +
					' or ' +
					sourceTemplateDir,
			);
		}
	}

	// Copy template to three/ in current directory (where command is run)
	const targetDir = join(currentPath, 'three');

	// Copy the template directory
	if (existsSync(targetDir)) {
		throw new Error('three directory already exists. Please remove it first.');
	}

	cpSync(templateDir, targetDir, {recursive: true});

	// Create composables/{directoryName} inside app/src folder
	const composablesTargetDir = join(composablesFolder, directoryName);

	if (!existsSync(composablesTargetDir)) {
		mkdirSync(composablesTargetDir, {recursive: true});
	}

	// Calculate import path from composables/{directoryName} to three folder
	// The import path should be @/pages/{directoryName}/three/World.js when run in a pages directory
	const currentPathRelative = relative(projectRoot, currentPath).replace(
		/\\/g,
		'/',
	);
	
	// Check if the current path is in a pages directory
	let importPath: string;
	if (currentPathRelative.startsWith('pages/')) {
		// If we're in a pages directory (Vue), use @/pages/{directoryName}/three/World.js
		importPath = `@/pages/${directoryName}/three/World.js`;
	} else if (currentPathRelative.startsWith('app/pages/')) {
		// If we're in app/pages directory (Nuxt), use @/pages/{directoryName}/three/World.js
		// Note: @/ in Nuxt resolves to project root, so app/pages becomes pages
		importPath = `@/pages/${directoryName}/three/World.js`;
	} else {
		// Otherwise, use the relative path from project root
		const threePathRelative = relative(projectRoot, targetDir).replace(
			/\\/g,
			'/',
		);
		importPath = `@/${threePathRelative}/World.js`;
	}

	// Determine file extension based on project type
	const fileExtension = projectType === 'vue' ? 'js' : 'ts';

	// Create usethree.{js|ts}
	const useThreePath = join(composablesTargetDir, `usethree.${fileExtension}`);
	// Type annotations only for TypeScript
	const typeAnnotations = projectType === 'nuxt' 
		? `: Ref<HTMLElement | null>` 
		: '';
	const typeImports = projectType === 'nuxt'
		? `, type Ref`
		: '';
	const worldType = projectType === 'nuxt' ? `<World | null>` : '';
	const errorType = projectType === 'nuxt' ? `<Error | null>` : '';

	const useThreeContent = `import { ref, onMounted, onBeforeUnmount, markRaw, nextTick${typeImports} } from 'vue';
import { World } from '${importPath}';

export function useThree(containerRef${typeAnnotations}) {
  const world = ref${worldType}(null);
  const isLoading = ref(true);
  const error = ref${errorType}(null);

  const init = async () => {
    if (!containerRef.value) {
      error.value = new Error('Container element not found');
      isLoading.value = false;
      return;
    }

    try {
      // Create Three.js world and mark as non-reactive to prevent proxy issues
      const worldInstance = new World(containerRef.value);
      world.value = markRaw(worldInstance);
      
      // Initialize scene
      world.value.init();
      
      // Start render loop
      world.value.start();
      
      isLoading.value = false;
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Failed to initialize Three.js');
      isLoading.value = false;
      console.error('Three.js initialization error:', e);
    }
  };

  const cleanup = () => {
    if (world.value) {
      world.value.dispose();
      world.value = null;
    }
  };

  onMounted(() => {
    // Wait for next tick to ensure DOM is ready
    nextTick(() => init());
  });

  onBeforeUnmount(() => {
    cleanup();
  });

  return {
    world,
    isLoading,
    error,
    cleanup,
  };
}
`;

	writeFileSync(useThreePath, useThreeContent, 'utf-8');

	// Create useThreeAdvanced.{js|ts}
	const useThreeAdvancedPath = join(
		composablesTargetDir,
		`useThreeAdvanced.${fileExtension}`,
	);
	
	const threeTypeImports = projectType === 'nuxt'
		? `import type { Scene, Camera, WebGLRenderer } from 'three';`
		: '';
	
	const useThreeAdvancedContent = `import { ref, onMounted, onBeforeUnmount, markRaw, nextTick${typeImports} } from 'vue';
import { World } from '${importPath}';
${threeTypeImports}

/**
 * Advanced Three.js composable with more control and access to internals
 * Use this when you need direct access to scene, camera, renderer, etc.
 */
export function useThreeAdvanced(containerRef${typeAnnotations}) {
  const world = ref${worldType}(null);
  const isLoading = ref(true);
  const error = ref${errorType}(null);
  const isRunning = ref(false);

  // Getters for Three.js internals
  const scene = ref${projectType === 'nuxt' ? '<Scene | null>' : ''}(null);
  const camera = ref${projectType === 'nuxt' ? '<Camera | null>' : ''}(null);
  const renderer = ref${projectType === 'nuxt' ? '<WebGLRenderer | null>' : ''}(null);

  const init = async () => {
    if (!containerRef.value) {
      error.value = new Error('Container element not found');
      isLoading.value = false;
      return;
    }

    try {
      // Create Three.js world and mark as non-reactive to prevent proxy issues
      const worldInstance = new World(containerRef.value);
      world.value = markRaw(worldInstance);
      
      // Initialize scene
      world.value.init();
      
      // Store references and mark Three.js objects as non-reactive
      scene.value = markRaw(world.value.scene${projectType === 'nuxt' ? ' as Scene' : ''});
      camera.value = markRaw(world.value.camera);
      renderer.value = markRaw(world.value.renderer);
      
      // Start render loop
      world.value.start();
      isRunning.value = true;
      
      isLoading.value = false;
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Failed to initialize Three.js');
      isLoading.value = false;
      console.error('Three.js initialization error:', e);
    }
  };

  const start = () => {
    if (world.value && !isRunning.value) {
      world.value.start();
      isRunning.value = true;
    }
  };

  const stop = () => {
    if (world.value && isRunning.value) {
      world.value.stop();
      isRunning.value = false;
    }
  };

  const cleanup = () => {
    if (world.value) {
      world.value.dispose();
      world.value = null;
      scene.value = null;
      camera.value = null;
      renderer.value = null;
      isRunning.value = false;
    }
  };

  onMounted(() => {
    // Wait for next tick to ensure DOM is ready
    nextTick(() => init());
  });

  onBeforeUnmount(() => {
    cleanup();
  });

  return {
    world,
    scene,
    camera,
    renderer,
    isLoading,
    isRunning,
    error,
    start,
    stop,
    cleanup,
  };
}
`;

	writeFileSync(useThreeAdvancedPath, useThreeAdvancedContent, 'utf-8');

	return {
		directoryName,
		appFolder,
		threePath: targetDir,
		projectType,
		fileExtension,
	};
}
