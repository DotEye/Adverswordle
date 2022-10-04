import {LETTERS, ORDINALS, WHY_DID_I_LOSE_MESSAGES} from './constants.js';

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

function removeCharacter(word, character) {
    const index = word.indexOf(character);
    return word.substring(0, index) + ' ' + word.substring(index + 1);
}

export function getEmoji(highContrast, color) {
    return color === 'yellow'
        ? (highContrast ? '🟦' : '🟨')
        : color === 'green'
            ? (highContrast ? '🟧' : '🟩')
            : '⬛';
}

export function removeIfExists(array, element) {
    const index = array.indexOf(element);
    if (index !== -1) array.splice(index, 1);
}

export function validSubmission(word, score, history) {
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

export function wordIsValid(word, history, allowedLetters, requiredLetters) {
    requiredLetters = [...requiredLetters];
    if (history.length === 0) return true;

    for (let i = 0; i < 5; ++i) {
        if (!allowedLetters[i].includes(word[i])) return false;
        if (requiredLetters.includes(word[i])) removeIfExists(requiredLetters, word[i]);
    }

    return requiredLetters.length === 0;
}

export function getReasonForLoss(history, thinkingOf, highContrast) {
    for (const {word, score} of history) {
        let tempThinkingOf = thinkingOf;
        for (let i = 0; i < 5; ++i) {
            if (word[i] === thinkingOf[i] && score[i] !== 'green') {
                return `For "${thinkingOf}" to be a valid word, the ${getLetterOrdinality(word, i)}"${word[i]}" in "${word}" should have been ${WHY_DID_I_LOSE_MESSAGES.green} (${getEmoji(highContrast, 'green')}).`;
            }
        }
        const results = [];
        for (let i = 0; i < 5; ++i) {
            const result = getReasonForLossForWord(word, i, tempThinkingOf, score);
            if (result !== undefined) results.push({i, result});
            if (score[i] !== '') tempThinkingOf = removeCharacter(tempThinkingOf, word[i]);
        }
        let tempWord = word;
        for (const {i, result} of results) {
            const next = tempWord.indexOf(word[i], i + 1);
            if (next !== -1 && score[next] === 'green' && result === 'yellow') {
                tempWord = removeCharacter(tempWord, word[i]);
                continue;
            }
            return `For "${thinkingOf}" to be a valid word, the ${getLetterOrdinality(word, i)}"${word[i]}" in "${word}" should have been ${WHY_DID_I_LOSE_MESSAGES[result]} (${getEmoji(highContrast, result)}).`;
        }
    }
}

export function getAllowedAndRequiredLetters(history) {
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
