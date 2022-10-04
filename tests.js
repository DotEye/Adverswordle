import {getAllowedAndRequiredLetters, getReasonForLoss, validSubmission, wordIsValid} from './src/exposedForTesting.js';
import {WHY_DID_I_LOSE_MESSAGES} from './src/constants.js';

describe('validSubmission', () => {
    it('should allow anything on empty history', () => {
        expect(validSubmission('TESTS', ['', '', '', '', ''], [])).toBe(true);
        expect(validSubmission('TESTS', ['green', '', '', 'yellow', ''], [])).toBe(true);
    });

    it('should ensure green letters stay green', () => {
        expect(validSubmission('AZYXW', ['green', '', '', '', ''], [{word: 'ABCDE', score: ['green', '', '', '', '']}])).toBe(true);
        expect(validSubmission('AZYXW', ['', '', '', '', ''], [{word: 'ABCDE', score: ['green', '', '', '', '']}])).toBe(false);
        expect(validSubmission('AZYXW', ['yellow', '', '', '', ''], [{word: 'ABCDE', score: ['green', '', '', '', '']}])).toBe(false);
    });

    it('should ensure yellow letters are included in the word', () => {
        expect(validSubmission('ZYAXW', ['', '', 'yellow', '', ''], [{word: 'ABCDE', score: ['yellow', '', '', '', '']}])).toBe(true);
        expect(validSubmission('ZYAXW', ['', '', 'green', '', ''], [{word: 'ABCDE', score: ['yellow', '', '', '', '']}])).toBe(true);
        expect(validSubmission('ZYAXW', ['green', '', 'yellow', '', ''], [{word: 'ABCDE', score: ['yellow', '', '', '', '']}])).toBe(true);
        expect(validSubmission('ZYAXW', ['green', '', '', '', ''], [{word: 'ABCDE', score: ['yellow', '', '', '', '']}])).toBe(false);
        expect(validSubmission('ZYAXW', ['', '', '', '', ''], [{word: 'ABCDE', score: ['yellow', '', '', '', '']}])).toBe(false);
    });

    it('should ensure multiple yellow letters are all included in the word', () => {
        expect(validSubmission('ZAAYX', ['', 'yellow', 'yellow', '', ''], [{word: 'ABCDA', score: ['yellow', '', '', '', 'yellow']}])).toBe(true);
        expect(validSubmission('ZAAYX', ['', 'green', 'yellow', '', ''], [{word: 'ABCDA', score: ['yellow', '', '', '', 'yellow']}])).toBe(true);
        expect(validSubmission('ZAAYX', ['', 'green', 'green', '', ''], [{word: 'ABCDA', score: ['yellow', '', '', '', 'yellow']}])).toBe(true);
        expect(validSubmission('ZAAYX', ['', 'word', '', '', ''], [{word: 'ABCDA', score: ['yellow', '', '', '', 'yellow']}])).toBe(false);
        expect(validSubmission('ZAAYX', ['', 'green', '', '', ''], [{word: 'ABCDA', score: ['yellow', '', '', '', 'yellow']}])).toBe(false);
        expect(validSubmission('ZAAYX', ['', '', '', '', ''], [{word: 'ABCDA', score: ['yellow', '', '', '', 'yellow']}])).toBe(false);
    });
});

describe('wordIsValid', () => {
    it('should allow anything on empty history', () => {
        let history, data;
        history = []; data = getAllowedAndRequiredLetters(history);
        expect(wordIsValid('TESTS', history, data.allowedLetters, data.requiredLetters)).toBe(true);
    });

    it('should respect green letters', () => {
        let history, data;
        history = [{word: 'ABCDE', score: ['green', '', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
        expect(wordIsValid('AWXYZ', history, data.allowedLetters, data.requiredLetters)).toBe(true);
        history = [{word: 'ABCDE', score: ['green', 'green', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
        expect(wordIsValid('ABXYZ', history, data.allowedLetters, data.requiredLetters)).toBe(true);
        history = [{word: 'ABCDE', score: ['green', '', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
        expect(wordIsValid('WAXYZ', history, data.allowedLetters, data.requiredLetters)).toBe(false);
        history = [{word: 'ABCDE', score: ['green', '', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
        expect(wordIsValid('WBXYZ', history, data.allowedLetters, data.requiredLetters)).toBe(false);
        history = [{word: 'ABCDE', score: ['green', 'green', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
        expect(wordIsValid('AXBYZ', history, data.allowedLetters, data.requiredLetters)).toBe(false);
    });

    it('should respect yellow letters', () => {
        let history, data;
        history = [{word: 'ABCDE', score: ['yellow', '', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
        expect(wordIsValid('WAXYZ', history, data.allowedLetters, data.requiredLetters)).toBe(true);
        history = [{word: 'ABCDE', score: ['yellow', '', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
        expect(wordIsValid('AWXYZ', history, data.allowedLetters, data.requiredLetters)).toBe(false);
    });

    it('should respect multiple yellow letters', () => {
        let history, data;
        history = [{word: 'ABCDE', score: ['yellow', 'yellow', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
        expect(wordIsValid('XYZBA', history, data.allowedLetters, data.requiredLetters)).toBe(true);
        history = [{word: 'ABCDE', score: ['yellow', 'yellow', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
        expect(wordIsValid('BAXYZ', history, data.allowedLetters, data.requiredLetters)).toBe(true);
        history = [{word: 'ABCDE', score: ['yellow', 'yellow', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
        expect(wordIsValid('BXAYZ', history, data.allowedLetters, data.requiredLetters)).toBe(true);
        history = [{word: 'ABCDE', score: ['yellow', 'yellow', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
        expect(wordIsValid('AXBYZ', history, data.allowedLetters, data.requiredLetters)).toBe(false);
    });

    it('should handle yellow on duplicate letters', () => {
        let history, data;
        history = [{word: 'AACDE', score: ['yellow', 'yellow', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
        expect(wordIsValid('XYAAZ', history, data.allowedLetters, data.requiredLetters)).toBe(true);
        history = [{word: 'AACDE', score: ['yellow', '', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
        expect(wordIsValid('XYAAZ', history, data.allowedLetters, data.requiredLetters)).toBe(true);
        history = [{word: 'AACDE', score: ['yellow', '', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
        expect(wordIsValid('WXAYZ', history, data.allowedLetters, data.requiredLetters)).toBe(true);
        history = [{word: 'AACDE', score: ['', 'yellow', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
        expect(wordIsValid('WXAYZ', history, data.allowedLetters, data.requiredLetters)).toBe(true);
        history = [{word: 'AACDE', score: ['', 'yellow', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
        expect(wordIsValid('AWXYZ', history, data.allowedLetters, data.requiredLetters)).toBe(false);
        history = [{word: 'AACDE', score: ['yellow', '', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
        expect(wordIsValid('AWXYZ', history, data.allowedLetters, data.requiredLetters)).toBe(false);
    });

    it('should look back multiple rows for yellow letters', () => {
        let history, data;
        history = [{word: 'ABCDE', score: ['yellow', '', '', '', '']}, {word: 'GAHIJ', score: ['', 'yellow', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
        expect(wordIsValid('WXYZA', history, data.allowedLetters, data.requiredLetters)).toBe(true);
        history = [{word: 'ABCDE', score: ['yellow', '', '', '', '']}, {word: 'GAHIJ', score: ['', 'yellow', '', '', '']}]; data = getAllowedAndRequiredLetters(history);
        expect(wordIsValid('AWXYZ', history, data.allowedLetters, data.requiredLetters)).toBe(false);
    });

    it('should handle miscellaneous cases', () => {
        let history, data;
        history = [{word: 'SHOOT', score: ['green', 'green', 'green', '', 'green']}]; data = getAllowedAndRequiredLetters(history);
        expect(wordIsValid('SHORT', history, data.allowedLetters, data.requiredLetters)).toBe(true);
        history = [{word: 'BCAAD', score: ['', '', 'green', 'yellow', '']}]; data = getAllowedAndRequiredLetters(history);
        expect(wordIsValid('WXAYZ', history, data.allowedLetters, data.requiredLetters)).toBe(false);
    });
});

describe('getReasonForLoss', () => {
    const makeReason = (thinkingOf, cardinality, letter, word, emoji) => `For "${thinkingOf}" to be a valid word, the ${cardinality}"${letter}" in "${word}" should have been ${emoji === '🟩' ? WHY_DID_I_LOSE_MESSAGES.green : emoji === '🟨' ? WHY_DID_I_LOSE_MESSAGES.yellow : WHY_DID_I_LOSE_MESSAGES['']} (${emoji}).`

    it('should handle basic calls', () => {
        let history;
        history = [{word: 'ABCDE', score: ['green', 'green', 'green', 'green', 'green']}];
        expect(getReasonForLoss(history, 'BCDEF')).toBe(makeReason('BCDEF', '', 'A', 'ABCDE', '⬛'));
        history = [{word: 'ABCDE', score: ['green', 'green', 'green', 'green', 'green']}];
        expect(getReasonForLoss(history, 'BACDE')).toBe(makeReason('BACDE', '', 'A', 'ABCDE', '🟨'));
        history = [{word: 'ABCDE', score: ['', 'green', 'green', 'green', 'green']}];
        expect(getReasonForLoss(history, 'ACDEF')).toBe(makeReason('ACDEF', '', 'A', 'ABCDE', '🟩'));
    });

    it('should handle duplicate letters', () => {
        let history;
        history = [{word: 'PLAZA', score: ['', '', 'yellow', '', '']}, {word: 'KABAR', score: ['', 'yellow', '', '', 'yellow']}];
        expect(getReasonForLoss(history, 'MARCH')).toBe(makeReason('MARCH', '1st ', 'A', 'KABAR', '🟩'));
        history = [{word: 'PLAAA', score: ['', '', 'yellow', 'yellow', '']}, {word: 'AABZR', score: ['yellow', 'yellow', '', '', '']}];
        expect(getReasonForLoss(history, 'MARCH')).toBe(makeReason('MARCH', '2nd ', 'A', 'PLAAA', '⬛'));
        history = [{word: 'PLAZA', score: ['', '', '', '', 'yellow']}];
        expect(getReasonForLoss(history, 'AABCD')).toBe(makeReason('AABCD', '1st ', 'A', 'PLAZA', '🟨'));
        history = [{word: 'BANAL', score: ['green', 'yellow', '', '', 'yellow']}];
        expect(getReasonForLoss(history, 'BYLAW')).toBe(makeReason('BYLAW', '2nd ', 'A', 'BANAL', '🟩'));
        history = [{word: 'AANAA', score: ['yellow', 'yellow', '', '', '']}];
        expect(getReasonForLoss(history, 'BBBAA')).toBe(makeReason('BBBAA', '3rd ', 'A', 'AANAA', '🟩'));
        history = [{word: 'AANAA', score: ['', '', '', 'yellow', 'yellow']}];
        expect(getReasonForLoss(history, 'AABBB')).toBe(makeReason('AABBB', '1st ', 'A', 'AANAA', '🟩'));
        history = [{word: 'SORES', score: ['', 'green', 'green', '', 'green']}, {word: 'WORDS', score: ['', 'green', 'green', '', 'green']}];
        expect(getReasonForLoss(history, 'WORDS')).toBe(makeReason('WORDS', '', 'W', 'WORDS', '🟩'));
    });
});
