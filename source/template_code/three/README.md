# Three.js Setup for Nuxt

A professional, modular Three.js setup optimized for Nuxt 3 applications with proper cleanup and developer-friendly patterns.

## Structure

```
three/
├── World.js              # Main Three.js world orchestrator
├── camera.js             # Camera configuration
├── scene.js              # Scene setup with meshes
├── components/           # 3D objects/meshes
│   ├── cube.js          # Rotating cube
│   ├── torus.js         # Animated torus
│   ├── sphere.js        # Floating sphere
│   └── lights.js        # Scene lighting
├── systems/              # Core Three.js systems
│   ├── renderer.js      # WebGL renderer
│   ├── Loop.js          # Animation loop
│   ├── Resizer.js       # Responsive canvas
│   ├── controls.js      # Camera controls
│   └── post-processing.js # Post-processing effects
└── utils/                # Utility functions
```

## Usage in Nuxt

### Basic Setup

```vue
<script setup lang="ts">
import {ref} from 'vue';
import {useThree} from '@/composables/useThree';

const webglContainer = ref<HTMLElement | null>(null);
const {world, isLoading, error} = useThree(webglContainer);
</script>

<template>
	<div ref="webglContainer" class="webgl-container">
		<div v-if="isLoading">Loading 3D Scene...</div>
		<div v-if="error">Error: {{ error.message }}</div>
	</div>
</template>

<style scoped>
.webgl-container {
	position: fixed;
	width: 100%;
	height: 100%;
}
</style>
```

## Features

- ✅ **Proper Cleanup**: Automatic disposal of resources on component unmount
- ✅ **SSR Safe**: Works with Nuxt's server-side rendering
- ✅ **Modular**: Easy to add/remove 3D objects
- ✅ **Performance**: Optimized renderer settings and animation loop
- ✅ **Responsive**: Auto-resize handling
- ✅ **Post-processing**: Built-in effects (SMAA, noise, bloom)
- ✅ **Developer Friendly**: TypeScript support via composable

## Adding New Objects

Create a new file in `components/`:

```js
// components/myMesh.js
import {BoxGeometry, Mesh, MeshStandardMaterial} from 'three';

function createMyMesh() {
	const geometry = new BoxGeometry(1, 1, 1);
	const material = new MeshStandardMaterial({color: '#ff0000'});
	const mesh = new Mesh(geometry, material);

	// Optional: Add animation
	mesh.tick = delta => {
		mesh.rotation.y += delta;
	};

	return mesh;
}

export {createMyMesh};
```

Then add it to `scene.js`:

```js
import { createMyMesh } from './components/myMesh.js';

function createScene() {
  // ...
  const myMesh = createMyMesh();
  scene.add(myMesh);

  // Add to updatables if it has tick method
  scene.userData.updatables = [..., myMesh];
  // ...
}
```

## Performance Tips

1. **Pixel Ratio**: Automatically capped at 2 for performance
2. **Animation Loop**: Uses `requestAnimationFrame` via Three.js
3. **Proper Disposal**: All resources cleaned up on unmount
4. **Post-processing**: Can be disabled for better performance

## Customization

### Adjust Camera

Edit `camera.js`:

```js
camera.position.set(x, y, z);
```

### Modify Controls

Edit `systems/controls.js`:

```js
controls.autoRotate = true;
controls.autoRotateSpeed = 2;
```

### Change Background

Edit `scene.js`:

```js
scene.background = new Color('#yourcolor');
```

### Toggle Post-processing

Comment out in `World.js`:

```js
// this.composer = createPostprocessing(...)
// Use this.renderer.render() instead of this.composer.render()
```
