import React from 'react';
import {Text, Box} from 'ink';

export default function WelcomeHeader() {
	return (
		<Box flexDirection="column" marginBottom={1}>
			<Box borderStyle="double" borderColor="cyan" paddingX={2} paddingY={1}>
				<Text color="magenta" bold>
					🚀 PNI - Project Setup CLI
				</Text>
				<Text color="gray">
					Nuxt/Vue + Three.js + CSS Variables
				</Text>
			</Box>
		</Box>
	);
}
