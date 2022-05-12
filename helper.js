const LETTERS = ['A',  'B',  'C',  'D',  'E',  'F',  'G',  'H',  'I',  'J',  'K',  'L',  'M',  'N',  'O',  'P',  'Q',  'R',  'S',  'T',  'U',  'V',  'W',  'X',  'Y',  'Z'];
const WHY_DID_I_LOSE_MESSAGES = {
    'green': 'scored as in the correct position',
    'yellow': 'scored as in the word but not in the correct position',
    '': 'left blank',
};
const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th'];

function wrapWithSpoilers(text, spoilerType) {
    switch (spoilerType) {
        case 'Discord Spoilers':
            return `||${text}||`;
        case 'Reddit Spoilers':
            return `>!${text}!<`;
        default:
            return text;
    }
}

function wrapWithBold(text, spoilerType) {
    switch (spoilerType) {
        case 'Discord Spoilers':
        case 'Reddit Spoilers':
            return `**${text}**`;
        default:
            return text;
    }
}

function wrapWithHeader(text, spoilerType) {
    switch (spoilerType) {
        case 'Discord Spoilers':
            return `**${text}**`;
        case 'Reddit Spoilers':
            return `###${text}`;
        default:
            return text;
    }
}

function shareText(text, spoilerType) {
    if (isMobileOrTablet() && navigator.share) {
        navigator.share({
            title: 'Adverswordle',
            text,
        }).then(
            () => gtag('event', 'share', {method: 'Browser', content_type: spoilerType})
        ).catch(() => copyToClipboard(text, spoilerType));
    } else {
        copyToClipboard(text, spoilerType);
    }
}

function copyToClipboard(text, spoilerType) {
    navigator.clipboard.writeText(text).then(() => {
        shareButtonElement.firstElementChild.innerText = 'Copied!';
        setTimeout(() => shareButtonElement.firstElementChild.innerText = 'Share', 2000);
        gtag('event', 'share', {method: 'Clipboard', content_type: spoilerType});
    }).catch(() => alert('Sharing failed or was cancelled.'));
}

function hideTutorial() {
    tutorialElement.style.opacity = '0';
}

function finishWordUpdate(history) {
    if (history.some(({score}) => score.every(letter => letter === 'green'))) {
        gameOver(true);
        return;
    }

    const word = chooseWordAndUpdateLettersLeft(history);
    if (word) {
        putWordOnButtons(word, history);
        submitButtonElement.disabled = !validSubmission(word, getScoreFromButtons(), history);
        updateAIThoughts();
    }
}

function getEmoji(color) {
    return color === 'yellow'
        ? (highContrastModeElement.checked ? '🟦' : '🟨')
        : color === 'green'
            ? (highContrastModeElement.checked ? '🟧' : '🟩')
            : '⬛';
}

function updateAIThoughts() {
    if (gameOverElement.className === 'shown') {
        Math.seedrandom((puzzleNumber * 100) + getHistory().length);
        aiThoughtsElement.innerText = randomChoice([
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

function validSubmission(word, score, history) {
    if (history.length === 0) return true;
    const {word: historyWord, score: historyScore} = history[history.length - 1];

    const yellows = Object.fromEntries(Array.from(word + historyWord).map(letter => [letter, 0]));
    for (let i = 0; i < 5; ++i) {
        if (historyScore[i] === 'green' && score[i] !== 'green') return false;
        if (historyScore[i] === 'yellow') yellows[historyWord[i]]++;
        if (score[i] !== '') yellows[word[i]]--;
    }

    return !Object.values(yellows).some(value => value > 0);
}

function displayWord(word) {
    const row = document.createElement('div');
    for (let i = 0; i < 5; ++i) {
        const span = document.createElement('span');
        span.innerText = word[i];
        span.className = buttons[i].className;
        row.appendChild(span);
    }
    boardElement.appendChild(row);
}

function putWordOnButtons(word, history) {
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

function getWordFromButtons() {
    return buttons.map(button => button.innerText).join('');
}

function getScoreFromButtons() {
    return buttons.map(button => button.className);
}

function getHistory() {
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
    scoreElement.innerText = score.toString();
    messageElement.innerText = getMessage(score);
    controlsElement.className = 'hidden';
    whyDidILosePopupButtonElement.style.display = win ? 'none' : 'unset';

    if (score > Number(getStorage('high-score'))) setStorage('high-score', score.toString());
    highScoreElement.innerText = getStorage('high-score') ?? 'Unavailable';

    updateTimeLeft();
    updateAIThoughts();
    const interval = setInterval(() => {
        if (updateTimeLeft()) clearInterval(interval);
    }, 1000);
}

function removeIfExists(array, element) {
    const index = array.indexOf(element);
    if (index !== -1) array.splice(index, 1);
}

function getAllowedAndRequiredLetters(history) {
    const allowedLetters = [[...LETTERS], [...LETTERS], [...LETTERS], [...LETTERS], [...LETTERS]];
    const requiredLetters = [];
    for (const [index, {word: historyWord, score}] of Object.entries(history)) {
        for (let i = 0; i < 5; ++i) {
            if (score[i] === 'green') {
                allowedLetters[i] = [historyWord[i]];
                if (Number(index) === history.length - 1) requiredLetters.push(historyWord[i]);
            } else if (score[i] === 'yellow') {
                removeIfExists(allowedLetters[i], historyWord[i]);
                if (Number(index) === history.length - 1) requiredLetters.push(historyWord[i]);
            } else {
                if (Array.from(historyWord).some((letter, index) => score[index] === 'yellow' && letter === historyWord[i])) {
                    removeIfExists(allowedLetters[i], historyWord[i]);
                } else {
                    allowedLetters.forEach((array, index) => {
                        if (score[index] !== 'green') removeIfExists(array, historyWord[i]);
                    });
                }
            }
        }
    }

    return {allowedLetters, requiredLetters};
}

function wordIsValid(word, history, allowedLetters, requiredLetters) {
    requiredLetters = [...requiredLetters];
    if (history.length === 0) return true;

    for (let i = 0; i < 5; ++i) {
        if (!allowedLetters[i].includes(word[i])) return false;
        if (requiredLetters.includes(word[i])) removeIfExists(requiredLetters, word[i]);
    }

    return requiredLetters.length === 0;
}

function getWordList(history) {
    const {allowedLetters, requiredLetters} = getAllowedAndRequiredLetters(history);
    return allWords.filter(word => wordIsValid(word, history, allowedLetters, requiredLetters));
}

function chooseWord(history) {
    const wordList = getWordList(history);
    Math.seedrandom((puzzleNumber * 100) + history.length);
    for (const word of wordList) if (Math.random() < Math.max(3 / wordList.length, 0.1)) return word;
    return randomChoice(wordList);
}

function chooseWordAndUpdateLettersLeft(history, first) {
    const word = first ? randomChoice(firstWords) : chooseWord(history);

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

function getReasonForLossForWord(word, i, thinkingOf, score) {
    if (word[i] === thinkingOf[i]) {
        if (score[i] !== 'green') return 'green';
    } else {
        if (thinkingOf.includes(word[i]) && score[i] !== 'yellow') return 'yellow';
        if (!thinkingOf.includes(word[i]) && score[i] !== '') return '';
    }
}

function getLetterOrdinality(word, index) {
    return word.split(word[index]).length > 2 ? `${ORDINALS[word.substring(0, index).split(word[index]).length - 1]} ` : '';
}

function removeCharacter(thinkingOf, character) {
    const index = thinkingOf.indexOf(character);
    return thinkingOf.substring(0, index) + ' ' + thinkingOf.substring(index + 1);
}

function getReasonForLoss(history, thinkingOf) {
    for (const {word, score} of history) {
        let tempThinkingOf = thinkingOf;
        for (let i = 0; i < 5; ++i) {
            if (word[i] === thinkingOf[i] && score[i] !== 'green') {
                tempThinkingOf = removeCharacter(tempThinkingOf, word[i]);
                return `For "${thinkingOf}" to be a valid word, the ${getLetterOrdinality(word, i)}"${word[i]}" in "${word}" should have been ${WHY_DID_I_LOSE_MESSAGES.green} (${getEmoji('green')}).`;
            }
        }
        for (let i = 0; i < 5; ++i) {
            const result = getReasonForLossForWord(word, i, tempThinkingOf, score);
            if (score[i] !== '') tempThinkingOf = removeCharacter(tempThinkingOf, word[i]);
            if (result !== undefined) return `For "${thinkingOf}" to be a valid word, the ${getLetterOrdinality(word, i)}"${word[i]}" in "${word}" should have been ${WHY_DID_I_LOSE_MESSAGES[result]} (${getEmoji(result)}).`;
        }
    }
}

function updateWhyDidILose() {
    const thinkingOf = whyDidILoseInputElement.value.toUpperCase();
    if (thinkingOf.length !== 5) return whyDidILoseOutputElement.innerText = `"${thinkingOf}" is not 5 characters long.`;
    if (!allWords.includes(thinkingOf)) return whyDidILoseOutputElement.innerText = `"${thinkingOf}" is not in the dictionary.`;

    whyDidILoseOutputElement.innerText = getReasonForLoss(getHistory(), thinkingOf);
}


function hidePopups() {
    tooltipPopupElement.className = 'hidden popup';
    settingsPopupElement.className = 'hidden popup';
    whyDidILosePopupElement.className = 'hidden popup';
}

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function loadFromHistory(history) {
    for (const {word, score} of history) {
        buttons.forEach((button, index) => button.className = score[index]);
        displayWord(word);
    }
}

function setStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Do nothing.
    }
}

function getStorage(key) {
    try {
        return localStorage.getItem(key)
    } catch {
        return undefined;
    }
}

function removeStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch {
        // Do nothing.
    }
}
