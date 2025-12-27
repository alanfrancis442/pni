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

			// Style preferences - don't affect code quality
			'@stylistic/quotes': 'off',
			'@stylistic/jsx-quotes': 'off',
			'@stylistic/indent': 'off',
			'@stylistic/indent-binary-ops': 'off',
			'@stylistic/spaced-comment': 'off',
			'@stylistic/padding-line-between-statements': 'off',
			'@stylistic/function-paren-newline': 'off',
			'@stylistic/object-curly-newline': 'off',
			'@stylistic/object-curly-spacing': 'off',
			'@stylistic/comma-dangle': 'off',
			'@stylistic/operator-linebreak': 'off',
			'@stylistic/no-mixed-operators': 'off',
			'@stylistic/quote-props': 'off',

			// Unicorn style preferences
			'unicorn/prefer-node-protocol': 'off',
			'unicorn/text-encoding-identifier-case': 'off',
			'unicorn/filename-case': 'off',
			'unicorn/better-regex': 'off',
			'unicorn/prefer-string-replace-all': 'off',
			'unicorn/catch-error-name': 'off',
			'unicorn/prevent-abbreviations': 'off',
			'unicorn/no-nested-ternary': 'off',
			'unicorn/no-lonely-if': 'off',
			'unicorn/no-negated-condition': 'off',
			'unicorn/prefer-ternary': 'off',
			'unicorn/prefer-global-this': 'off',
			'unicorn/switch-case-braces': 'off',
			'unicorn/no-useless-switch-case': 'off',
			'unicorn/import-style': 'off',

			// TypeScript strict preferences
			'@typescript-eslint/naming-convention': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-restricted-types': 'off',
			'@typescript-eslint/no-unnecessary-type-assertion': 'off',
			'@typescript-eslint/no-floating-promises': 'off',
			'@typescript-eslint/prefer-regexp-exec': 'off',
			'@typescript-eslint/prefer-optional-chain': 'off',
			'@typescript-eslint/prefer-nullish-coalescing': 'off',
			'@typescript-eslint/switch-exhaustiveness-check': 'off',
			'@typescript-eslint/consistent-type-definitions': 'off',
			'@typescript-eslint/no-inferrable-types': 'off',
			'@typescript-eslint/restrict-template-expressions': 'off',

			// Import preferences
			'import-x/order': 'off',
			'import-x/extensions': 'off',
			'n/file-extension-in-import': 'off',

			// Node.js preferences
			'n/prefer-global/process': 'off',

			// Other style rules
			'capitalized-comments': 'off',
			complexity: ['warn', {max: 40}], // Allow higher complexity
			curly: 'off',
			'arrow-body-style': 'off',
			'one-var': 'off',
			'no-multi-assign': 'off',
			'no-undef': 'off',
			'no-negated-condition': 'off',
		},
	},
];
