import React from 'react';
import {Text, Box} from 'ink';
import type {SelectedFeatures} from './FeatureSelector.js';

type Props = {
	features: SelectedFeatures;
	projectPath: string;
};

export default function Summary({features, projectPath}: Props) {
	return (
		<Box flexDirection="column">
			<Text color="green" bold>
				Setup Complete!
			</Text>
			<Text> </Text>
			<Text>Project Type: {features.projectType}</Text>
			{features.projectName && (
				<Text>Project Name: {features.projectName}</Text>
			)}
			<Text>Three.js: {features.threejs ? 'Yes' : 'No'}</Text>
			<Text>CSS Variables: Yes (auto-generated after shadcn-setup)</Text>
			<Text>Project Path: {projectPath}</Text>
			<Text> </Text>
			<Text color="cyan">Next steps:</Text>
			<Text> 1. cd {features.projectName || projectPath}</Text>
			<Text> 2. Install dependencies (if not already done)</Text>
			<Text> 3. Start development server</Text>
		</Box>
	);
}
