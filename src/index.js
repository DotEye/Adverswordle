import {
    chooseWordAndUpdateLettersLeft,
    displayWord,
    finishWordUpdate,
    getHistory,
    getScoreFromButtons,
    getStorage,
    getWordFromButtons,
    hidePopups,
    hideTutorial,
    loadFromHistory,
    putWordOnButtons,
    removeStorage,
    setStorage,
    shareText,
    updateAIThoughts,
    updateWhyDidILose,
    wrapWithBold,
    wrapWithHeader,
    wrapWithSpoilers,
} from './helper.js';
import {
    boardElement,
    buttons,
    highContrastModeElement,
    scoreElement,
    settingsButtonElement,
    settingsPopupElement,
    shareButtonElement,
    submitButtonElement,
    tooltipElement,
    tooltipPopupElement,
    tutorialElement,
    whyDidILoseButtonElement,
    whyDidILoseInputElement,
    whyDidILosePopupButtonElement,
    whyDidILosePopupElement,
} from './dom.js';
import {isMobileOrTablet} from './isMobileOrTablet.js';
import {puzzleNumber, letterColors} from './constants.js';
import * as Random from 'random-seed';
import {getEmoji, validSubmission} from './exposedForTesting.js';

const generator = new Random(puzzleNumber);

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

document.querySelectorAll('.done-button').forEach(element => element.onclick = hidePopups);

submitButtonElement.onclick = () => {
    displayWord(getWordFromButtons());

    const history = getHistory();
    setStorage('history', JSON.stringify(history));

    finishWordUpdate(generator, history);
};

shareButtonElement.onchange = (event) => {
    const spoilerType = event.target.value;

    let text = `${wrapWithHeader(`Adverswordle #${puzzleNumber}`, spoilerType)}\n\n`;
    for (const [index, element] of Object.entries(boardElement.childNodes)) {
        const score = Array.from(element.childNodes).map(el => getEmoji(highContrastModeElement.checked, el.className)).join('');
        text += `${wrapWithSpoilers(score, spoilerType)} ${index === '0' ? element.innerText : wrapWithSpoilers(element.innerText, spoilerType)}\n`;
        if (spoilerType === 'Reddit Spoilers') text += '\n';
    }
    text += `\n${wrapWithBold('Score', spoilerType)}: ${scoreElement.innerText}`;

    shareText(text, spoilerType);
    shareButtonElement.selectedIndex = 0;
};

tooltipElement.onclick = (event) => {
    tooltipPopupElement.className = (tooltipPopupElement.className.includes('shown') ? 'hidden' : 'shown') + ' popup';
    event.stopPropagation();
};

settingsButtonElement.onclick = (event) => {
    settingsPopupElement.className = (settingsPopupElement.className.includes('shown') ? 'hidden' : 'shown') + ' popup';
    event.stopPropagation();
};

document.body.onclick = hidePopups;

settingsPopupElement.onclick = (event) => {
    event.stopPropagation();
};

highContrastModeElement.onchange = () => {
    document.body.className = highContrastModeElement.checked ? 'high-contrast' : '';
    setStorage('high-contrast', highContrastModeElement.checked);
};

whyDidILosePopupElement.onclick = (event) => {
    event.stopPropagation();
};

whyDidILosePopupButtonElement.onclick = (event) => {
    whyDidILosePopupElement.className = (whyDidILosePopupElement.className.includes('shown') ? 'hidden' : 'shown') + ' popup';
    event.stopPropagation();
};

whyDidILoseButtonElement.onclick = updateWhyDidILose;

whyDidILoseInputElement.onkeydown = (event) => {
    if(event.key === 'Enter') updateWhyDidILose();
}

if (getStorage('puzzleNumber') !== puzzleNumber.toString()) removeStorage('history');
const rawHistory = getStorage('history');
const history = rawHistory ? JSON.parse(rawHistory) : undefined;
if (history) {
    loadFromHistory(history);
    hideTutorial();
}
const word = chooseWordAndUpdateLettersLeft(generator, getHistory(), !history);
if (word) putWordOnButtons(word);
if (history) finishWordUpdate(generator, history);
updateAIThoughts();
if (getStorage('high-contrast') === 'true') {
    document.body.className = 'high-contrast';
    highContrastModeElement.checked = true;
}
if (isMobileOrTablet()) tutorialElement.innerHTML = 'Tap &#8594;';
setStorage('puzzleNumber', puzzleNumber.toString());
