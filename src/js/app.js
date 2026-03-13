import { loadDrivers, getActiveDriver, getRotationKey, getTimeUntilNextRotation } from './modules/data-service.js';
import { getGameState, saveGameState, getThemePreference, saveThemePreference } from './modules/storage.js';
import { submitGuess } from './modules/game.js';
import { rankDrivers } from './modules/search.js';
import {
  cacheDom,
  renderDriverData,
  renderClues,
  renderFeedback,
  renderSearchResults,
  hideSearchResults,
  renderFinalState,
  updateInputAvailability,
  renderCountdown,
  renderThemeButton,
} from './modules/ui.js';

let drivers = [];
let activeDriver = null;
let rotationKey = null;
let state = null;
let currentResults = [];
let activeSearchIndex = -1;
let selectedDriver = null;
let wasSelectedByClick = false;
let currentTheme = 'light';
let themeTransitionTimeout = null;

const elements = cacheDom();

init().catch((error) => {
  console.error(error);
  renderFeedback(elements, { type: 'error', message: 'Une erreur est survenue au chargement du jeu.' });
});

async function init() {
  currentTheme = getThemePreference();
  applyTheme(currentTheme);
  renderThemeButton(elements, currentTheme);

  drivers = await loadDrivers();
  hydrateGame();
  bindEvents();
  startCountdown();
}

function hydrateGame() {
  rotationKey = getRotationKey();
  activeDriver = getActiveDriver(drivers);
  state = getGameState(rotationKey);

  renderDriverData(elements, activeDriver);
  renderClues(elements, state);
  renderFeedback(elements, state.feedback || null);
  renderFinalState(elements, state, activeDriver);
  updateInputAvailability(elements, state);

  resetSearchState();
}

function bindEvents() {
  elements.driverSearch.addEventListener('input', handleSearchInput);
  elements.driverSearch.addEventListener('keydown', handleSearchKeyboard);
  elements.guessButton.addEventListener('click', submitCurrentGuess);
  elements.themeButton.addEventListener('click', toggleTheme);
  document.addEventListener('keydown', handleGlobalKeyboard);
  document.addEventListener('click', handleOutsideClick);
  elements.searchResults.addEventListener('click', handleSearchSelection);
  elements.rulesButton.addEventListener('click', () => elements.rulesDialog.showModal());
  elements.rulesDialog.addEventListener('click', (event) => {
    const rect = elements.rulesDialog.getBoundingClientRect();
    const clickedInDialog = (
      rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX && event.clientX <= rect.left + rect.width
    );
    if (!clickedInDialog) elements.rulesDialog.close();
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function animateThemeSwitch() {
  document.body.classList.add('theme-switching');
  window.clearTimeout(themeTransitionTimeout);
  themeTransitionTimeout = window.setTimeout(() => {
    document.body.classList.remove('theme-switching');
  }, 560);
}

function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  animateThemeSwitch();
  applyTheme(currentTheme);
  saveThemePreference(currentTheme);
  renderThemeButton(elements, currentTheme);
}

function resetSearchState() {
  elements.driverSearch.value = '';
  currentResults = [];
  activeSearchIndex = -1;
  selectedDriver = null;
  wasSelectedByClick = false;
  hideSearchResults(elements);
}

function handleSearchInput(event) {
  const query = event.target.value;
  currentResults = rankDrivers(drivers, query);
  activeSearchIndex = -1;
  selectedDriver = null;
  wasSelectedByClick = false;
  renderSearchResults(elements, currentResults, activeSearchIndex);
}

function handleSearchKeyboard(event) {
  if (event.key === 'ArrowDown') {
    if (!currentResults.length) return;
    event.preventDefault();
    activeSearchIndex = Math.min(activeSearchIndex + 1, currentResults.length - 1);
    renderSearchResults(elements, currentResults, activeSearchIndex);
    return;
  }

  if (event.key === 'ArrowUp') {
    if (!currentResults.length) return;
    event.preventDefault();
    activeSearchIndex = Math.max(activeSearchIndex - 1, 0);
    renderSearchResults(elements, currentResults, activeSearchIndex);
    return;
  }

  if (event.key === 'Enter') {
    event.preventDefault();

    if (wasSelectedByClick) {
      submitCurrentGuess();
    }
  }
}

function handleGlobalKeyboard(event) {
  if (event.key !== 'Enter') return;
  if (event.defaultPrevented) return;
  if (state.status !== 'playing') return;
  if (elements.rulesDialog.open) return;

  const target = event.target;
  const tagName = target?.tagName?.toLowerCase();

  if (tagName === 'textarea') return;
  if (target?.isContentEditable) return;
  if (tagName === 'input' && target !== elements.driverSearch) return;
  if (!wasSelectedByClick) return;

  event.preventDefault();
  submitCurrentGuess();
}

function handleSearchSelection(event) {
  const item = event.target.closest('.search-results__item');
  if (!item) return;

  const driver = drivers.find((entry) => entry.id === item.dataset.driverId);
  if (!driver) return;

  applySelectedDriver(driver, { selectedByClick: true });
}

function applySelectedDriver(driver, options = {}) {
  selectedDriver = driver;
  wasSelectedByClick = Boolean(options.selectedByClick);
  elements.driverSearch.value = driver.name;
  hideSearchResults(elements);
}

function handleOutsideClick(event) {
  if (!event.target.closest('.search-area')) {
    hideSearchResults(elements);
  }
}

function submitCurrentGuess() {
  if (state.status !== 'playing') return;
  if (!selectedDriver) {
    renderFeedback(elements, { type: 'error', message: 'Sélectionne un pilote dans la liste.' });
    return;
  }

  if (state.guesses.includes(selectedDriver.id)) {
    renderFeedback(elements, { type: 'error', message: 'Tu as déjà proposé ce pilote.' });
    return;
  }

  state = submitGuess(state, selectedDriver, activeDriver);
  saveGameState(rotationKey, state);

  renderClues(elements, state);
  renderFeedback(elements, state.feedback);
  renderFinalState(elements, state, activeDriver);
  updateInputAvailability(elements, state);

  resetSearchState();
}

function startCountdown() {
  renderCountdown(elements, getTimeUntilNextRotation());

  setInterval(() => {
    const nextRotationKey = getRotationKey();
    renderCountdown(elements, getTimeUntilNextRotation());

    if (nextRotationKey !== rotationKey) {
      hydrateGame();
    }
  }, 1000);
}