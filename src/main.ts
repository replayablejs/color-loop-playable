import { createEndCardTrigger, createSoundControl, createStats } from '@replayablejs/devtools';
import { createPixi } from '@replayablejs/pixi';
import { playable } from '@replayablejs/runtime';

import { palette } from './config/palette';
import { createMainScene } from './scene/create-main-scene';

// 1. Install Pixi before readiness loads primary assets. Replayable owns
// the canvas, rendering loop, resizing, and pause/resume lifecycle.
const pixi = await createPixi();
// Fill the canvas through the renderer, without a background display object.
pixi.renderer.background.color = palette.background;
await playable.ready();

// 2. Create the scene after primary assets are ready, then mount it on the stage.
const scene = createMainScene();
pixi.stage.addChild(scene.container);

// 3. Initialize configured development tools. Disabled tools become no-ops
// through the build pipeline, so no development-only conditions are needed.
createStats();
createEndCardTrigger();
createSoundControl();

// 4. Start secondary loading without delaying interaction. This remains safe
// when no assets are assigned to the secondary bundle.
void playable.loader.load('secondary');
