import { GAME_CONFIG } from './config.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export async function loadDrivers() {
  const response = await fetch('./src/data/drivers.json');
  if (!response.ok) {
    throw new Error('Impossible de charger les pilotes.');
  }

  const drivers = await response.json();
  return drivers.sort((a, b) => a.dayIndex - b.dayIndex);
}

function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getBaseDate() {
  return parseLocalDate(GAME_CONFIG.baseDayIndexDate);
}

function getDateAtLocalHour(date, hour) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hour,
    0,
    0,
    0,
  );
}

function getFirstRotationDate() {
  const baseDate = getBaseDate();
  return new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate() + 1,
    GAME_CONFIG.rotationHourLocal,
    0,
    0,
    0,
  );
}

export function getRotationKey(now = Date.now()) {
  const currentDate = new Date(now);
  const firstRotationDate = getFirstRotationDate();

  if (currentDate < firstRotationDate) {
    return 0;
  }

  return 1 + Math.floor((currentDate.getTime() - firstRotationDate.getTime()) / DAY_MS);
}

export function getActiveDriver(drivers, now = Date.now()) {
  const rotationKey = getRotationKey(now);
  const rotationIndex = ((rotationKey % drivers.length) + drivers.length) % drivers.length;
  return drivers[rotationIndex];
}

export function getTimeUntilNextRotation(now = Date.now()) {
  const currentDate = new Date(now);
  const firstRotationDate = getFirstRotationDate();

  if (currentDate < firstRotationDate) {
    return firstRotationDate.getTime() - currentDate.getTime();
  }

  const nextRotationDate = getDateAtLocalHour(
    new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1),
    GAME_CONFIG.rotationHourLocal,
  );

  return nextRotationDate.getTime() - currentDate.getTime();
}