import { GAME_CONFIG } from './config.js';

const THEME_STORAGE_KEY = 'driver4le:theme';

export function getGameState(rotationKey) {
  const raw = localStorage.getItem(`${GAME_CONFIG.storagePrefix}:${rotationKey}`);
  if (!raw) {
    return createDefaultState(rotationKey);
  }

  try {
    return { ...createDefaultState(rotationKey), ...JSON.parse(raw) };
  } catch {
    return createDefaultState(rotationKey);
  }
}

export function saveGameState(rotationKey, state) {
  localStorage.setItem(`${GAME_CONFIG.storagePrefix}:${rotationKey}`, JSON.stringify(state));
}

export function getThemePreference() {
  const theme = localStorage.getItem(THEME_STORAGE_KEY);
  return theme === 'dark' ? 'dark' : 'light';
}

export function saveThemePreference(theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme === 'dark' ? 'dark' : 'light');
}

export function createDefaultState(rotationKey) {
  return {
    rotationKey,
    attemptsUsed: 0,
    guesses: [],
    status: 'playing',
    selectedDriverId: '',
    feedback: null,
  };
}