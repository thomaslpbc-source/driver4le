import { GAME_CONFIG } from './config.js';

export function getRevealedClueCount(state) {
  if (state.status !== 'playing') {
    return GAME_CONFIG.clueOrder.length;
  }

  return Math.min(1 + state.attemptsUsed, GAME_CONFIG.clueOrder.length);
}

export function submitGuess(state, guessedDriver, activeDriver) {
  if (state.status !== 'playing') {
    return { ...state, feedback: null };
  }

  if (state.guesses.includes(guessedDriver.id)) {
    return {
      ...state,
      feedback: {
        type: 'error',
        message: 'Tu as déjà proposé ce pilote.',
      },
    };
  }

  const nextState = {
    ...state,
    attemptsUsed: state.attemptsUsed + 1,
    selectedDriverId: guessedDriver.id,
    guesses: [...state.guesses, guessedDriver.id],
  };

  if (guessedDriver.id === activeDriver.id) {
    nextState.status = 'won';
    nextState.feedback = {
      type: 'success',
      message: ``,
    };
    return nextState;
  }

  if (nextState.attemptsUsed >= GAME_CONFIG.maxAttempts) {
    nextState.status = 'lost';
    nextState.feedback = {
      type: 'error',
      message: ``,
    };
    return nextState;
  }

  const remainingAttempts = GAME_CONFIG.maxAttempts - nextState.attemptsUsed;
  nextState.feedback = {
    type: 'error',
    message: `Mauvais pilote ! Retente ta chance... (${remainingAttempts} essai${remainingAttempts > 1 ? 's' : ''} restant${remainingAttempts > 1 ? 's' : ''})`,
  };

  return nextState;
}