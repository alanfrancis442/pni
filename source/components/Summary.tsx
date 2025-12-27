import React from 'react';
import {Text, Box} from 'ink';
import type {SelectedFeatures} from './FeatureSelector.js';

type Props = {
	features: SelectedFeatures;
	projectPath: string;
};

export default function Summary({features, projectPath}: Props) {
	return (
		<Box flexDirection="column" padding={1}>
			<Box borderStyle="round" borderColor="green" paddingX={2} paddingY={1} marginBottom={1}>
				<Text color="green" bold>
					✨ Setup Complete!
				</Text>
			</Box>
			
			<Box flexDirection="column" paddingLeft={1}>
				<Text color="cyan" bold>📋 Project Summary</Text>
				<Text> </Text>
				
				<Box flexDirection="column" paddingLeft={2}>
					<Text>
						<Text color="magenta">Project Type:</Text> <Text color="green" bold>{features.projectType}</Text>
					</Text>
					{features.projectName && (
						<Text>
							<Text color="magenta">Project Name:</Text> <Text color="green" bold>{features.projectName}</Text>
						</Text>
					)}
					<Text>
						<Text color="magenta">Three.js:</Text> <Text color={features.threejs ? 'green' : 'gray'} bold>{features.threejs ? 'Yes' : 'No'}</Text>
					</Text>
					<Text>
						<Text color="magenta">CSS Variables:</Text> <Text color="green" bold>Yes</Text> <Text color="gray">(auto-generated)</Text>
					</Text>
					<Text>
						<Text color="magenta">Project Path:</Text> <Text color="white">{projectPath}</Text>
					</Text>
				</Box>
				
				<Text> </Text>
				<Box borderStyle="single" borderColor="cyan" paddingX={1} paddingY={1}>
					<Text color="cyan" bold>🚀 Next Steps</Text>
					<Text> </Text>
					<Box flexDirection="column" paddingLeft={2}>
						<Text>
							<Text color="yellow">1.</Text> <Text color="white">cd </Text>
							<Text color="green" bold>{features.projectName || projectPath}</Text>
						</Text>
						<Text>
							<Text color="yellow">2.</Text> <Text color="white">Install dependencies (if not already done)</Text>
						</Text>
						<Text>
							<Text color="yellow">3.</Text> <Text color="white">Start development server</Text>
						</Text>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
