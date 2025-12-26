import * as THREE from 'three';
import {gsap} from 'gsap';
import camera from '../camera';
import CustomEase from 'gsap/CustomEase';
import {
	isMobile,
	isTablet,
	initDeviceDetector,
	disposeDeviceDetector,
} from '../utils/deviceDetector';

initDeviceDetector();
if (typeof window !== 'undefined') {
	gsap.registerPlugin(CustomEase);
}
CustomEase.create('fav', '0.785, 0.135, 0.15, 0.86');

// Global texture cache - shared across all instances
const textureCache = new Map();

async function createGlobeSphere(
	renderer,
	scene,
	controls,
	onMeshClick = null,
	content = [],
) {
	console.log(isMobile(), isTablet());

	const COUNT = 120;
	const R = 1.25;
	const Hgt = 0.2;
	const Wth = Hgt * (9 / 11);
	const phi = Math.PI * (3 - Math.sqrt(5));

	const loader = new THREE.TextureLoader();
	const group = new THREE.Group();
	const meshes = []; // Store all meshes for raycaster
	let textures = []; // Store textures for updates
	let textureUrls = []; // Store texture URLs for cache checking
	let currentContent = content; // Store current content

	// Create a single shared plane geometry (reused for all meshes)
	const sharedGeometry = new THREE.PlaneGeometry(Wth, Hgt);

	// Function to configure texture properties
	const configureTexture = tex => {
		const ir = tex.image.width / tex.image.height;
		const pr = Wth / Hgt;
		let rx = 1,
			ry = 1,
			ox = 0,
			oy = 0;
		if (ir > pr) {
			rx = pr / ir;
			ox = (1 - rx) / 2;
		} else {
			ry = ir / pr;
			oy = (1 - ry) / 2;
		}
		tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
		tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
		tex.repeat.set(rx, ry);
		tex.offset.set(ox, oy);
		tex.generateMipmaps = true;
		tex.minFilter = THREE.LinearMipMapLinearFilter;
		tex.magFilter = THREE.LinearFilter;
		tex.colorSpace = THREE.SRGBColorSpace;
		return tex;
	};

	// Function to load textures with caching
	const loadTextures = async contentData => {
		const imgUrls = contentData.map(item => item.img);
		const loadedTextures = await Promise.all(
			imgUrls.map(
				url =>
					new Promise(resolve => {
						// Check cache first
						if (textureCache.has(url)) {
							const cachedTex = textureCache.get(url);
							// Reuse cached texture directly (textures can be shared in Three.js)
							resolve({texture: cachedTex, url});
							return;
						}

						// Load new texture if not in cache
						loader.load(url, tex => {
							const configuredTex = configureTexture(tex);
							// Store in cache for future use
							textureCache.set(url, configuredTex);
							resolve({texture: configuredTex, url});
						});
					}),
			),
		);

		// Return textures and URLs separately
		return {
			textures: loadedTextures.map(item => item.texture),
			urls: loadedTextures.map(item => item.url),
		};
	};

	// Load all textures
	const initialTextures = await loadTextures(content);
	textures = initialTextures.textures;
	textureUrls = initialTextures.urls;

	// Create meshes in Fibonacci sphere pattern
	for (let i = 0; i < COUNT; i++) {
		const v = (i + 0.5) / COUNT;
		const th = phi * i;
		const z = 1 - 2 * v;
		const r0 = Math.sqrt(1 - z * z);
		const fx = Math.cos(th) * r0 * R;
		const fy = z * R;
		const fz = Math.sin(th) * r0 * R;

		const contentIndex = i % content.length;
		const mat = new THREE.MeshBasicMaterial({
			map: textures[contentIndex],
			opacity: 0, // Start invisible for animation
			transparent: true,
			side: THREE.DoubleSide,
			depthWrite: false,
		});
		const mesh = new THREE.Mesh(sharedGeometry, mat);
		mesh.position.set(fx, fy, fz);
		mesh.lookAt(new THREE.Vector3(fx * 2, fy * 2, fz * 2));

		// Set initial scale to 0 for animation
		mesh.scale.set(0, 0, 0);

		// Store content data on mesh for easy access
		mesh.userData.contentIndex = contentIndex;
		mesh.userData.content = content[contentIndex];

		group.add(mesh);
		meshes.push(mesh); // Store mesh reference
	}

	// Expose entrance animation so callers can start it later
	// (e.g. only after the page transition has fully completed).
	let entrancePlayed = false;
	group.userData.playEntranceAnimation = () => {
		if (entrancePlayed) return;
		entrancePlayed = true;

		meshes.forEach((mesh, i) => {
			gsap.to(mesh.scale, {
				x: 1,
				y: 1,
				z: 1,
				duration: 1.2,
				delay: i * 0.01,
				ease: 'power2.out',
			});

			gsap.to(mesh.material, {
				opacity: 1,
				duration: 0.8,
				delay: i * 0.01,
				ease: 'power2.inOut',
			});
		});
	};

	// Expose exit animation (reverse of entrance)
	group.userData.playExitAnimation = () => {
		return new Promise(resolve => {
			// Reset entrance played flag so it can be replayed
			entrancePlayed = false;

			// Animate in reverse order for visual effect
			meshes.forEach((mesh, i) => {
				gsap.to(mesh.scale, {
					x: 0,
					y: 0,
					z: 0,
					duration: 0.8,
					delay: i * 0.005,
					ease: 'power2.in',
				});

				gsap.to(mesh.material, {
					opacity: 0,
					duration: 0.6,
					delay: i * 0.005,
					ease: 'power2.inOut',
					onComplete: i === meshes.length - 1 ? resolve : undefined,
				});
			});
		});
	};

	// Set up raycaster and click handler if renderer and scene are provided
	if (renderer && scene) {
		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();

		// Store original camera position and rotation
		const originalCameraPosition = camera.position.clone();
		const originalCameraQuaternion = camera.quaternion.clone();
		let isAtOriginalPosition = true;
		let currentAnimation = null;
		let selectedMesh = null; // Track currently selected mesh
		let opacityAnimation = null; // Track opacity animation

		// Animation objects for GSAP to animate
		const cameraPos = {
			x: camera.position.x,
			y: camera.position.y,
			z: camera.position.z,
		};
		const cameraProgress = {t: 0}; // Progress for quaternion slerp
		const controlsTarget = controls
			? {x: controls.target.x, y: controls.target.y, z: controls.target.z}
			: null;

		// Store quaternions for slerp
		let startQuaternion = new THREE.Quaternion();
		let endQuaternion = new THREE.Quaternion();

		// Animation function using GSAP
		function animateCamera(
			targetPosition,
			targetLookAt,
			duration = 1,
			applyOffset = true,
			normalVector = null,
			ease = 'power3.inOut',
		) {
			// Kill any existing animation
			if (currentAnimation) {
				currentAnimation.kill();
			}

			let finalPosition;
			let finalQuaternion;

			if (applyOffset && normalVector) {
				// Position camera along the normal vector, offset from the mesh
				const zOffset = isTablet() ? 0.4 : 0.5;
				finalPosition = targetPosition
					.clone()
					.add(normalVector.clone().multiplyScalar(zOffset));

				// Calculate quaternion to make camera look at the mesh
				const up = new THREE.Vector3(0, 1, 0);
				const lookAtMatrix = new THREE.Matrix4();
				lookAtMatrix.lookAt(finalPosition, targetPosition, up);
				finalQuaternion = new THREE.Quaternion().setFromRotationMatrix(
					lookAtMatrix,
				);
			} else {
				// Return to original position
				finalPosition = targetPosition;
				finalQuaternion = originalCameraQuaternion.clone();
			}

			// Store quaternions for slerp
			startQuaternion.copy(camera.quaternion);
			endQuaternion.copy(finalQuaternion);

			// Update animation objects with current values
			cameraPos.x = camera.position.x;
			cameraPos.y = camera.position.y;
			cameraPos.z = camera.position.z;
			cameraProgress.t = 0;

			if (controlsTarget) {
				controlsTarget.x = controls.target.x;
				controlsTarget.y = controls.target.y;
				controlsTarget.z = controls.target.z;
			}

			// Create GSAP timeline
			const tl = gsap.timeline({
				onUpdate: () => {
					// Update camera position
					camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);

					// Update camera quaternion using slerp
					camera.quaternion.slerpQuaternions(
						startQuaternion,
						endQuaternion,
						cameraProgress.t,
					);

					// Update controls target
					if (controls && controlsTarget) {
						controls.target.set(
							controlsTarget.x,
							controlsTarget.y,
							controlsTarget.z,
						);
						controls.update();
					}
				},
				onComplete: () => {
					currentAnimation = null;
					isAtOriginalPosition =
						finalPosition.distanceTo(originalCameraPosition) < 0.1;
				},
			});

			// Animate camera position
			tl.to(
				cameraPos,
				{
					x: finalPosition.x,
					y: finalPosition.y,
					z: finalPosition.z,
					duration,
					ease: ease,
				},
				0,
			);

			// Animate quaternion progress (0 to 1)
			tl.to(
				cameraProgress,
				{
					t: 1,
					duration,
					ease: ease,
				},
				0,
			);

			// Animate controls target
			if (controls && controlsTarget) {
				tl.to(
					controlsTarget,
					{
						x: targetLookAt.x,
						y: targetLookAt.y,
						z: targetLookAt.z,
						duration,
						ease: ease,
					},
					0,
				);
			}

			currentAnimation = tl;
		}

		// Function to animate mesh opacity
		function animateMeshOpacity(targetMesh, opacity, duration = 0.5) {
			// Kill any existing opacity animation
			if (opacityAnimation) {
				opacityAnimation.kill();
			}

			// Create opacity animation objects for GSAP
			const opacityObjects = meshes.map(mesh => ({
				opacity: mesh.material.opacity,
			}));

			// Create timeline for opacity animation
			const tl = gsap.timeline({
				onUpdate: () => {
					meshes.forEach((mesh, index) => {
						mesh.material.opacity = opacityObjects[index].opacity;
					});
				},
				onComplete: () => {
					opacityAnimation = null;
				},
			});

			// Animate each mesh's opacity
			meshes.forEach((mesh, index) => {
				const targetOpacity = mesh === targetMesh ? 1 : opacity;
				tl.to(
					opacityObjects[index],
					{
						opacity: targetOpacity,
						duration,
						ease: 'power3.inOut',
					},
					0,
				);
			});

			opacityAnimation = tl;
		}

		// Function to reset all mesh opacities
		function resetMeshOpacities(duration = 0.5) {
			// Kill any existing opacity animation
			if (opacityAnimation) {
				opacityAnimation.kill();
			}

			// Create opacity animation objects for GSAP
			const opacityObjects = meshes.map(mesh => ({
				opacity: mesh.material.opacity,
			}));

			// Create timeline for opacity animation
			const tl = gsap.timeline({
				onUpdate: () => {
					meshes.forEach((mesh, index) => {
						mesh.material.opacity = opacityObjects[index].opacity;
					});
				},
				onComplete: () => {
					opacityAnimation = null;
				},
			});

			// Animate all meshes to full opacity
			meshes.forEach((mesh, index) => {
				tl.to(
					opacityObjects[index],
					{
						opacity: 1,
						duration,
						ease: 'power2.inOut',
					},
					0,
				);
			});

			opacityAnimation = tl;
			selectedMesh = null;
		}

		// Function to return to original position
		function returnToOriginalPosition() {
			if (controls) {
				controls.autoRotate = true;
			}
			const originalLookAt = new THREE.Vector3(0, 0, 0);
			animateCamera(originalCameraPosition, originalLookAt, 1.3, false);
			isAtOriginalPosition = true;
		}

		// Click handler
		function onMouseClick(event) {
			if (currentAnimation && currentAnimation.isActive()) return;

			// Calculate mouse position in normalized device coordinates (-1 to +1)
			const rect = renderer.domElement.getBoundingClientRect();
			mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
			mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

			// Update raycaster with camera and mouse position
			raycaster.setFromCamera(mouse, camera);

			// Check for intersections with meshes
			const intersects = raycaster.intersectObjects(meshes);

			if (intersects.length > 0) {
				const clickedMesh = intersects[0].object;

				// If clicking the same mesh, reset everything
				if (selectedMesh === clickedMesh) {
					resetMeshOpacities();
					returnToOriginalPosition();
					// Notify callback with null to reset content
					if (onMeshClick) {
						onMeshClick(null);
					}
					return;
				}

				const targetPosition = clickedMesh.position.clone();

				// Get the normal vector of the plane (direction the plane is facing)
				const meshNormal = new THREE.Vector3(0, 0, 1);
				meshNormal.applyQuaternion(clickedMesh.quaternion);
				meshNormal.normalize();

				// Fallback: if normal is invalid, use direction from origin to mesh
				if (meshNormal.length() < 0.1 || !meshNormal.length()) {
					meshNormal.copy(targetPosition).normalize();
				}

				// Disable auto rotate when clicking a mesh
				if (controls) {
					controls.autoRotate = false;
				}

				// Animate camera to clicked image position, oriented parallel to the plane
				animateCamera(targetPosition, targetPosition, 1.3, true, meshNormal);
				isAtOriginalPosition = false;

				// Animate opacity: clicked mesh stays at 1, others go to low opacity
				selectedMesh = clickedMesh;
				animateMeshOpacity(clickedMesh, 0.1, 1.3);

				// Notify callback with content data
				if (onMeshClick && clickedMesh.userData.content) {
					onMeshClick(clickedMesh.userData.content);
				}
			} else if (!isAtOriginalPosition) {
				// Clicked on empty space - return to original position and reset opacities
				resetMeshOpacities();
				returnToOriginalPosition();
				// Notify callback with null to reset content
				if (onMeshClick) {
					onMeshClick(null);
				}
			}
		}

		// Add click event listener
		renderer.domElement.addEventListener('click', onMouseClick);

		// Store cleanup function on the group (includes renderer-specific cleanup)
		group.userData.cleanup = () => {
			// Remove event listeners
			renderer.domElement.removeEventListener('click', onMouseClick);

			// Kill all animations
			if (currentAnimation) {
				currentAnimation.kill();
				currentAnimation = null;
			}
			if (opacityAnimation) {
				opacityAnimation.kill();
				opacityAnimation = null;
			}

			// Call common cleanup
			performCommonCleanup();
		};
	} else {
		// Store cleanup function on the group (common cleanup only)
		group.userData.cleanup = () => {
			performCommonCleanup();
		};
	}

	// Common cleanup function for textures, materials, geometry, and deviceDetector
	function performCommonCleanup() {
		// Dispose deviceDetector
		disposeDeviceDetector();

		// Dispose textures
		textures.forEach(texture => {
			if (texture) {
				texture.dispose();
			}
		});

		// Dispose materials
		meshes.forEach(mesh => {
			if (mesh.material) {
				mesh.material.dispose();
			}
		});

		// Dispose geometry (shared geometry)
		if (sharedGeometry) {
			sharedGeometry.dispose();
		}
	}

	// Method to update content without recreating the scene
	group.userData.updateContent = async newContent => {
		if (!newContent || newContent.length === 0) return;

		currentContent = newContent;

		// Store old textures and URLs for disposal after new ones are loaded
		const oldTextures = [...textures];
		const oldUrls = [...textureUrls];

		// Load new textures (will use cache if available)
		const loadedData = await loadTextures(newContent);
		textures = loadedData.textures;
		textureUrls = loadedData.urls;

		// Update meshes with new textures and content
		meshes.forEach((mesh, i) => {
			const contentIndex = i % newContent.length;

			// Update texture
			mesh.material.map = textures[contentIndex];
			mesh.material.needsUpdate = true;

			// Update content data
			mesh.userData.contentIndex = contentIndex;
			mesh.userData.content = newContent[contentIndex];
		});

		// Dispose old textures only if they're not in the cache
		// Cached textures are reused, so we never dispose them
		oldTextures.forEach((texture, index) => {
			if (texture && !textures.includes(texture)) {
				const oldUrl = oldUrls[index];
				// Only dispose if texture is not in cache (not being reused)
				if (!textureCache.has(oldUrl) || textureCache.get(oldUrl) !== texture) {
					texture.dispose();
				}
			}
		});
	};

	return group;
}

export {createGlobeSphere};
