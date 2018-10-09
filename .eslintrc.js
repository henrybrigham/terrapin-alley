module.exports = {
	root: true,
	parser: 'babel-eslint',
	parserOptions: {
		sourceType: 'module',
		ecmaFeatures: {
			'jsx': true
		},
		allowImportExportEverywhere: true
	},
	env: {
		browser: true,
		jest: true
	},
	extends: [
		'airbnb',
		'plugin:react/recommended'
	],
	plugins: [
		'jsx-a11y',
		'react'
	],
	// Check if imports resolve
	'settings': {
		'import/resolver': {
			'webpack': {
				'config': 'build/webpack.base.conf.js'
			}
		}
	},
	'rules': {
		// Allow debugger during development
		'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,

		// Custom rules
		'no-tabs': 0,
		'comma-dangle': ['error', 'never'],
		'space-before-fu`n`ction-paren': ['error', 'never'],
		'function-paren-newline': ['error', 'consistent'],
		"no-mixed-spaces-and-tabs": [2, "smart-tabs"],
		'no-param-reassign': 0,
		'linebreak-style': 0,
		'no-return-assign': ['error', 'except-parens'],
		'no-plusplus': ["error", { "allowForLoopAfterthoughts": true }],
		"space-before-function-paren": ["error", "never"],
		
		// React
		'react/jsx-first-prop-new-line': ['error', 'never'],
		'react/jsx-curly-spacing': ['error', { 'when': 'always' }],
		'react/jsx-boolean-value': ['error', 'always'],
		'react/jsx-closing-bracket-location': ['error', 'after-props'],
		'react/forbid-prop-types': 0,
		'react/no-array-index-key': 0,
		'react/jsx-wrap-multilines': 0,

		// WAI-ARIA Compliance
		'jsx-a11y/click-events-have-key-events': 0,
		'jsx-a11y/no-static-element-interactions': 0,
		'jsx-a11y/anchor-is-valid': 0,
		'jsx-a11y/label-has-for': 0,
		'jsx-a11y/no-noninteractive-element-interactions': 0
	},
	overrides: [
		{
			rules: {
				'jsx-a11y/click-events-have-key-events': 2,
				'jsx-a11y/no-static-element-interactions': 2,
				'jsx-a11y/anchor-is-valid': ["error", {
					"components": ["Link"],
					"specialLink": ["to"],
					"aspects": ["noHref"]
				}],
				'jsx-a11y/label-has-for': 2,
				'jsx-a11y/no-noninteractive-element-interactions': 2
			},
			files: [
				'src/components/common/**/*.js',
				'src/components/common/**/*.jsx'
			]
		}
	]
}
