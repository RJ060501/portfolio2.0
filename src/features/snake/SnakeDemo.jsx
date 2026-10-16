'use client';

import { SIZE } from './engine.mjs';
import { useSnakeGame } from './useSnakeGame';

const DIRECTION_BUTTONS = [
  { label: 'Move up', symbol: '↑', direction: { x: 0, y: -1 } },
  { label: 'Move left', symbol: '←', direction: { x: -1, y: 0 } },
  { label: 'Move down', symbol: '↓', direction: { x: 0, y: 1 } },
  { label: 'Move right', symbol: '→', direction: { x: 1, y: 0 } },
];

const STATUS_TITLES = {
  ready: 'A classic. Rebuilt.',
  paused: 'Paused.',
  won: 'You filled the grid!',
  over: 'One more round?',
};

function getCellClass(index, snake, food) {
  const x = index % SIZE;
  const y = Math.floor(index / SIZE);
  const segment = snake.findIndex((position) => position.x === x && position.y === y);

  if (segment === 0) return 'head';
  if (segment > 0) return 'body';
  if (food.x === x && food.y === y) return 'food';
  return '';
}

export default function SnakeDemo() {
  const {
    game,
    speed,
    setSpeed,
    boardRef,
    start,
    togglePause,
    changeDirection,
    handleKeyDown,
    handleBoardBlur,
  } = useSnakeGame();
  const { snake, food, status, score } = game;
  const canPause = status === 'running' || status === 'paused';
  const statusDescription =
    status === 'ready'
      ? 'Eat. Grow. Watch the walls.'
      : status === 'over'
        ? `Final score: ${score}`
        : 'Ready when you are.';

  return (
    <div className="demo snakeDemo">
      <div className="demobar">
        <span>▦ &nbsp; Snake</span>
        <span className="demobadge">BROWSER ADAPTATION</span>
      </div>
      <div className="gamecontrols">
        <strong>
          Score <span className="accent">{String(score).padStart(2, '0')}</span>
        </strong>
        <label>
          Speed
          <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
            <option value={220}>Easy</option>
            <option value={160}>Normal</option>
            <option value={100}>Fast</option>
          </select>
        </label>
      </div>
      <div
        className="gameboard"
        ref={boardRef}
        tabIndex={0}
        role="application"
        aria-label="Snake game. Arrow keys or W A S D to move. Space to pause."
        onKeyDown={handleKeyDown}
        onBlur={handleBoardBlur}
      >
        {Array.from({ length: SIZE * SIZE }, (_, index) => (
          <span key={index} className={getCellClass(index, snake, food)} />
        ))}
        {status !== 'running' && (
          <div className="gameoverlay">
            <strong>{STATUS_TITLES[status]}</strong>
            <p>{statusDescription}</p>
            <button className="button primary" onClick={status === 'paused' ? togglePause : start}>
              {status === 'paused' ? 'Resume' : 'Start game'} →
            </button>
          </div>
        )}
      </div>
      <div className="gamebottom">
        <p>
          Arrow keys or WASD · Space to pause
          <br />
          On mobile, use the direction buttons.
        </p>
        <div className="dpad">
          {DIRECTION_BUTTONS.map(({ label, symbol, direction }) => (
            <button
              key={label}
              aria-label={label}
              onPointerDown={(event) => {
                // Keep keyboard focus on the board when using touch/mouse controls.
                event.preventDefault();
                changeDirection(direction);
              }}
              onClick={(event) => {
                if (event.detail === 0) changeDirection(direction);
              }}
            >
              {symbol}
            </button>
          ))}
        </div>
        <button
          className="textbutton"
          onPointerDown={(event) => event.preventDefault()}
          onClick={togglePause}
          disabled={!canPause}
        >
          {status === 'running' ? 'Pause' : 'Resume'}
        </button>
        <button className="textbutton" onClick={start}>
          Restart
        </button>
      </div>
      <span className="sr" role="status">
        {status === 'over' ? `Game over. Score ${score}` : status === 'paused' ? 'Game paused' : ''}
      </span>
    </div>
  );
}
