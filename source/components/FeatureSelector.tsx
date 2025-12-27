import React, {useState, useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import type {ProjectType} from '../utils/project-detection.js';

export interface SelectedFeatures {
	projectType: ProjectType;
	threejs: boolean;
	cssVars: boolean;
	projectName?: string;
}

type Props = {
	detectedType: ProjectType;
	onSelect: (features: SelectedFeatures) => void;
	nonInteractive?: boolean;
	flags?: {
		nuxt?: boolean;
		vue?: boolean;
		threejs?: boolean;
		cssVars?: boolean;
	};
};

export default function FeatureSelector({
	detectedType,
	onSelect,
	nonInteractive = false,
	flags = {},
}: Props) {
	const [step, setStep] = useState(0);
	const [projectType, setProjectType] = useState<ProjectType>(
		flags.nuxt
			? 'nuxt'
			: flags.vue
			? 'vue'
			: detectedType !== 'none'
			? detectedType
			: 'nuxt',
	);
	const [threejs, setThreejs] = useState(flags.threejs ?? false);
	const [projectName, setProjectName] = useState('');
	const cssVars = true; // Always enabled - CSS will be overwritten after shadcn-setup

	useEffect(() => {
		if (nonInteractive) {
			// Auto-select based on flags or detected type
			onSelect({
				projectType,
				threejs,
				cssVars,
			});
		}
	}, [nonInteractive, projectType, threejs, cssVars, onSelect]);

	useInput((input, key) => {
		if (nonInteractive) {
			return;
		}

		if (key.return) {
			if (step === 0 && detectedType === 'none') {
				// Project type selected
				setStep(1);
			} else if (step === 1 && detectedType === 'none') {
				// Project name entered
				setStep(2);
			} else if (step === (detectedType === 'none' ? 2 : 0)) {
				// Three.js question answered - CSS vars are always enabled
				onSelect({
					projectType,
					threejs,
					cssVars: true, // Always enable CSS vars
					projectName: detectedType === 'none' ? projectName : undefined,
				});
			}
		}

		if (key.upArrow || key.downArrow) {
			if (step === 0 && detectedType === 'none') {
				setProjectType(prev => (prev === 'nuxt' ? 'vue' : 'nuxt'));
			} else if (step === (detectedType === 'none' ? 2 : 0)) {
				// Three.js question
				setThreejs(prev => !prev);
			}
		}

		if (input === 'y' || input === 'Y') {
			if (step === (detectedType === 'none' ? 2 : 0)) {
				setThreejs(true);
			}
		}

		if (input === 'n' || input === 'N') {
			if (step === (detectedType === 'none' ? 2 : 0)) {
				setThreejs(false);
			}
		}

		// Handle project name input
		if (
			step === 1 &&
			detectedType === 'none' &&
			!key.return &&
			!key.upArrow &&
			!key.downArrow
		) {
			if (key.backspace || key.delete) {
				setProjectName(prev => prev.slice(0, -1));
			} else if (input.length === 1) {
				setProjectName(prev => prev + input);
			}
		}
	});

	if (nonInteractive) {
		return (
			<Box flexDirection="column" padding={1}>
				<Text color="cyan" bold>⚡ Quick Setup (Non-Interactive)</Text>
				<Text> </Text>
				<Box flexDirection="column" paddingLeft={2}>
					<Text>
						<Text color="magenta">Project Type:</Text> <Text color="green" bold>{projectType}</Text>
					</Text>
					<Text>
						<Text color="magenta">Three.js:</Text> <Text color={threejs ? 'green' : 'gray'} bold>{threejs ? 'Yes' : 'No'}</Text>
					</Text>
					<Text>
						<Text color="magenta">CSS Vars:</Text> <Text color="green" bold>Yes (auto)</Text>
					</Text>
				</Box>
			</Box>
		);
	}

	if (detectedType === 'none') {
		if (step === 0) {
			return (
				<Box flexDirection="column" padding={1}>
					<Text color="yellow" bold>📦 No project detected</Text>
					<Text color="gray">Select project type:</Text>
					<Text> </Text>
					<Box flexDirection="column" paddingLeft={2}>
						<Text>
							<Text color={projectType === 'nuxt' ? 'cyan' : 'gray'}>
								{projectType === 'nuxt' ? '→' : ' '} 
							</Text>
							<Text color={projectType === 'nuxt' ? 'cyan' : 'white'} bold>
								[<Text color={projectType === 'nuxt' ? 'green' : 'gray'}>{projectType === 'nuxt' ? '●' : '○'}</Text>] Nuxt
							</Text>
						</Text>
						<Text>
							<Text color={projectType === 'vue' ? 'cyan' : 'gray'}>
								{projectType === 'vue' ? '→' : ' '} 
							</Text>
							<Text color={projectType === 'vue' ? 'cyan' : 'white'} bold>
								[<Text color={projectType === 'vue' ? 'green' : 'gray'}>{projectType === 'vue' ? '●' : '○'}</Text>] Vue
							</Text>
						</Text>
					</Box>
					<Text> </Text>
					<Text color="gray">Press <Text color="cyan">↑/↓</Text> to select, <Text color="cyan">Enter</Text> to continue</Text>
				</Box>
			);
		}

		if (step === 1) {
			return (
				<Box flexDirection="column" padding={1}>
					<Text color="cyan" bold>📝 Project Setup</Text>
					<Text> </Text>
					<Text>
						<Text color="magenta">Enter project name:</Text> <Text color="green" bold>{projectName}</Text>
						<Text color="cyan" bold>_</Text>
					</Text>
					<Text> </Text>
					<Text color="gray">Type the project name and press <Text color="cyan">Enter</Text> when done</Text>
				</Box>
			);
		}
	}

	if (step === (detectedType === 'none' ? 2 : 0)) {
		return (
			<Box flexDirection="column" padding={1}>
				<Text color="cyan" bold>🎨 Additional Features</Text>
				<Text> </Text>
				<Text color="yellow" bold>Include Three.js setup?</Text>
				<Text> </Text>
				<Box flexDirection="column" paddingLeft={2}>
					<Text>
						<Text color={threejs ? 'cyan' : 'gray'}>
							{threejs ? '→' : ' '} 
						</Text>
						<Text color={threejs ? 'cyan' : 'white'} bold>
							[<Text color={threejs ? 'green' : 'gray'}>{threejs ? '✓' : ' '}</Text>] <Text color={threejs ? 'green' : 'white'}>Yes</Text>
						</Text>
					</Text>
					<Text>
						<Text color={!threejs ? 'cyan' : 'gray'}>
							{!threejs ? '→' : ' '} 
						</Text>
						<Text color={!threejs ? 'cyan' : 'white'} bold>
							[<Text color={!threejs ? 'red' : 'gray'}>{!threejs ? '✗' : ' '}</Text>] <Text color={!threejs ? 'red' : 'white'}>No</Text>
						</Text>
					</Text>
				</Box>
				<Text> </Text>
				<Text color="gray">
					Use <Text color="cyan">↑/↓</Text> to toggle, <Text color="cyan">y/n</Text> to select, or <Text color="cyan">Enter</Text> to continue
				</Text>
			</Box>
		);
	}

	return (
		<Box>
			<Text color="cyan">Processing...</Text>
		</Box>
	);
}
