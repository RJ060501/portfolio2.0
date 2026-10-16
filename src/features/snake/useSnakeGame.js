'use client';

import { useEffect, useRef, useState } from 'react';
import { advance, newGame } from './engine.mjs';

const KEY_DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  w: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  s: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  a: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  d: { x: 1, y: 0 },
};

/** Owns timing and input; the engine stays independent of React and browser APIs. */
export function useSnakeGame() {
  const [game, setGame] = useState(newGame);
  const [speed, setSpeed] = useState(160);
  const boardRef = useRef(null);
  const requestedDirection = useRef({ x: 1, y: 0 });

  useEffect(() => {
    if (game.status !== 'running') return;

    const timer = window.setInterval(() => {
      const direction = { ...requestedDirection.current };
      // Sample randomness outside the updater so React can safely replay it.
      const random = Math.random();
      setGame((current) => advance(current, direction, random));
    }, speed);

    return () => window.clearInterval(timer);
  }, [game.status, speed]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) pause();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  function pause() {
    setGame((current) =>
      current.status === 'running' ? { ...current, status: 'paused' } : current,
    );
  }

  function start() {
    requestedDirection.current = { x: 1, y: 0 };
    setGame({ ...newGame(), status: 'running' });
    boardRef.current?.focus();
  }

  function togglePause() {
    setGame((current) => {
      if (current.status === 'running') return { ...current, status: 'paused' };
      if (current.status === 'paused') return { ...current, status: 'running' };
      return current;
    });
    boardRef.current?.focus();
  }

  function changeDirection(direction) {
    requestedDirection.current = direction;
  }

  function handleKeyDown(event) {
    const direction = KEY_DIRECTIONS[event.key];
    if (direction) {
      event.preventDefault();
      changeDirection(direction);
    }
    // Buttons inside the board should retain their native Space activation.
    if (event.code === 'Space' && event.target === event.currentTarget) {
      event.preventDefault();
      togglePause();
    }
  }

  function handleBoardBlur(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) pause();
  }

  return {
    game,
    speed,
    setSpeed,
    boardRef,
    start,
    pause,
    togglePause,
    changeDirection,
    handleKeyDown,
    handleBoardBlur,
  };
}
