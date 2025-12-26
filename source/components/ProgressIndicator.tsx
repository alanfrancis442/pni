import React from 'react';
import {Text, Box} from 'ink';

type Props = {
	message: string;
	status?: 'pending' | 'in-progress' | 'completed' | 'error';
};

export default function ProgressIndicator({
	message,
	status = 'in-progress',
}: Props) {
	const getStatusIcon = () => {
		switch (status) {
			case 'completed':
				return <Text color="green">✓</Text>;
			case 'error':
				return <Text color="red">✗</Text>;
			case 'in-progress':
				return <Text color="yellow">⟳</Text>;
			case 'pending':
			default:
				return <Text color="gray">○</Text>;
		}
	};

	return (
		<Box>
			<Box marginRight={1}>{getStatusIcon()}</Box>
			<Text>{message}</Text>
		</Box>
	);
}
