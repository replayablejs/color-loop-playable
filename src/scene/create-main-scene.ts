import { playable } from '@replayablejs/runtime';
import { Container } from 'pixi.js';

import { sounds } from '#registries';
import type { MainScene } from '#types/main-scene';

import { createEndCard } from './endcard/create-end-card';
import { createGameplay } from './gameplay/create-gameplay';
import { createInterface } from './interface/create-interface';

/** Compose the playable and show its endcard when the runtime completes. */
export function createMainScene(): MainScene {
  const container = new Container({ label: 'main-scene', eventMode: 'static' });

  // Request once; Replayable waits for audio permission and owns mute/pause behavior.
  const music = playable.audio.play(sounds['music-loop'], {
    loop: true,
    volume: 0.18,
    fadeIn: 1,
  });

  const gameplay = createGameplay();
  const ui = createInterface();
  const endCard = createEndCard();

  container.addChild(gameplay.container, ui.container, endCard.container);
  const removeComplete = playable.on('complete', handleCompletion);
  gameplay.start();

  return { container, destroy };

  function handleCompletion(): void {
    endCard.show();
  }

  function destroy(): void {
    removeComplete();
    music.stop();
    gameplay.destroy();
    ui.destroy();
    endCard.destroy();
    container.destroy();
  }
}
