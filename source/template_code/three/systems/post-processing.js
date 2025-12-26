import {
	BloomEffect,
	EffectComposer,
	EffectPass,
	RenderPass,
	ChromaticAberrationEffect,
	BlendFunction,
	NoiseEffect,
	SMAAEffect,
	ShaderPass,
} from 'postprocessing';
import {HalfFloatType, ShaderMaterial, Uniform, Vector2} from 'three';

function createPostprocessing(scene, camera, renderer) {
	const composer = new EffectComposer(renderer, {
		frameBufferType: HalfFloatType,
	});

	composer.setSize(window.innerWidth, window.innerHeight);
	composer.addPass(new RenderPass(scene, camera));

	const bloomEffect = new BloomEffect({
		luminanceThreshold: 0.2,
		luminanceSmoothing: 0.7,
		intensity: 0.1,
		mipmapBlur: true,
	});

	const chromaticAberrationEffect = new ChromaticAberrationEffect({
		offset: new Vector2(0.0005, 0.0005),
	});

	const noiseEffect = new NoiseEffect({
		blendFunction: BlendFunction.OVERLAY,
		premultiplyAlpha: true,
	});

	noiseEffect.blendMode.opacity.value = 0.2;

	const smaaEffect = new SMAAEffect();

	const smaaPass = new EffectPass(camera, smaaEffect);
	const effectPass = new EffectPass(camera, noiseEffect);
	composer.addPass(smaaPass);
	composer.addPass(effectPass);

	return composer;
}

export {createPostprocessing};
