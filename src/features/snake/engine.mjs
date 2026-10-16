export const SIZE = 16;

export function newGame() {
  return {
    snake: [
      { x: 5, y: 8 },
      { x: 4, y: 8 },
      { x: 3, y: 8 },
    ],
    food: { x: 11, y: 8 },
    direction: { x: 1, y: 0 },
    score: 0,
    status: 'ready',
  };
}

function occupiesCell(snake, cell) {
  return snake.some((segment) => segment.x === cell.x && segment.y === cell.y);
}

function getFreeCells(snake) {
  const cells = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (!occupiesCell(snake, { x, y })) cells.push({ x, y });
    }
  }
  return cells;
}

/** Advance one tick without mutating state. Random input keeps tests repeatable. */
export function advance(game, requestedDirection, random = 0.5) {
  if (game.status !== 'running') return game;

  const isReverse =
    requestedDirection.x === -game.direction.x && requestedDirection.y === -game.direction.y;
  const direction = isReverse ? game.direction : requestedDirection;
  const head = {
    x: game.snake[0].x + direction.x,
    y: game.snake[0].y + direction.y,
  };
  const ateFood = head.x === game.food.x && head.y === game.food.y;

  // A non-growing snake vacates its tail before checking the next head position.
  const body = ateFood ? game.snake : game.snake.slice(0, -1);
  const hitWall = head.x < 0 || head.x >= SIZE || head.y < 0 || head.y >= SIZE;
  if (hitWall || occupiesCell(body, head)) return { ...game, status: 'over' };

  const snake = [head, ...body];
  if (!ateFood) return { ...game, snake, direction };

  const freeCells = getFreeCells(snake);
  const nextFoodIndex = Math.min(freeCells.length - 1, Math.floor(random * freeCells.length));
  return {
    ...game,
    snake,
    direction,
    score: game.score + 1,
    status: freeCells.length ? 'running' : 'won',
    food: freeCells.length ? freeCells[nextFoodIndex] : game.food,
  };
}
