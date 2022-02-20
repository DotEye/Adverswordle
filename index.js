const boardElement = document.getElementById('board');
const submitButtonElement = document.getElementById('submit');
const shareButtonElement = document.getElementById('share');
const gameOverElement = document.getElementById('game-over');
const gameOverReasonElement = document.getElementById('game-over-reason');
const scoreElement = document.getElementById('score');
const messageElement = document.getElementById('message');
const keyboardElement = document.getElementById('keyboard');
const aiThoughtsElement = document.getElementById('ai-thoughts');
const tutorialElement = document.getElementById('tutorial');
const tooltipElement = document.getElementById('tooltip');
const tooltipPopupElement = document.getElementById('tooltip-popup');
const settingsButtonElement = document.getElementById('settings-button');
const settingsPopupElement = document.getElementById('settings-popup');
const highContrastModeElement = document.getElementById('high-contrast-mode');
const settingsDoneElement = document.getElementById('settings-done');
const controlsElement = document.getElementById('controls');
const timeLeftElement = document.getElementById('time-left');
const highScoreElement = document.getElementById('high-score');

const letterColors = ['', 'yellow', 'green'];
const launchDate = new Date(2022, 2, 6);
const puzzleNumber = Math.floor((new Date() - launchDate) / (24 * 60 * 60 * 1000));

const buttons = Array.from(document.getElementById('buttons').children);
buttons.forEach(element => {
    element.onclick = () => {
        const history = getHistory();
        const index = letterColors.indexOf(element.className);
        element.className = letterColors[(index + 1) % letterColors.length];
        submitButtonElement.disabled = !validSubmission(getWordFromButtons(), getScoreFromButtons(), history);
        updateAIThoughts();
        hideTutorial();
    }
});

submitButtonElement.onclick = () => {
    displayWord(getWordFromButtons());

    const history = getHistory();
    setStorage('history', JSON.stringify(history));

    finishWordUpdate(history);
}

shareButtonElement.onchange = (event) => {
    const spoilerType = event.target.value;

    let text = `${wrapWithHeader(`Adverswordle #${puzzleNumber}`, spoilerType)}\n\n`;
    for (const [index, element] of Object.entries(boardElement.childNodes)) {
        const score = Array.from(element.childNodes).map(el => getEmoji(el.className)).join('');
        text += `${wrapWithSpoilers(score, spoilerType)} ${index === '0' ? element.innerText : wrapWithSpoilers(element.innerText, spoilerType)}\n`;
    }
    text += `\n${wrapWithBold('Score', spoilerType)}: ${scoreElement.innerText}`;

    shareText(text, spoilerType);
    shareButtonElement.selectedIndex = 0;
}

tooltipElement.onclick = (event) => {
    tooltipPopupElement.className = (tooltipPopupElement.className.includes('shown') ? 'hidden' : 'shown') + ' popup';
    event.stopPropagation();
}

settingsButtonElement.onclick = (event) => {
    settingsPopupElement.className = (settingsPopupElement.className.includes('shown') ? 'hidden' : 'shown') + ' popup';
    event.stopPropagation();
}

document.body.onclick = () => {
    tooltipPopupElement.className = 'hidden popup';
    settingsPopupElement.className = 'hidden popup';
}

settingsPopupElement.onclick = (event) => {
    event.stopPropagation();
}

highContrastModeElement.onchange = () => {
    document.body.className = highContrastModeElement.checked ? 'high-contrast' : '';
    setStorage('high-contrast', highContrastModeElement.checked);
}

settingsDoneElement.onclick = () => {
    settingsPopupElement.className = 'hidden popup';
}

if (getStorage('puzzleNumber') !== puzzleNumber.toString()) removeStorage('history');
Math.seedrandom(puzzleNumber);
const rawHistory = getStorage('history');
const history = rawHistory ? JSON.parse(rawHistory) : undefined;
if (history) {
    loadFromHistory(history);
    hideTutorial();
}
const word = chooseWordAndUpdateLettersLeft(getHistory(), !history);
if (word) putWordOnButtons(word);
if (history) finishWordUpdate(history);
updateAIThoughts();
if (getStorage('high-contrast') === 'true') {
    document.body.className = 'high-contrast';
    highContrastModeElement.checked = true;
}
if (isMobileOrTablet()) tutorialElement.innerHTML = 'Tap &#8594;';
setStorage('puzzleNumber', puzzleNumber.toString());
