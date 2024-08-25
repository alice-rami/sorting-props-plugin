import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import sort from './eslint/sort/eslint-plugin-sort.js';
// import react from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{ ignores: ['dist'] },
	{
		extends: [js.configs.recommended, ...tseslint.configs.recommended],
		files: ['**/*.{ts,tsx,js,jsx}'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
		plugins: {
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
			// react: react,
			sort: sort,
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': [
				'warn',
				{ allowConstantExport: true },
			],

			// 'react/jsx-sort-props': [
			// 	'warn',
			// 	{
			// 		callbacksLast: true,
			// 		shorthandFirst: true,
			// 		shorthandLast: false,
			// 		multiline: 'last',
			// 		ignoreCase: false,
			// 		noSortAlphabetically: false,
			// 		reservedFirst: ['key', 'ref', 'children'],
			// 		locale: 'auto',
			// 	},
			// ],
			// 'example/enforce-foo-bar': 'error',
			'sort/sort-props': [
				'warn',
				{
					order: ['shortHand', 'key', 'size', 'on', 'handle', 'aria-', 'data-'],
				},
			],
		},
	}
);
