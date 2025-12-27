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
		projectType: 'nuxt' | 'vue';
		fileExtension: 'js' | 'ts';
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
			<Box flexDirection="column" padding={1}>
				<Text color="cyan" bold>🔍 Three.js Setup</Text>
				<Text> </Text>
				<ProgressIndicator
					message="Checking Three.js installation..."
					status="in-progress"
				/>
			</Box>
		);
	}

	if (step === 'copying') {
		return (
			<Box flexDirection="column" padding={1}>
				<Text color="cyan" bold>📦 Adding Three.js Template</Text>
				<Text> </Text>
				<ProgressIndicator
					message="Copying template files..."
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

	if (step === 'completed' && result) {
		return (
			<Box flexDirection="column" padding={1}>
				<Box borderStyle="round" borderColor="green" paddingX={2} paddingY={1} marginBottom={1}>
					<Text color="green" bold>
						✨ Three.js template added successfully!
					</Text>
				</Box>
				
				<Box flexDirection="column" paddingLeft={1}>
					<Text color="cyan" bold>📁 Files Created</Text>
					<Text> </Text>
					<Box flexDirection="column" paddingLeft={2}>
						<Text>
							<Text color="yellow">•</Text> <Text color="white">{result.threePath}/</Text> <Text color="gray">(template files)</Text>
						</Text>
						<Text>
							<Text color="yellow">•</Text> <Text color="white">{result.projectType === 'vue' ? 'src' : 'app'}/composables/</Text>
							<Text color="green">{result.directoryName}/usethree.{result.fileExtension}</Text>
						</Text>
						<Text>
							<Text color="yellow">•</Text> <Text color="white">{result.projectType === 'vue' ? 'src' : 'app'}/composables/</Text>
							<Text color="green">{result.directoryName}/useThreeAdvanced.{result.fileExtension}</Text>
						</Text>
					</Box>
					
					<Text> </Text>
					<Box borderStyle="single" borderColor="cyan" paddingX={1} paddingY={1}>
						<Text color="cyan" bold>🚀 Next Steps</Text>
						<Text> </Text>
						<Box flexDirection="column" paddingLeft={2}>
							<Text>
								<Text color="yellow">1.</Text> <Text color="white">Import and use the composable in your </Text>
								<Text color="green" bold>{result.projectType === 'vue' ? 'Vue' : 'Nuxt'}</Text>
								<Text color="white"> component</Text>
							</Text>
							<Text>
								<Text color="yellow">2.</Text> <Text color="gray">Example: </Text>
								<Text color="cyan">import</Text> <Text color="yellow">{'{'} useThree {'}'}</Text> <Text color="cyan">from</Text> <Text color="green">'@/composables/{result.directoryName}/usethree'</Text>
							</Text>
						</Box>
					</Box>
				</Box>
			</Box>
		);
	}

	return null;
}
