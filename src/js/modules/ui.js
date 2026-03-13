import { GAME_CONFIG, UI_TEXT } from './config.js';
import { getRevealedClueCount } from './game.js';

const STATS_CONFIG = [
  ['Grands Prix', 'grandPrix'],
  ['Saisons', 'seasons'],
  ['Titres', 'titles'],
  ['Victoires', 'wins'],
  ['Podiums', 'podiums'],
  ['Poles', 'poles'],
  ['Abandons', 'dnf'],
  ['1er GP', 'firstGrandPrix'],
];

export function cacheDom() {
  return {
    driverSearch: document.getElementById('driverSearch'),
    guessButton: document.getElementById('guessButton'),
    searchResults: document.getElementById('searchResults'),
    feedbackMessage: document.getElementById('feedbackMessage'),
    outlineImage: document.getElementById('outlineImage'),
    helmetImage: document.getElementById('helmetImage'),
    quoteText: document.getElementById('quoteText'),
    teamsText: document.getElementById('teamsText'),
    statsGrid: document.getElementById('statsGrid'),
    flagImage: document.getElementById('flagImage'),
    resultBanner: document.getElementById('resultBanner'),
    resultPortrait: document.getElementById('resultPortrait'),
    resultName: document.getElementById('resultName'),
    resultStatus: document.getElementById('resultStatus'),
    resultWikiLink: document.getElementById('resultWikiLink'),
    rulesButton: document.getElementById('rulesButton'),
    themeButton: document.getElementById('themeButton'),
    rulesDialog: document.getElementById('rulesDialog'),
    rotationCountdown: document.getElementById('rotationCountdown'),
    clueCards: [...document.querySelectorAll('.clue-card')],
  };
}

export function renderDriverData(elements, driver) {
  elements.outlineImage.src = driver.outlineImage;
  elements.outlineImage.alt = `Silhouette de ${driver.name}`;
  elements.helmetImage.src = driver.helmetImage;
  elements.helmetImage.alt = `Casque de ${driver.name}`;
  elements.quoteText.textContent = `« ${driver.quote} »`;
  elements.teamsText.innerHTML = driver.teams.join(' <span aria-hidden="true">→</span> ');

  if (driver.flagImage) {
    elements.flagImage.hidden = false;
    elements.flagImage.src = driver.flagImage;
    elements.flagImage.alt = `Drapeau ${driver.nationality}`;
  } else {
    elements.flagImage.hidden = true;
    elements.flagImage.removeAttribute('src');
    elements.flagImage.alt = 'Drapeau du pilote';
  }

  elements.statsGrid.innerHTML = '';
  STATS_CONFIG.forEach(([label, key]) => {
    const cell = document.createElement('div');
    cell.className = 'stat-cell';
    cell.innerHTML = `
      <span class="stat-cell__label">${label}</span>
      <strong class="stat-cell__value">${driver.stats[key]}</strong>
    `;
    elements.statsGrid.append(cell);
  });
}

export function renderClues(elements, state) {
  const revealCount = getRevealedClueCount(state);
  elements.clueCards.forEach((card, index) => {
    card.classList.toggle('is-hidden', index >= revealCount);
    card.classList.toggle('is-visible', index < revealCount);
  });
}

export function renderFeedback(elements, feedback) {
  elements.feedbackMessage.textContent = feedback?.message || '';
  elements.feedbackMessage.classList.toggle('is-error', feedback?.type === 'error');
  elements.feedbackMessage.classList.toggle('is-success', feedback?.type === 'success');
}

export function renderSearchResults(elements, results, activeIndex = -1) {
  elements.searchResults.innerHTML = '';
  if (!results.length) {
    elements.searchResults.hidden = true;
    return;
  }

  results.forEach((driver, index) => {
    const li = document.createElement('li');
    li.className = 'search-results__item';
    li.dataset.driverId = driver.id;
    li.textContent = driver.name.toUpperCase();
    if (index === activeIndex) li.classList.add('is-active');
    elements.searchResults.append(li);
  });

  elements.searchResults.hidden = false;
}

export function hideSearchResults(elements) {
  elements.searchResults.hidden = true;
  elements.searchResults.innerHTML = '';
}

export function renderFinalState(elements, state, activeDriver) {
  const shouldShow = state.status === 'won' || state.status === 'lost';

  if (!shouldShow) {
    elements.resultBanner.hidden = true;
    elements.resultPortrait.removeAttribute('src');
    elements.resultPortrait.alt = 'Portrait du pilote';
    elements.resultName.textContent = '';
    elements.resultStatus.textContent = '';
    elements.resultStatus.className = 'result-banner__status';
    elements.resultWikiLink.removeAttribute('href');
    return;
  }

  elements.resultBanner.hidden = false;
  elements.resultPortrait.src = activeDriver.portraitImage;
  elements.resultPortrait.alt = activeDriver.name;
  elements.resultName.textContent = activeDriver.name;
  elements.resultWikiLink.href = activeDriver.wikipediaUrl;

  const statusText = state.status === 'won'
    ? `Bravo, tu as trouvé le pilote en ${state.attemptsUsed} tentative${state.attemptsUsed > 1 ? 's' : ''} !`
    : `Dommage, c'était bien tenté...`;

  elements.resultStatus.textContent = statusText;
  elements.resultStatus.className = `result-banner__status ${state.status === 'won' ? 'is-success' : 'is-error'}`;
}

export function updateInputAvailability(elements, state) {
  const disabled = state.status !== 'playing';
  elements.driverSearch.disabled = disabled;
  elements.guessButton.disabled = disabled;
  elements.guessButton.title = disabled ? UI_TEXT.alreadyPlayed : '';
}

export function renderCountdown(elements, milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  elements.rotationCountdown.textContent = `${minutes}:${seconds}`;
}

export function renderThemeButton(elements, theme) {
  const isDark = theme === 'dark';
  elements.themeButton.textContent = isDark ? '☀' : '◐';
  elements.themeButton.setAttribute('aria-pressed', String(isDark));
  elements.themeButton.setAttribute('aria-label', isDark ? 'Activer le mode clair' : 'Activer le mode sombre');
  elements.themeButton.title = isDark ? 'Activer le mode clair' : 'Activer le mode sombre';
}