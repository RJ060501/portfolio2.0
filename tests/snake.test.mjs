import assert from 'node:assert/strict';
import test from 'node:test';
import { advance, newGame } from '../src/features/snake/engine.mjs';

const runningGame = () => ({ ...newGame(), status: 'running' });

test('moves forward and ignores a direct reversal', () => {
  const initial = runningGame();
  assert.equal(advance(initial, { x: 1, y: 0 }).snake[0].x, 6);
  assert.equal(advance(initial, { x: -1, y: 0 }).snake[0].x, 6);
});

test('eating grows the snake, increments score and places food in a free cell', () => {
  const initial = { ...runningGame(), food: { x: 6, y: 8 } };
  const result = advance(initial, { x: 1, y: 0 }, 0.3);
  assert.equal(result.score, 1);
  assert.equal(result.snake.length, 4);
  assert.ok(!result.snake.some(({ x, y }) => x === result.food.x && y === result.food.y));
  assert.equal(initial.score, 0, 'The engine must not mutate previous state');
});

test('hitting a wall ends the game', () => {
  const initial = { ...runningGame(), snake: [{ x: 15, y: 8 }] };
  assert.equal(advance(initial, { x: 1, y: 0 }).status, 'over');
});

test('moving into the tail is legal only when that cell is being vacated', () => {
  const initial = {
    ...runningGame(),
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 3, y: 2 },
    ],
    direction: { x: 0, y: -1 },
  };
  assert.equal(advance(initial, { x: 1, y: 0 }).status, 'running');
  const longerSnake = { ...initial, snake: [...initial.snake, { x: 4, y: 2 }] };
  assert.equal(advance(longerSnake, { x: 1, y: 0 }).status, 'over');
});

test('paused games remain unchanged', () => {
  const initial = { ...runningGame(), status: 'paused' };
  assert.equal(advance(initial, { x: 1, y: 0 }), initial);
});
