import React, {useState, useEffect} from 'react';
import {Text, useInput} from 'ink';
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
		flags.nuxt ? 'nuxt' : flags.vue ? 'vue' : detectedType !== 'none' ? detectedType : 'nuxt',
	);
	const [threejs, setThreejs] = useState(flags.threejs ?? false);
	const [cssVars, setCssVars] = useState(flags.cssVars ?? false);
	const [projectName, setProjectName] = useState('');

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
			} else if (step === 0 && detectedType !== 'none') {
				// Skip to threejs question
				setStep(1);
			} else if (step === 1) {
				// Three.js question answered
				setStep(2);
			} else if (step === 2) {
				// CSS vars question answered
				onSelect({
					projectType,
					threejs,
					cssVars,
					projectName: detectedType === 'none' ? projectName : undefined,
				});
			}
		}

		if (key.upArrow || key.downArrow) {
			if (step === 0 && detectedType === 'none') {
				setProjectType(prev => (prev === 'nuxt' ? 'vue' : 'nuxt'));
			} else if (step === 1) {
				setThreejs(prev => !prev);
			} else if (step === 2) {
				setCssVars(prev => !prev);
			}
		}

		if (input === 'y' || input === 'Y') {
			if (step === 1) {
				setThreejs(true);
			} else if (step === 2) {
				setCssVars(true);
			}
		}

		if (input === 'n' || input === 'N') {
			if (step === 1) {
				setThreejs(false);
			} else if (step === 2) {
				setCssVars(false);
			}
		}

		// Handle project name input
		if (step === 1 && detectedType === 'none' && !key.return && !key.upArrow && !key.downArrow) {
			if (key.backspace || key.delete) {
				setProjectName(prev => prev.slice(0, -1));
			} else if (input.length === 1) {
				setProjectName(prev => prev + input);
			}
		}
	});

	if (nonInteractive) {
		return (
			<Text>
				Using flags: {projectType} | Three.js: {threejs ? 'Yes' : 'No'} | CSS Vars:{' '}
				{cssVars ? 'Yes' : 'No'}
			</Text>
		);
	}

	if (detectedType === 'none') {
		if (step === 0) {
			return (
				<>
					<Text>No project detected. Select project type:</Text>
					<Text>
						{' '}
						{projectType === 'nuxt' ? '→' : ' '} Nuxt
					</Text>
					<Text>
						{' '}
						{projectType === 'vue' ? '→' : ' '} Vue
					</Text>
					<Text>Press Enter to continue</Text>
				</>
			);
		}

		if (step === 1) {
			return (
				<>
					<Text>Enter project name: </Text>
					<Text color="green">{projectName}</Text>
					<Text>_</Text>
				</>
			);
		}
	}

	if (step === (detectedType === 'none' ? 2 : 0)) {
		return (
			<>
				<Text>Include Three.js setup? (y/n)</Text>
				<Text>
					{' '}
					{threejs ? '→' : ' '} {threejs ? 'Yes' : 'No'}
				</Text>
				<Text>Press Enter to continue</Text>
			</>
		);
	}

	if (step === (detectedType === 'none' ? 3 : 1)) {
		return (
			<>
				<Text>Include CSS variables (shadcn-style)? (y/n)</Text>
				<Text>
					{' '}
					{cssVars ? '→' : ' '} {cssVars ? 'Yes' : 'No'}
				</Text>
				<Text>Press Enter to continue</Text>
			</>
		);
	}

	return <Text>Processing...</Text>;
}

