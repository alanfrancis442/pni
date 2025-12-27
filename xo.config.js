// Xo.config.js
export default [
	// Global ignores - must be in a separate config object
	{
		ignores: ['dist/**', 'source/template_code/**', 'node_modules/**'],
	},
	{
		files: ['**/*.{js,ts,tsx}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
		},
		rules: {
			// Ink / CLI rules
			'no-console': 'off',
			'no-process-exit': 'off',
			'unicorn/no-process-exit': 'off',
			'unicorn/prefer-top-level-await': 'off',

			// React / JSX
			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'off',
		},
	},
];
