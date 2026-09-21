import { playable } from '@replayablejs/runtime';
import { Container } from 'pixi.js';

import type { LevelView, GameplayView } from '#types/gameplay';
import type { LevelStatus } from '#types/level-model';
import type { LevelTransition } from '#types/level-transition';

import { getGameConfig } from '../../config/games';
import { createLevel } from './create-level';
import { playLevelTransition } from './play-level-transition';

/** Own the level sequence, transitions, and the final endcard board. */
export function createGameplay(): GameplayView {
  const container = new Container({ label: 'gameplay', eventMode: 'passive' });

  const { levels } = getGameConfig(String(playable.config.params.game));
  const levelsToEndcard = Number(playable.config.params.levelsToEndcard);
  const movesToEndcard = Number(playable.config.params.movesToEndcard);
  let acceptedMoves = 0;
  let levelIndex = 0;
  let outgoing: LevelView | undefined;
  let transition: LevelTransition | undefined;

  // Only the opening level teaches the first color-control interaction.
  let level = mountLevel(0, playable.config.params.tutorial === true);

  const removeResize = playable.on('resize', finishTransition);

  return { container, start, destroy };

  function mountLevel(index: number, showTutorial: boolean): LevelView {
    const view = createLevel({
      config: levels[index],
      tutorial: showTutorial,
      onFinish: handleLevelFinish,
      onMoveAccepted: handleMoveAccepted,
    });
    container.addChildAt(view.container, 0);
    return view;
  }

  function start(): void {
    level.start();
  }

  /** Count accepted selections across levels, never rejected taps. */
  function handleMoveAccepted(): void {
    if (playable.state.completion) {
      return;
    }
    acceptedMoves++;
    if (movesToEndcard > 0 && acceptedMoves >= movesToEndcard) {
      playable.complete('success');
    }
  }

  function handleLevelFinish(status: LevelStatus): void {
    switch (status) {
      case 'lost':
        if (!playable.state.completion) {
          playable.complete('failure');
        }
        break;
      case 'won':
        advanceLevel();
        break;
    }
  }

  function advanceLevel(): void {
    if (levelIndex === levels.length - 1) {
      return;
    }

    outgoing = level;
    level = mountLevel(++levelIndex, false);
    transition = playLevelTransition({
      outgoing,
      incoming: level.container,
      onComplete: startLevel,
    });
  }

  function startLevel(): void {
    transition = undefined;
    outgoing?.destroy();
    outgoing = undefined;
    level.start();

    // The new board appears after the configured number of completed levels.
    if (levelsToEndcard > 0 && levelIndex >= levelsToEndcard && !playable.state.completion) {
      playable.complete('success');
    }
  }

  function finishTransition(): void {
    transition?.finish();
  }

  function stopTransition(): void {
    transition?.stop();
    transition = undefined;
  }

  function destroy(): void {
    removeResize();
    stopTransition();
    outgoing?.destroy();
    level.destroy();
    container.destroy();
  }
}
