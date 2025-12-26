import React, {useState, useEffect} from 'react';
import {Box, Text} from 'ink';
import {addThree} from './utils/add-three.js';
import ProgressIndicator from './components/ProgressIndicator.js';
import {resolve} from 'path';

type Props = {
	dir?: string;
};

export default function AddThreeApp({dir}: Props) {
	const [step, setStep] = useState<
		'checking' | 'copying' | 'completed' | 'error'
	>('checking');
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<{
		directoryName: string;
		appFolder: string;
		threePath: string;
	} | null>(null);

	useEffect(() => {
		async function initialize() {
			try {
				const cwd = dir ? resolve(dir) : process.cwd();

				setStep('copying');
				const result = await addThree(cwd);
				setResult(result);
				setStep('completed');
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Unknown error');
				setStep('error');
			}
		}

		initialize();
	}, [dir]);

	if (step === 'checking') {
		return (
			<Box>
				<ProgressIndicator
					message="Checking Three.js installation..."
					status="in-progress"
				/>
			</Box>
		);
	}

	if (step === 'copying') {
		return (
			<Box flexDirection="column">
				<ProgressIndicator
					message="Adding Three.js template..."
					status="in-progress"
				/>
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

	if (step === 'completed' && result) {
		return (
			<Box flexDirection="column">
				<Text color="green" bold>
					Three.js template added successfully!
				</Text>
				<Text> </Text>
				<Text>Files created:</Text>
				<Text> • {result.threePath}/ (template files)</Text>
				<Text> • composables/{result.directoryName}/usethree.ts</Text>
				<Text> • composables/{result.directoryName}/useThreeAdvanced.ts</Text>
				<Text> </Text>
				<Text color="cyan">Next steps:</Text>
				<Text>
					{' '}
					1. Import and use the composable in your Vue/Nuxt component
				</Text>
				<Text>
					{' '}
					2. Example: import {'{'} useThree {'}'} from '@/composables/
					{result.directoryName}/usethree'
				</Text>
			</Box>
		);
	}

	return null;
}
