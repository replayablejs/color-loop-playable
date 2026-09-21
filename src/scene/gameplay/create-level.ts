import { createLayout } from '@replayablejs/pixi';
import { playable, type UpdateContext } from '@replayablejs/runtime';
import { Container } from 'pixi.js';

import type { LevelOptions, LevelView } from '#types/gameplay';
import type { LevelOutcome } from '#types/level-model';

import { playSound } from '../../features/audio/play-sound';
import { createColorControls } from '../../features/color-controls/create-color-controls';
import { createPlayfield } from '../../features/playfield/create-playfield';
import { createTutorial } from '../../features/tutorial/create-tutorial';
import { createConveyorMovement } from '../../gameplay/create-conveyor-movement';
import { createLevelModel } from '../../model/create-level-model';
import { createGameplayLayout } from './configs/gameplay-layout';

/** Connect one level's rules, views, input, and Replayable lifecycle. */
export function createLevel({
  config,
  onFinish,
  onMoveAccepted,
  tutorial: showTutorial,
}: LevelOptions): LevelView {
  const container = new Container({ label: 'level', eventMode: 'none' });

  let pendingOutcome: LevelOutcome | undefined;
  let removeUpdate: (() => void) | undefined;

  const model = createLevelModel({ config, onOutcome: handleOutcome });
  const playfield = createPlayfield({ config: config.level, onIdle: finishPendingOutcome });
  const colorControls = createColorControls(model.controls, selectColor);
  const tutorial = showTutorial ? createTutorial(colorControls.getTutorialTarget) : undefined;

  const conveyorMovement = createConveyorMovement({
    config,
    model,
    throwEvents: playfield.distributorThrow,
    onMatch: playfield.playMatch,
    onPositionsChange: playfield.updateConveyorPositions,
  });

  refresh();

  const layout = createLayout(createGameplayLayout(config.hand.slots));

  container.addChild(layout.container);
  layout.attach('playfield', playfield.container);
  layout.attach('controls', colorControls.container);

  if (tutorial) {
    container.addChild(tutorial.container);
  }

  const removeResize = playable.on('resize', resize);
  const removeComplete = playable.on('complete', disableInput);

  return { container, start, hideControls: colorControls.hide, destroy };

  function start(): void {
    if (removeUpdate) {
      return;
    }

    colorControls.show();
    removeUpdate = playable.update.add(update);
    if (playable.state.completion) {
      disableInput();
    } else {
      tutorial?.restart();
      container.eventMode = 'passive';
    }
  }

  function selectColor(controlIndex: number): void {
    if (!removeUpdate || playable.state.completion || model.status !== 'playing') {
      return;
    }

    tutorial?.consume();

    if (!model.queueForDistributor(controlIndex)) {
      playSound('rejection');
      colorControls.playReject(controlIndex);
      return;
    }

    playSound('selection');
    colorControls.playFeed(controlIndex);
    refresh();
    onMoveAccepted();
  }

  function update({ deltaSeconds }: UpdateContext): void {
    const previousRevision = model.revision;
    conveyorMovement.update(deltaSeconds);
    // Match and feed animations must be prepared before artwork reflects the new state.
    if (model.revision !== previousRevision) {
      refresh();
    }
  }

  function refresh(): void {
    const { sockets, board, distributorQueue, controls } = model;

    playfield.refresh({
      sockets,
      board,
      distributorQueue,
    });
    colorControls.refresh(controls);
  }

  function resize(): void {
    colorControls.resize();
    layout.update(createGameplayLayout(config.hand.slots));

    if (removeUpdate && !playable.state.completion && model.status === 'playing') {
      tutorial?.restart();
    }
  }

  function handleOutcome(outcome: LevelOutcome): void {
    pendingOutcome = outcome;
    tutorial?.consume();
    container.eventMode = 'none';

    // The same match starts its artwork after the model reports its result.
    queueMicrotask(finishPendingOutcome);
  }

  /** Idle events only deliver an outcome already reported by the model. */
  function finishPendingOutcome(): void {
    if (!pendingOutcome || !playfield.idle) {
      return;
    }

    const outcome = pendingOutcome;
    pendingOutcome = undefined;
    playSound(outcome === 'won' ? 'success' : 'failure');
    onFinish(outcome);
  }

  /** The endcard blocks input without interrupting simulation or level outcomes. */
  function disableInput(): void {
    tutorial?.consume();
    container.eventMode = 'none';
  }

  function destroy(): void {
    // Discard the result before teardown or a queued idle check can deliver it.
    pendingOutcome = undefined;
    removeUpdate?.();
    container.eventMode = 'none';
    removeResize();
    removeComplete();

    // The layout detaches its views; their artwork is owned by this gameplay.
    tutorial?.destroy();
    layout.destroy();
    playfield.container.destroy({ children: true });
    colorControls.container.destroy({ children: true });
    container.destroy();
  }
}
