# pni

CLI tool for creating Nuxt/Vue projects with Three.js and CSS variables setup.

## Install

```bash
npm install -g pni
```

Or use with npx:

```bash
npx pni
```

## Usage

### Interactive Setup

Run the CLI without any flags for an interactive setup:

```bash
pni
```

### Non-Interactive Setup

Use flags to skip prompts:

```bash
pni --nuxt --threejs --css-vars
```

### Add Three.js to Existing Project

Add Three.js template code to an existing project:

```bash
pni add three
```

## Options

- `--nuxt` - Force Nuxt project type
- `--vue` - Force Vue project type
- `--threejs` - Include Three.js setup
- `--css-vars` - Include CSS variables (shadcn-style) setup
- `--dir <path>` - Target directory (default: current directory)
- `--non-interactive` - Skip prompts, use flags only

## Examples

### Create Nuxt app with Three.js and CSS variables

```bash
pni --nuxt --threejs --css-vars
```

### Create Vue app with Three.js

```bash
pni --vue --threejs
```

### Add CSS variables to existing project

```bash
pni --css-vars
```

### Add Three.js template to existing project

```bash
pni add three
```

## Features

- **Project Detection**: Automatically detects existing Nuxt/Vue projects
- **Three.js Setup**: Custom Three.js template code (no tresjs dependencies)
- **CSS Variables**: Shadcn-style CSS variables with Tailwind CSS
- **Package Manager Detection**: Automatically detects and uses npm, pnpm, or yarn
- **Interactive CLI**: Beautiful terminal UI with progress indicators

## Development

### Using React DevTools

This project uses Ink for the CLI interface, which supports React DevTools for debugging.

To use React DevTools:

1. **Start React DevTools** in a separate terminal:
   ```bash
   npx react-devtools
   ```

2. **Run your CLI with DEV mode enabled**:
   ```bash
   npm run dev:cli [options]
   ```

   Or manually:
   ```bash
   npm run build
   DEV=true node dist/cli.js [options]
   ```

The React DevTools window will show your CLI component tree, allowing you to inspect props, state, and component hierarchy in real-time.

## Requirements

- Node.js >= 16
- npm, pnpm, or yarn

## License

MIT
