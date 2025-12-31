# Vue App Creation Flow

This document outlines the complete code flow for creating a Vue app using the `pni` CLI tool.

## Entry Point: CLI (`source/cli.tsx`)

```
User runs: pni --vue [options]
    ↓
cli.tsx parses flags and arguments
    ↓
Renders <App> component with flags
```

**Key Code:**
```typescript
// cli.tsx:68-84
const [command, subcommand] = cli.input;

if (command === 'add' && subcommand === 'three') {
    render(<AddThreeApp dir={cli.flags.dir} />);
} else {
    render(
        <App
            vue={cli.flags.vue}
            threejs={cli.flags.threejs}
            cssVars={cli.flags.cssVars}
            dir={cli.flags.dir}
            nonInteractive={cli.flags.nonInteractive}
        />,
    );
}
```

---

## Step 1: Project Detection (`source/app.tsx`)

**Initial State:** `step = 'detecting'`

```
App component mounts
    ↓
useEffect hook runs
    ↓
detectProjectType(cwd) is called
    ↓
Checks for:
  - nuxt.config.* files
  - package.json dependencies
  - vite.config.* files
  - vue.config.* files
    ↓
Sets projectType: 'nuxt' | 'vue' | 'none'
    ↓
setStep('selecting')
```

**Key Code:**
```typescript
// app.tsx:57-73
useEffect(() => {
    async function initialize() {
        try {
            const cwd = dir ? resolve(dir) : process.cwd();
            setProjectPath(cwd);
            
            const detected = await detectProjectType(cwd);
            setProjectType(detected);
            setStep('selecting');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            setStep('error');
        }
    }
    
    initialize();
}, [dir]);
```

---

## Step 2: Feature Selection (`source/app.tsx`)

**State:** `step = 'selecting'`

```
Renders <FeatureSelector> component
    ↓
User selects:
  - Project name (if projectType === 'none')
  - Three.js (optional)
  - CSS Variables (optional)
    ↓
onSelect callback → handleFeatureSelect()
```

**Key Code:**
```typescript
// app.tsx:194-205
if (step === 'selecting') {
    return (
        <Box flexDirection="column" padding={1}>
            <WelcomeHeader />
            <FeatureSelector
                detectedType={projectType}
                onSelect={handleFeatureSelect}
                nonInteractive={nonInteractive}
                flags={{nuxt, vue, threejs, cssVars}}
            />
        </Box>
    );
}
```

---

## Step 3: App Creation (`source/app.tsx` → `source/utils/app-creation.ts`)

**State:** `step = 'creating'`

```
handleFeatureSelect() is called
    ↓
Determines finalProjectType (vue in this case)
    ↓
If projectType === 'none' AND selectedFeatures.projectName exists:
    setStep('creating')
    ↓
    createApp('vue', parentDir, projectName)
        ↓
        createVueApp(dir, name)
            ↓
            Executes: npm create vue@latest {name} -- --yes
            ↓
            Creates Vue project structure
    ↓
    workingPath = join(parentDir, projectName)
```

**Key Code:**
```typescript
// app.tsx:91-102
if (projectType === 'none' && selectedFeatures.projectName) {
    setStep('creating');
    const parentDir = dir ? resolve(dir) : process.cwd();
    await createApp(
        finalProjectType as 'nuxt' | 'vue',
        parentDir,
        selectedFeatures.projectName,
    );
    workingPath = join(parentDir, selectedFeatures.projectName);
    setProjectPath(workingPath);
}
```

```typescript
// app-creation.ts:15-25
export async function createVueApp(dir: string, name: string): Promise<void> {
    try {
        // Use npm create vue@latest for Vue 3
        execSync(`npm create vue@latest ${name} -- --yes`, {
            cwd: dir,
            stdio: 'inherit',
        });
    } catch (error) {
        throw new Error(`Failed to create Vue app: ${error}`);
    }
}
```

---

## Step 4: Dependency Installation (`source/app.tsx`)

**State:** `step = 'installing'`

```
setStep('installing')
    ↓
detectPackageManager(workingPath)
    ↓
getDependencies('vue', threejs, cssVars)
    ↓
Returns DependencySet:
  - production: ['gsap', 'lenis', ...threejs deps if enabled]
  - dev: [...cssVars deps if enabled]
    ↓
Install production dependencies:
  execSync(getInstallCommand(pm, deps.production))
    ↓
Install dev dependencies:
  execSync(getDevInstallCommand(pm, deps.dev))
```

**Key Code:**
```typescript
// app.tsx:104-121
setStep('installing');
const pm = await detectPackageManager(workingPath);
const deps = getDependencies(
    finalProjectType as 'nuxt' | 'vue',
    selectedFeatures.threejs,
    selectedFeatures.cssVars,
);

if (deps.production.length > 0) {
    const installCmd = getInstallCommand(pm, deps.production);
    execSync(installCmd, {cwd: workingPath, stdio: 'inherit'});
}

if (deps.dev.length > 0) {
    const devInstallCmd = getDevInstallCommand(pm, deps.dev);
    execSync(devInstallCmd, {cwd: workingPath, stdio: 'inherit'});
}
```

**Dependencies Logic:**
```typescript
// dependencies.ts:42-85
export function getDependencies(
    projectType: 'nuxt' | 'vue',
    threejs: boolean,
    cssVars: boolean,
): DependencySet {
    const deps: DependencySet = {
        production: ['gsap', 'lenis'],  // Always included
        dev: [],
    };
    
    // Add Three.js deps if enabled
    if (threejs) {
        if (projectType === 'vue') {
            deps.production.push(...THREEJS_VUE_DEPS.production);
            // ['three', '@vueuse/core']
        }
    }
    
    // Add CSS vars deps if enabled
    if (cssVars) {
        if (projectType === 'vue') {
            deps.dev.push(...CSS_VARS_DEPS.dev);
            // ['tailwindcss', '@tailwindcss/vite']
        }
    }
    
    // Remove duplicates
    deps.production = [...new Set(deps.production)];
    deps.dev = [...new Set(deps.dev)];
    
    return deps;
}
```

---

## Step 5: Configuration Generation (`source/app.tsx` → `source/utils/config-generator.ts`)

**State:** `step = 'configuring'`

```
setStep('configuring')
    ↓
generateConfigFiles('vue', workingPath, threejs, cssVars)
    ↓
generateViteConfig(projectPath, threejs, cssVars)
    ↓
If vite.config.ts exists:
    - Merge tailwindcss plugin if cssVars enabled
Else:
    - Load template: vite/vite.config.ts.template
    - Replace placeholders:
      * {{TAILWIND_IMPORT}}
      * {{TAILWIND_PLUGIN}}
      * {{THREEJS_CHUNK}}
    - Write vite.config.ts
```

**Key Code:**
```typescript
// app.tsx:123-130
setStep('configuring');
await generateConfigFiles(
    finalProjectType as 'nuxt' | 'vue',
    workingPath,
    selectedFeatures.threejs,
    selectedFeatures.cssVars,
);
```

```typescript
// config-generator.ts:150-180 (simplified for Vue)
export async function generateViteConfig(
    projectPath: string,
    threejs: boolean,
    cssVars: boolean = false,
): Promise<void> {
    const configPath = join(projectPath, 'vite.config.ts');
    
    if (existsSync(configPath)) {
        // Merge existing config
        // Add tailwindcss if cssVars enabled
    } else {
        // Load template and replace placeholders
        const configContent = loadTemplateWithReplacements(
            'vite/vite.config.ts.template',
            {
                TAILWIND_IMPORT: cssVars ? "import tailwindcss from '@tailwindcss/vite'\n" : '',
                TAILWIND_PLUGIN: cssVars ? '      tailwindcss(),\n' : '',
                THREEJS_CHUNK: threejs ? '...' : '',
            }
        );
        writeFileSync(configPath, configContent, 'utf-8');
    }
}
```

---

## Step 6: CSS Variables Setup (`source/app.tsx` → `source/utils/css-variables.ts`)

**For Vue Projects:**

```
generateCSSVariables('vue', workingPath)
    ↓
Determines CSS path: src/assets/style.css
    ↓
Creates directory if needed
    ↓
Loads template: css/tailwind.css.template
    ↓
Writes CSS file with all variables
    ↓
If cssVars enabled:
    updateIndexHtml(workingPath)
        ↓
        Reads index.html
        ↓
        Adds: <link href="/src/assets/style.css" rel="stylesheet">
        ↓
        Writes updated index.html
```

**Key Code:**
```typescript
// app.tsx:161-171
} else {
    await generateCSSVariables(
        finalProjectType as 'nuxt' | 'vue',
        workingPath,
    );
    
    // For Vue projects, update index.html with stylesheet link
    if (finalProjectType === 'vue' && selectedFeatures.cssVars) {
        await updateIndexHtml(workingPath);
    }
}
```

```typescript
// css-variables.ts:222-247
export async function generateCSSVariables(
    projectType: ProjectType,
    projectPath: string,
    initialSetup: boolean = false,
): Promise<void> {
    let cssPath: string;
    
    if (projectType === 'nuxt') {
        cssPath = join(projectPath, 'app', 'assets', 'css', 'tailwind.css');
    } else {
        // Vue: src/assets/style.css
        cssPath = join(projectPath, 'src', 'assets', 'style.css');
    }
    
    mkdirSync(dirname(cssPath), {recursive: true});
    
    if (initialSetup && projectType === 'nuxt') {
        writeFileSync(cssPath, '@import "tailwindcss";\n', 'utf-8');
    } else {
        // Load template and write
        const cssContent = loadTemplate('css/tailwind.css.template');
        writeFileSync(cssPath, cssContent.trim() + '\n', 'utf-8');
    }
}
```

---

## Step 7: Completion (`source/app.tsx`)

**State:** `step = 'completed'`

```
setStep('completed')
    ↓
Renders <Summary> component
    ↓
Displays:
  - Project path
  - Selected features
  - Next steps
```

**Key Code:**
```typescript
// app.tsx:173
setStep('completed');

// app.tsx:259-261
if (step === 'completed' && features) {
    return <Summary features={features} projectPath={projectPath} />;
}
```

---

## Complete Flow Diagram

```
CLI Entry (cli.tsx)
    ↓
App Component (app.tsx)
    ↓
┌─────────────────────────────────────┐
│ 1. Detection Phase                   │
│    - detectProjectType()             │
│    - Set projectType                 │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 2. Selection Phase                  │
│    - FeatureSelector component      │
│    - User selects features          │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 3. Creation Phase                    │
│    - createVueApp()                  │
│    - npm create vue@latest           │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 4. Installation Phase                │
│    - detectPackageManager()          │
│    - getDependencies()               │
│    - Install production deps         │
│    - Install dev deps              │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 5. Configuration Phase               │
│    - generateViteConfig()            │
│    - Load templates                  │
│    - Write config files              │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 6. CSS Setup Phase                   │
│    - generateCSSVariables()          │
│    - Load CSS template               │
│    - updateIndexHtml() (if cssVars)  │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 7. Completion                        │
│    - Summary component               │
└─────────────────────────────────────┘
```

---

## Key Files and Functions

### Entry Points
- `source/cli.tsx` - CLI argument parsing
- `source/app.tsx` - Main app component and orchestration

### Core Functions
- `source/utils/project-detection.ts` - `detectProjectType()`
- `source/utils/app-creation.ts` - `createVueApp()`
- `source/utils/dependencies.ts` - `getDependencies()`
- `source/utils/package-manager.ts` - `detectPackageManager()`, `getInstallCommand()`
- `source/utils/config-generator.ts` - `generateViteConfig()`
- `source/utils/css-variables.ts` - `generateCSSVariables()`, `updateIndexHtml()`
- `source/utils/template-loader.ts` - `loadTemplate()`, `loadTemplateWithReplacements()`

### Templates
- `source/template_code/vite/vite.config.ts.template`
- `source/template_code/css/tailwind.css.template`

---

## Error Handling

Errors are caught at each step and displayed:
```typescript
try {
    // ... operation
} catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error');
    setStep('error');
}
```

Error state renders an error message to the user.

