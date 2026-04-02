import { GAME_CONFIG } from './config.js';

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
  return new Date(year, month - 1, day, 0, 0, 0, 0);
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

function addDays(date, days) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + days,
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  );
}

function getFirstRotationDate() {
  return getDateAtLocalHour(addDays(getBaseDate(), 1), GAME_CONFIG.rotationHourLocal);
}

function getCurrentRotationStart(currentDate) {
  const todayRotation = getDateAtLocalHour(currentDate, GAME_CONFIG.rotationHourLocal);
  return currentDate >= todayRotation ? todayRotation : addDays(todayRotation, -1);
}

function getCalendarDayDiff(startDate, endDate) {
  const startMidnight = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const endMidnight = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  return Math.round((endMidnight.getTime() - startMidnight.getTime()) / (24 * 60 * 60 * 1000));
}

export function getRotationKey(now = Date.now()) {
  const currentDate = new Date(now);
  const firstRotationDate = getFirstRotationDate();

  if (currentDate < firstRotationDate) {
    return 0;
  }

  const currentRotationStart = getCurrentRotationStart(currentDate);
  return 1 + getCalendarDayDiff(firstRotationDate, currentRotationStart);
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

  const todayRotation = getDateAtLocalHour(currentDate, GAME_CONFIG.rotationHourLocal);
  const nextRotationDate = currentDate < todayRotation
    ? todayRotation
    : addDays(todayRotation, 1);

  return nextRotationDate.getTime() - currentDate.getTime();
}