
import { GAME_CONFIG } from './config.js';

export async function loadDrivers() {
  const response = await fetch('./src/data/drivers.json');
  if (!response.ok) {
    throw new Error('Impossible de charger les pilotes.');
  }

  const drivers = await response.json();
  return drivers.sort((a, b) => a.dayIndex - b.dayIndex);
}

export function getRotationKey(now = Date.now()) {
  return Math.floor(now / GAME_CONFIG.rotationIntervalMs);
}

export function getActiveDriver(drivers, now = Date.now()) {
  const rotationKey = getRotationKey(now);
  const rotationIndex = rotationKey % drivers.length;
  return drivers[rotationIndex];
}

export function getTimeUntilNextRotation(now = Date.now()) {
  const elapsed = now % GAME_CONFIG.rotationIntervalMs;
  return GAME_CONFIG.rotationIntervalMs - elapsed;
}
