import React, {useState, useEffect} from 'react';
import {Box, Text} from 'ink';
import {detectProjectType} from './utils/project-detection.js';
import {createApp} from './utils/app-creation.js';
import {detectPackageManager, getInstallCommand, getDevInstallCommand} from './utils/package-manager.js';
import {getDependencies} from './utils/dependencies.js';
import {generateConfigFiles} from './utils/config-generator.js';
import {generateCSSVariables} from './utils/css-variables.js';
import FeatureSelector, {type SelectedFeatures} from './components/FeatureSelector.js';
import ProgressIndicator from './components/ProgressIndicator.js';
import Summary from './components/Summary.js';
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
	const [projectType, setProjectType] = useState<'nuxt' | 'vue' | 'none'>('none');
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

			// Create app if needed
			if (projectType === 'none' && selectedFeatures.projectName) {
				setStep('creating');
				const parentDir = dir ? resolve(dir) : process.cwd();
				await createApp(finalProjectType as 'nuxt' | 'vue', parentDir, selectedFeatures.projectName);
				workingPath = join(parentDir, selectedFeatures.projectName);
				setProjectPath(workingPath);
			}

			// Install dependencies
			setStep('installing');
			const pm = await detectPackageManager(workingPath);
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

			// Generate configuration files
			setStep('configuring');
			await generateConfigFiles(
				finalProjectType as 'nuxt' | 'vue',
				workingPath,
				selectedFeatures.threejs,
				selectedFeatures.cssVars,
			);

			// Generate CSS variables if needed
			if (selectedFeatures.cssVars) {
				await generateCSSVariables(finalProjectType as 'nuxt' | 'vue', workingPath);
			}

			setStep('completed');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unknown error');
			setStep('error');
		}
	};

	if (step === 'detecting') {
		return (
			<Box>
				<ProgressIndicator message="Detecting project type..." status="in-progress" />
			</Box>
		);
	}

	if (step === 'selecting') {
		return (
			<Box flexDirection="column">
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
			<Box flexDirection="column">
				<ProgressIndicator message="Creating project..." status="in-progress" />
			</Box>
		);
	}

	if (step === 'installing') {
		return (
			<Box flexDirection="column">
				<ProgressIndicator message="Installing dependencies..." status="in-progress" />
			</Box>
		);
	}

	if (step === 'configuring') {
		return (
			<Box flexDirection="column">
				<ProgressIndicator message="Generating configuration files..." status="in-progress" />
			</Box>
		);
	}

	if (step === 'error') {
		return (
			<Box flexDirection="column">
				<Text color="red" bold>
					Error:
				</Text>
				<Text color="red">{error}</Text>
			</Box>
		);
	}

	if (step === 'completed' && features) {
		return <Summary features={features} projectPath={projectPath} />;
	}

	return null;
}
