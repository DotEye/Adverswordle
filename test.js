// Run tests using `./runTests.sh`;

function assert(func, expected, ...params) {
    const actual = func(...params);
    console.assert(expected === actual, `${func.name}(${JSON.stringify(params).slice(1, -1)}) === ${actual} (Expected ${expected}).`);
}

/*
 * validSubmission
 */

// Should allow anything on empty history.
assert(validSubmission, true, 'TESTS', ['', '', '', '', ''], []);
assert(validSubmission, true, 'TESTS', ['green', '', '', 'yellow', ''], []);

// Green letters must stay green.
assert(validSubmission, true, 'AZYXW', ['green', '', '', '', ''], [{word: 'ABCDE', score: ['green', '', '', '', '']}]);
assert(validSubmission, false, 'AZYXW', ['', '', '', '', ''], [{word: 'ABCDE', score: ['green', '', '', '', '']}]);
assert(validSubmission, false, 'AZYXW', ['yellow', '', '', '', ''], [{word: 'ABCDE', score: ['green', '', '', '', '']}]);

// Yellow letters must be included in the word.
assert(validSubmission, true, 'ZYAXW', ['', '', 'yellow', '', ''], [{word: 'ABCDE', score: ['yellow', '', '', '', '']}]);
assert(validSubmission, true, 'ZYAXW', ['', '', 'green', '', ''], [{word: 'ABCDE', score: ['yellow', '', '', '', '']}]);
assert(validSubmission, true, 'ZYAXW', ['green', '', 'yellow', '', ''], [{word: 'ABCDE', score: ['yellow', '', '', '', '']}]);
assert(validSubmission, false, 'ZYAXW', ['green', '', '', '', ''], [{word: 'ABCDE', score: ['yellow', '', '', '', '']}]);
assert(validSubmission, false, 'ZYAXW', ['', '', '', '', ''], [{word: 'ABCDE', score: ['yellow', '', '', '', '']}]);

// Multiple yellow letters must all be included in the word.
assert(validSubmission, true, 'ZAAYX', ['', 'yellow', 'yellow', '', ''], [{word: 'ABCDA', score: ['yellow', '', '', '', 'yellow']}]);
assert(validSubmission, true, 'ZAAYX', ['', 'green', 'yellow', '', ''], [{word: 'ABCDA', score: ['yellow', '', '', '', 'yellow']}]);
assert(validSubmission, true, 'ZAAYX', ['', 'green', 'green', '', ''], [{word: 'ABCDA', score: ['yellow', '', '', '', 'yellow']}]);
assert(validSubmission, false, 'ZAAYX', ['', 'word', '', '', ''], [{word: 'ABCDA', score: ['yellow', '', '', '', 'yellow']}]);
assert(validSubmission, false, 'ZAAYX', ['', 'green', '', '', ''], [{word: 'ABCDA', score: ['yellow', '', '', '', 'yellow']}]);
assert(validSubmission, false, 'ZAAYX', ['', '', '', '', ''], [{word: 'ABCDA', score: ['yellow', '', '', '', 'yellow']}]);

/*
 * wordIsValid
 */

let history, data;

// Should allow anything on empty history.
history = []; data = getAllowedAndRequiredLetters(history);
assert(wordIsValid, true, 'TESTS', history, data.allowedLetters, data.requiredLetters);

// Should respect green letters.
history = [{word: 'ABCDE', score: ['green', '', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
assert(wordIsValid, true, 'AWXYZ', history, data.allowedLetters, data.requiredLetters);
history = [{word: 'ABCDE', score: ['green', 'green', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
assert(wordIsValid, true, 'ABXYZ', history, data.allowedLetters, data.requiredLetters);
history = [{word: 'ABCDE', score: ['green', '', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
assert(wordIsValid, false, 'WAXYZ', history, data.allowedLetters, data.requiredLetters);
history = [{word: 'ABCDE', score: ['green', '', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
assert(wordIsValid, false, 'WBXYZ', history, data.allowedLetters, data.requiredLetters);
history = [{word: 'ABCDE', score: ['green', 'green', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
assert(wordIsValid, false, 'AXBYZ', history, data.allowedLetters, data.requiredLetters);

// Should respect yellow letters.
history = [{word: 'ABCDE', score: ['yellow', '', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
assert(wordIsValid, true, 'WAXYZ', history, data.allowedLetters, data.requiredLetters);
history = [{word: 'ABCDE', score: ['yellow', '', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
assert(wordIsValid, false, 'AWXYZ', history, data.allowedLetters, data.requiredLetters);

// Should respect multiple yellow letters.
history = [{word: 'ABCDE', score: ['yellow', 'yellow', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
assert(wordIsValid, true, 'XYZBA', history, data.allowedLetters, data.requiredLetters);
history = [{word: 'ABCDE', score: ['yellow', 'yellow', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
assert(wordIsValid, true, 'BAXYZ', history, data.allowedLetters, data.requiredLetters);
history = [{word: 'ABCDE', score: ['yellow', 'yellow', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
assert(wordIsValid, true, 'BXAYZ', history, data.allowedLetters, data.requiredLetters);
history = [{word: 'ABCDE', score: ['yellow', 'yellow', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
assert(wordIsValid, false, 'AXBYZ', history, data.allowedLetters, data.requiredLetters);

// Should handle yellow on duplicate letters.
history = [{word: 'AACDE', score: ['yellow', 'yellow', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
assert(wordIsValid, true, 'XYAAZ', history, data.allowedLetters, data.requiredLetters);
history = [{word: 'AACDE', score: ['yellow', '', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
assert(wordIsValid, true, 'XYAAZ', history, data.allowedLetters, data.requiredLetters);
history = [{word: 'AACDE', score: ['yellow', '', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
assert(wordIsValid, true, 'WXAYZ', history, data.allowedLetters, data.requiredLetters);
history = [{word: 'AACDE', score: ['', 'yellow', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
assert(wordIsValid, true, 'WXAYZ', history, data.allowedLetters, data.requiredLetters);
history = [{word: 'AACDE', score: ['', 'yellow', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
assert(wordIsValid, false, 'AWXYZ', history, data.allowedLetters, data.requiredLetters);
history = [{word: 'AACDE', score: ['yellow', '', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
assert(wordIsValid, false, 'AWXYZ', history, data.allowedLetters, data.requiredLetters);

// Should look back multiple rows for yellow letters.
history = [{word: 'ABCDE', score: ['yellow', '', '', '', '']}, {word: 'GAHIJ', score: ['', 'yellow', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
assert(wordIsValid, true, 'WXYZA', history, data.allowedLetters, data.requiredLetters);
history = [{word: 'ABCDE', score: ['yellow', '', '', '', '']}, {word: 'GAHIJ', score: ['', 'yellow', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
assert(wordIsValid, false, 'AWXYZ', history, data.allowedLetters, data.requiredLetters);

// Misc cases.
history = [{word: 'SHOOT', score: ['green', 'green', 'green', '', 'green']}]; data = getAllowedAndRequiredLetters(history);
assert(wordIsValid, true, 'SHORT', history, data.allowedLetters, data.requiredLetters);
history = [{word: 'BCAAD', score: ['', '', 'green', 'yellow', '']}]; data = getAllowedAndRequiredLetters(history);
assert(wordIsValid, false, 'WXAYZ', history, data.allowedLetters, data.requiredLetters);

/*
 * getReasonForLoss
 */

getEmoji = (color) => color === 'yellow' ? '🟨' : color === 'green' ? '🟩' : '⬛';
makeReason = (thinkingOf, cardinality, letter, word, emoji) => `For "${thinkingOf}" to be a valid word, the ${cardinality}"${letter}" in "${word}" should have been ${emoji === '🟩' ? WHY_DID_I_LOSE_MESSAGES.green : emoji === '🟨' ? WHY_DID_I_LOSE_MESSAGES.yellow : WHY_DID_I_LOSE_MESSAGES['']} (${emoji}).`

// Basic tests.
history = [{word: 'ABCDE', score: ['green', 'green', 'green', 'green', 'green']}];
assert(getReasonForLoss, makeReason('BCDEF', '', 'A', 'ABCDE', '⬛'), history, 'BCDEF');
history = [{word: 'ABCDE', score: ['green', 'green', 'green', 'green', 'green']}];
assert(getReasonForLoss, makeReason('BACDE', '', 'A', 'ABCDE', '🟨'), history, 'BACDE');
history = [{word: 'ABCDE', score: ['', 'green', 'green', 'green', 'green']}];
assert(getReasonForLoss, makeReason('ACDEF', '', 'A', 'ABCDE', '🟩'), history, 'ACDEF');

// Duplicate letters.
history = [{word: 'PLAZA', score: ['', '', 'yellow', '', '']}, {word: 'KABAR', score: ['', 'yellow', '', '', 'yellow']}];
assert(getReasonForLoss, makeReason('MARCH', '1st ', 'A', 'KABAR', '🟩'), history, 'MARCH');
history = [{word: 'PLAAA', score: ['', '', 'yellow', 'yellow', '']}, {word: 'AABZR', score: ['yellow', 'yellow', '', '', '']}];
assert(getReasonForLoss, makeReason('MARCH', '2nd ', 'A', 'PLAAA', '⬛'), history, 'MARCH');
history = [{word: 'PLAZA', score: ['', '', '', '', 'yellow']}];
assert(getReasonForLoss, makeReason('AABCD', '1st ', 'A', 'PLAZA', '🟨'), history, 'AABCD');
history = [{word: 'BANAL', score: ['green', 'yellow', '', '', 'yellow']}];
assert(getReasonForLoss, makeReason('BYLAW', '2nd ', 'A', 'BANAL', '🟩'), history, 'BYLAW');
history = [{word: 'AANAA', score: ['yellow', 'yellow', '', '', '']}];
assert(getReasonForLoss, makeReason('BBBAA', '3rd ', 'A', 'AANAA', '🟩'), history, 'BBBAA');
history = [{word: 'AANAA', score: ['', '', '', 'yellow', 'yellow']}];
assert(getReasonForLoss, makeReason('AABBB', '1st ', 'A', 'AANAA', '🟩'), history, 'AABBB');
history = [{word: 'SORES', score: ['', 'green', 'green', '', 'green']}, {word: 'WORDS', score: ['', 'green', 'green', '', 'green']}];
assert(getReasonForLoss, makeReason('WORDS', '', 'W', 'WORDS', '🟩'), history, 'WORDS');
