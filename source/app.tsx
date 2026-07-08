import React, {useState, useEffect} from 'react';
import {Box, Text} from 'ink';
import {detectProjectType} from './utils/project-detection.js';
import {createApp} from './utils/app-creation.js';
import {
	detectPackageManager,
	getInstallCommand,
	getDevInstallCommand,
	getProjectInstallCommand,
} from './utils/package-manager.js';
import {ensurePnpmAllowBuilds} from './utils/pnpm-allow-builds.js';
import {getDependencies} from './utils/dependencies.js';
import {generateConfigFiles, setupNuxtAppStructure, setupVueAppStructure} from './utils/config-generator.js';
import {generateCSSVariables, updateIndexHtml, createTypographyPage} from './utils/css-variables.js';
import {
	addShadcnNuxtModule,
	setupSsrWidthPlugin,
	runNuxtPrepare,
	initShadcnVue,
} from './utils/shadcn-setup.js';
import FeatureSelector, {
	type SelectedFeatures,
} from './components/FeatureSelector.js';
import ProgressIndicator from './components/ProgressIndicator.js';
import Summary from './components/Summary.js';
import WelcomeHeader from './components/WelcomeHeader.js';
import {execSync} from 'child_process';
import {join, resolve} from 'path';

type Props = {
	nuxt?: boolean;
	vue?: boolean;
	threejs?: boolean;
	cssVars?: boolean;
	dir?: string;
	nonInteractive?: boolean;
};

type Step =
	| 'detecting'
	| 'selecting'
	| 'creating'
	| 'installing'
	| 'configuring'
	| 'completed'
	| 'error';

export default function App({
	nuxt = false,
	vue = false,
	threejs = false,
	cssVars = false,
	dir,
	nonInteractive = false,
}: Props) {
	const [step, setStep] = useState<Step>('detecting');
	const [projectType, setProjectType] = useState<'nuxt' | 'vue' | 'none'>(
		'none',
	);
	const [features, setFeatures] = useState<SelectedFeatures | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [projectPath, setProjectPath] = useState<string>('');

	useEffect(() => {
		async function initialize() {
			try {
				const cwd = dir ? resolve(dir) : process.cwd();
				setProjectPath(cwd);

				const detected = await detectProjectType(cwd);
				setProjectType(detected);
				setStep('selecting');
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Unknown error');
				setStep('error');
			}
		}

		initialize();
	}, [dir]);

	const handleFeatureSelect = async (selectedFeatures: SelectedFeatures) => {
		setFeatures(selectedFeatures);
		const finalProjectType = nuxt
			? 'nuxt'
			: vue
			? 'vue'
			: selectedFeatures.projectType === 'none'
			? 'nuxt' // Default to nuxt if none selected
			: selectedFeatures.projectType;

		// finalProjectType is guaranteed to be 'nuxt' or 'vue' at this point

		try {
			const cwd = dir ? resolve(dir) : process.cwd();
			let workingPath = cwd;

			const parentDir = dir ? resolve(dir) : process.cwd();
			const pm = await detectPackageManager(parentDir);
			const createdNewProject =
				projectType === 'none' && Boolean(selectedFeatures.projectName);

			// Create app if needed
			if (createdNewProject && selectedFeatures.projectName) {
				setStep('creating');
				await createApp(
					finalProjectType as 'nuxt' | 'vue',
					parentDir,
					selectedFeatures.projectName,
					pm,
				);
				workingPath = join(parentDir, selectedFeatures.projectName);
				setProjectPath(workingPath);
			}

			// Install dependencies
			setStep('installing');
			if (pm === 'pnpm') {
				ensurePnpmAllowBuilds(workingPath);
			}

			if (createdNewProject) {
				execSync(getProjectInstallCommand(pm), {
					cwd: workingPath,
					stdio: 'inherit',
				});
			}

			const deps = getDependencies(
				finalProjectType as 'nuxt' | 'vue',
				selectedFeatures.threejs,
				selectedFeatures.cssVars,
			);

			if (deps.production.length > 0) {
				const installCmd = getInstallCommand(pm, deps.production);
				execSync(installCmd, {cwd: workingPath, stdio: 'inherit'});
			}

			if (deps.dev.length > 0) {
				const devInstallCmd = getDevInstallCommand(pm, deps.dev);
				execSync(devInstallCmd, {cwd: workingPath, stdio: 'inherit'});
			}

			// Generate configuration files and set up project structure
			setStep('configuring');

			if (finalProjectType === 'nuxt') {
				// Follow shadcn-vue Nuxt setup order:
				// tailwind.css → shadcn-nuxt module → nuxt.config → app structure →
				// ssr plugin → nuxi prepare → shadcn-vue init → full CSS
				await generateCSSVariables(
					finalProjectType as 'nuxt' | 'vue',
					workingPath,
					true,
				);

				await addShadcnNuxtModule(workingPath, pm);

				await generateConfigFiles(
					finalProjectType as 'nuxt' | 'vue',
					workingPath,
					selectedFeatures.threejs,
					selectedFeatures.cssVars,
				);

				await setupNuxtAppStructure(workingPath);
				await setupSsrWidthPlugin(workingPath);
				await runNuxtPrepare(workingPath, pm);
				await initShadcnVue(workingPath, pm);

				await generateCSSVariables(
					finalProjectType as 'nuxt' | 'vue',
					workingPath,
					false,
				);

				if (selectedFeatures.cssVars) {
					await createTypographyPage(workingPath, finalProjectType);
				}
			} else {
				await generateConfigFiles(
					finalProjectType as 'nuxt' | 'vue',
					workingPath,
					selectedFeatures.threejs,
					selectedFeatures.cssVars,
				);

				await setupVueAppStructure(workingPath);

				await generateCSSVariables(
					finalProjectType as 'nuxt' | 'vue',
					workingPath,
				);

				if (selectedFeatures.cssVars) {
					await updateIndexHtml(workingPath);
				}
			}

			setStep('completed');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unknown error');
			setStep('error');
		}
	};

	if (step === 'detecting') {
		return (
			<Box flexDirection="column" padding={1}>
				<WelcomeHeader />
				<Text color="cyan" bold>🔍 Analyzing project...</Text>
				<Text> </Text>
				<ProgressIndicator
					message="Detecting project type..."
					status="in-progress"
				/>
			</Box>
		);
	}

	if (step === 'selecting') {
		return (
			<Box flexDirection="column" padding={1}>
				<WelcomeHeader />
				<FeatureSelector
					detectedType={projectType}
					onSelect={handleFeatureSelect}
					nonInteractive={nonInteractive}
					flags={{nuxt, vue, threejs, cssVars}}
				/>
			</Box>
		);
	}

	if (step === 'creating') {
		return (
			<Box flexDirection="column" padding={1}>
				<Text color="cyan" bold>📦 Creating project...</Text>
				<Text> </Text>
				<ProgressIndicator message="Setting up project structure..." status="in-progress" />
			</Box>
		);
	}

	if (step === 'installing') {
		return (
			<Box flexDirection="column" padding={1}>
				<Text color="yellow" bold>📥 Installing dependencies...</Text>
				<Text> </Text>
				<ProgressIndicator
					message="This may take a few moments..."
					status="in-progress"
				/>
			</Box>
		);
	}

	if (step === 'configuring') {
		return (
			<Box flexDirection="column" padding={1}>
				<Text color="magenta" bold>⚙️  Configuring project...</Text>
				<Text> </Text>
				<ProgressIndicator
					message="Generating configuration files..."
					status="in-progress"
				/>
			</Box>
		);
	}

	if (step === 'error') {
		return (
			<Box flexDirection="column" padding={1}>
				<Box borderStyle="round" borderColor="red" paddingX={2} paddingY={1} marginBottom={1}>
					<Text color="red" bold>
						✗ Error
					</Text>
				</Box>
				<Box paddingLeft={2}>
					<Text color="red">{error}</Text>
				</Box>
			</Box>
		);
	}

	if (step === 'completed' && features) {
		return <Summary features={features} projectPath={projectPath} />;
	}

	return null;
}
