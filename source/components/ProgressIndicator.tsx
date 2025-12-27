import React, {useState, useEffect} from 'react';
import {Text, Box} from 'ink';

type Props = {
	message: string;
	status?: 'pending' | 'in-progress' | 'completed' | 'error';
};

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export default function ProgressIndicator({
	message,
	status = 'in-progress',
}: Props) {
	const [frame, setFrame] = useState(0);

	useEffect(() => {
		if (status !== 'in-progress') {
			return;
		}

		const timer = setInterval(() => {
			setFrame(prev => (prev + 1) % SPINNER_FRAMES.length);
		}, 100);

		return () => {
			clearInterval(timer);
		};
	}, [status]);

	const getStatusIcon = () => {
		switch (status) {
			case 'completed':
				return <Text color="green" bold>✓</Text>;
			case 'error':
				return <Text color="red" bold>✗</Text>;
			case 'in-progress':
				return <Text color="cyan" bold>{SPINNER_FRAMES[frame]}</Text>;
			case 'pending':
			default:
				return <Text color="gray">○</Text>;
		}
	};

	const getMessageColor = () => {
		switch (status) {
			case 'completed':
				return 'green';
			case 'error':
				return 'red';
			case 'in-progress':
				return 'cyan';
			case 'pending':
			default:
				return 'gray';
		}
	};

	return (
		<Box>
			<Box marginRight={1}>{getStatusIcon()}</Box>
			<Text color={getMessageColor()}>{message}</Text>
		</Box>
	);
}
