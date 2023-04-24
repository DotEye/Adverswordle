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

const tooltipHandler = (event) => {
    tooltipPopupElement.querySelector('h2').tabIndex = 0;
    tooltipPopupElement.querySelector('.done-button').tabIndex = 0;
    tooltipPopupElement.className = (tooltipPopupElement.className.includes('shown') ? 'hidden' : 'shown') + ' popup';
    event.stopPropagation();
};
tooltipElement.onclick = tooltipHandler;
tooltipElement.onkeydown = event => {
    if (event.key !== 'Enter') return;
    tooltipHandler(event);
    tooltipPopupElement.querySelector('h2').focus();
}

const settingsButtonElementHandler = (event) => {
    highContrastModeElement.tabIndex = 0;
    highContrastModeElement.parentElement.parentElement.nextElementSibling.tabIndex = 0;
    settingsPopupElement.className = (settingsPopupElement.className.includes('shown') ? 'hidden' : 'shown') + ' popup';
    event.stopPropagation();
};
settingsButtonElement.onclick = settingsButtonElementHandler;
settingsButtonElement.onkeydown = event => {
    if (event.key !== 'Enter') return;
    settingsButtonElementHandler(event);
    highContrastModeElement.focus();
}

document.body.onclick = hidePopups;

settingsPopupElement.onclick = (event) => {
    event.stopPropagation();
};

const highContrastModeHandler = () => {
    document.body.className = highContrastModeElement.checked ? 'high-contrast' : '';
    setStorage('high-contrast', highContrastModeElement.checked);
};
highContrastModeElement.onchange = highContrastModeHandler;
highContrastModeElement.onkeydown = event => {
    if (event.key !== 'Enter') return;
    highContrastModeElement.checked = !highContrastModeElement.checked;
    highContrastModeHandler();
};

whyDidILosePopupElement.onclick = (event) => {
    event.stopPropagation();
};

const whyDidILosePopupButtonHandler = (event) => {
    whyDidILoseInputElement.tabIndex = 0;
    whyDidILoseButtonElement.tabIndex = 0;
    whyDidILosePopupElement.querySelector('.done-button').tabIndex = 0;
    whyDidILosePopupElement.className = (whyDidILosePopupElement.className.includes('shown') ? 'hidden' : 'shown') + ' popup';
    event.stopPropagation();
};
whyDidILosePopupButtonElement.onclick = whyDidILosePopupButtonHandler;
whyDidILosePopupButtonElement.onkeydown = event => {
    if (event.key !== 'Enter') return;
    whyDidILosePopupButtonHandler(event);
    whyDidILoseInputElement.focus();
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
