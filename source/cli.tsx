#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './app.js';

const cli = meow(
	`
	Usage
	  $ pni [options]

	Options
	  --nuxt              Force Nuxt project type
	  --vue               Force Vue project type
	  --threejs           Include Three.js setup
	  --css-vars          Include CSS variables (shadcn-style) setup
	  --dir <path>        Target directory (default: current directory)
	  --non-interactive    Skip prompts, use flags only

	Examples
	  $ pni
	  Interactive setup

	  $ pni --nuxt --threejs --css-vars
	  Create Nuxt app with Three.js and CSS variables

	  $ pni --vue --threejs
	  Create Vue app with Three.js

	  $ pni --css-vars
	  Add CSS variables to existing project
`,
	{
		importMeta: import.meta,
		flags: {
			nuxt: {
				type: 'boolean',
				default: false,
			},
			vue: {
				type: 'boolean',
				default: false,
			},
			threejs: {
				type: 'boolean',
				default: false,
			},
			cssVars: {
				type: 'boolean',
				default: false,
			},
			dir: {
				type: 'string',
			},
			nonInteractive: {
				type: 'boolean',
				default: false,
			},
		},
	},
);

render(
	<App
		nuxt={cli.flags.nuxt}
		vue={cli.flags.vue}
		threejs={cli.flags.threejs}
		cssVars={cli.flags.cssVars}
		dir={cli.flags.dir}
		nonInteractive={cli.flags.nonInteractive}
	/>,
);
