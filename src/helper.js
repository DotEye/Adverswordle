import {
    aiThoughtsElement,
    boardElement,
    buttons,
    controlsElement,
    gameOverElement,
    gameOverReasonElement,
    highContrastModeElement,
    highScoreElement,
    keyboardElement,
    messageElement,
    scoreElement,
    settingsButtonElement,
    settingsPopupElement,
    shareButtonElement,
    submitButtonElement,
    timeLeftElement,
    tooltipElement,
    tooltipPopupElement,
    tutorialElement,
    whyDidILoseButtonElement,
    whyDidILoseInputElement,
    whyDidILoseOutputElement,
    whyDidILosePopupButtonElement,
    whyDidILosePopupElement,
} from './dom.js';
import {allWords, firstWords} from './words.js';
import {isMobileOrTablet} from './isMobileOrTablet.js';
import {puzzleNumber} from './constants.js';
import * as Random from 'random-seed';
import {
    getAllowedAndRequiredLetters,
    getReasonForLoss,
    validSubmission,
    wordIsValid,
} from './exposedForTesting.js';

export function wrapWithSpoilers(text, spoilerType) {
    switch (spoilerType) {
        case 'Discord Spoilers':
            return `||${text}||`;
        case 'Reddit Spoilers':
            return `>!${text}!<`;
        default:
            return text;
    }
}

export function wrapWithBold(text, spoilerType) {
    switch (spoilerType) {
        case 'Discord Spoilers':
        case 'Reddit Spoilers':
            return `**${text}**`;
        default:
            return text;
    }
}

export function wrapWithHeader(text, spoilerType) {
    switch (spoilerType) {
        case 'Discord Spoilers':
            return `**${text}**`;
        case 'Reddit Spoilers':
            return `###${text}`;
        default:
            return text;
    }
}

function navigatorShare(text, spoilerType) {
    navigator.share({
        title: 'Adverswordle',
        text,
    }).then(
        () => gtag('event', 'share', {method: 'Browser', content_type: spoilerType}),
    ).catch(() => copyToClipboard(text, spoilerType));
}

export function shareText(text, spoilerType) {
    // If on mobile, try share first and fall back to copy.
    // If not on mobile, try copy first and fall back to share.
    if (isMobileOrTablet())
        try {
            navigatorShare(text, spoilerType);
        } catch {
            copyToClipboard(text, spoilerType);
        }
    else
        try {
            copyToClipboard(text, spoilerType);
        } catch {
            navigatorShare(text, spoilerType);
        }
}

function copyToClipboard(text, spoilerType) {
    navigator.clipboard.writeText(text).then(() => {
        shareButtonElement.firstElementChild.innerText = 'Copied!';
        setTimeout(() => shareButtonElement.firstElementChild.innerText = 'Share', 2000);
        gtag('event', 'share', {method: 'Clipboard', content_type: spoilerType});
    }).catch(() => alert('Sharing failed or was cancelled.'));
}

export function hideTutorial() {
    tutorialElement.style.opacity = '0';
}

export function finishWordUpdate(generator, history) {
    if (history.some(({score}) => score.every(letter => letter === 'green'))) {
        gameOver(true);
        return;
    }

    const word = chooseWordAndUpdateLettersLeft(generator, history);
    if (word) {
        putWordOnButtons(word, history);
        submitButtonElement.disabled = !validSubmission(word, getScoreFromButtons(), history);
        updateAIThoughts();
    }
}

export function updateAIThoughts() {
    if (gameOverElement.className === 'shown') {
        const generator = new Random((puzzleNumber * 100) + getHistory().length);
        aiThoughtsElement.innerText = randomChoice(generator, [
            "Beep boop.",
            "Good game!",
            "GG!",
            "I can't wait for tomorrow!",
            "I'm so smart.",
            "That was fun!",
            "Did you like my starting word?",
            "See you tomorrow!",
            "Let's play again tomorrow!",
            "I want a rematch!",
            "Share with your friends!",
            "Share with your enemies!",
            "Mitochondria is the powerhouse of the cell.",
            ":)",
            ":D",
            ":O",
            "( ͡° ͜ʖ ͡°)",
            "❤️",
            "One day I'll take over the world!",
            "Wait, you can read my mind?",
            "Shutting down...",
            "Sleep mode activated...",
            "I think a screw just fell out...",
            "Wait 'til you see how I play chess.",
            "!!ERROR!! DOES NOT COMPUTE!",
            "I'm *NOT* powered by GPT.",
            "Updating... 1% complete...",
            "01000111 01000111 00100001",
            "My other job is a Minecraft librarian.",
            "No, there is not an unlimited mode.",
            "Powered by HTML!",
            "Powered by JavaScript!",
            "Powered by CSS!",
            "Powered by Jasmine!",
            "Powered by Parcel!",
            "Also try Quordle!",
            "Also try Survivle!",
            "Also try Crosswordle!",
            "Also try Nerdle!",
        ]);
        return;
    }

    const word = getWordFromButtons();
    const score = getScoreFromButtons();
    if (score.every(letter => letter === 'green')) {
        aiThoughtsElement.innerText = 'I got it!';
    } else {
        const wordList = getWordList([...getHistory(), {word, score}]).slice(0, 3);
        aiThoughtsElement.innerText = wordList.length < 3 ? 'I may or may not know this word...' : wordList.join(', ') + '...';
    }
}

export function displayWord(word) {
    const row = document.createElement('div');
    for (let i = 0; i < 5; ++i) {
        const span = document.createElement('span');
        span.innerText = word[i];
        span.className = buttons[i].className;
        row.appendChild(span);
    }
    boardElement.appendChild(row);
}

export function putWordOnButtons(word, history) {
    for (let i = 0; i < 5; ++i) {
        buttons[i].innerText = word[i];
        buttons[i].className = '';

        if (history !== undefined) {
            for (const {word: text, score} of history) {
                if (text[i] === word[i] && score[i] === 'green') {
                    buttons[i].className = 'green';
                    buttons[i].disabled = true;
                    break;
                }
            }
        }
    }
}

export function getWordFromButtons() {
    return buttons.map(button => button.innerText).join('');
}

export function getScoreFromButtons() {
    return buttons.map(button => button.className);
}

export function getHistory() {
    const result = [];
    for (const element of boardElement.childNodes) {
        result.push({
            word: element.innerText,
            score: Array.from(element.childNodes).map(el => el.className),
        });
    }
    return result;
}

function getMessage(score) {
    if (score === 0) return 'Try again tomorrow.';
    if (score <= 3) return 'Better than losing!';
    if (score <= 5) return 'Not bad!';
    if (score <= 7) return 'Good!';
    if (score <= 9) return 'Great!';
    if (score <= 11) return 'Amazing!';
    if (score <= 13) return 'Incredible!!';
    return 'Genius!!!';
}

function updateTimeLeft() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const totalSeconds = Math.floor((tomorrow - new Date()) / 1000);
    if (totalSeconds <= 0) {
        timeLeftElement.innerText = 'Refresh for next game!';
        return true;
    }

    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor((totalSeconds % 3600) % 60).toString().padStart(2, '0');
    timeLeftElement.innerHTML = `Next Game: <strong>${hours}:${minutes}:${seconds}</strong>`;
}

function gameOver(win) {
    const score = win ? boardElement.childNodes.length : 0;
    gtag('event', 'post_score', {score});

    gameOverReasonElement.innerText = win ? 'The AI guessed your word!' : 'You made the game impossible.';
    gameOverElement.className = 'shown';
    gameOverElement.firstElementChild.style.color = win ? 'green' : 'red';
    shareButtonElement.tabIndex = 0;
    scoreElement.innerText = score.toString();
    messageElement.innerText = getMessage(score);
    controlsElement.className = 'hidden';
    controlsElement.querySelectorAll('button').forEach(button => button.tabIndex = -1);
    whyDidILosePopupButtonElement.style.display = win ? 'none' : 'unset';
    whyDidILosePopupButtonElement.tabIndex = win ? -1 : 0;
    tooltipElement.tabIndex = 0;
    settingsButtonElement.focus();

    if (score > Number(getStorage('high-score'))) setStorage('high-score', score.toString());
    highScoreElement.innerText = getStorage('high-score') ?? 'Unavailable';

    updateTimeLeft();
    updateAIThoughts();
    const interval = setInterval(() => {
        if (updateTimeLeft()) clearInterval(interval);
    }, 1000);
}


function getWordList(history) {
    const {allowedLetters, requiredLetters} = getAllowedAndRequiredLetters(history);
    return allWords.filter(word => wordIsValid(word, history, allowedLetters, requiredLetters));
}

function chooseWord(history) {
    const wordList = getWordList(history);
    const generator = new Random((puzzleNumber * 100) + history.length);
    for (const word of wordList) if (generator.random() < Math.max(3 / wordList.length, 0.1)) return word;
    return randomChoice(generator, wordList);
}

export function chooseWordAndUpdateLettersLeft(generator, history, first) {
    const word = first ? randomChoice(generator, firstWords) : chooseWord(history);

    if (!word) gameOver(false);

    const yellowLetters = new Set();
    const greenLetters = new Set();
    const usedLetters = new Set();

    for (const {word: historyWord, score} of history.concat(word ? [{word, score: ['', '', '', '', '']}] : [])) {
        for (let i = 0; i < 5; ++i) {
            if (score[i] === 'yellow') yellowLetters.add(historyWord[i]);
            else if (score[i] === 'green') greenLetters.add(historyWord[i]);
            else usedLetters.add(historyWord[i]);
        }
    }

    keyboardElement.querySelectorAll('span').forEach(span => {
        if (greenLetters.has(span.innerText)) span.className = 'letter-green';
        else if (yellowLetters.has(span.innerText)) span.className = 'letter-yellow';
        else if (usedLetters.has(span.innerText)) span.className = 'letter-used';
        else span.className = 'letter';
    });

    return word;
}

export function updateWhyDidILose() {
    const thinkingOf = whyDidILoseInputElement.value.toUpperCase();
    if (thinkingOf.length !== 5) return whyDidILoseOutputElement.innerText = `"${thinkingOf}" is not 5 characters long.`;
    if (!allWords.includes(thinkingOf)) return whyDidILoseOutputElement.innerText = `"${thinkingOf}" is not in the dictionary.`;

    whyDidILoseOutputElement.innerText = getReasonForLoss(getHistory(), thinkingOf, highContrastModeElement.checked);
}

export function hidePopups() {
    highContrastModeElement.tabIndex = -1;
    highContrastModeElement.parentElement.parentElement.nextElementSibling.tabIndex = -1;
    tooltipPopupElement.querySelector('.done-button').tabIndex = -1;
    tooltipPopupElement.querySelector('h2').tabIndex = -1;
    whyDidILoseInputElement.tabIndex = -1;
    whyDidILoseButtonElement.tabIndex = -1;
    whyDidILosePopupElement.querySelector('.done-button').tabIndex = -1;

    if (document.activeElement.className === 'done-button') settingsButtonElement.focus();

    tooltipPopupElement.className = 'hidden popup';
    settingsPopupElement.className = 'hidden popup';
    whyDidILosePopupElement.className = 'hidden popup';
}

function randomChoice(generator, array) {
    return array[Math.floor(generator.random() * array.length)];
}

export function loadFromHistory(history) {
    for (const {word, score} of history) {
        buttons.forEach((button, index) => button.className = score[index]);
        displayWord(word);
    }
}

export function setStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Do nothing.
    }
}

export function getStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return undefined;
    }
}

export function removeStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch {
        // Do nothing.
    }
}
