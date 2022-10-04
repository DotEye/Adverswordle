const launchDate = new Date(2022, 2, 5, 0, 0, 0, 0);
const now = new Date();
const launchDateTimezoneOffset = launchDate.getTimezoneOffset();
const nowTimezoneOffset = now.getTimezoneOffset();
export const puzzleNumber = Math.floor(((now - launchDate) + ((launchDateTimezoneOffset - nowTimezoneOffset) * 60000)) / (24 * 60 * 60 * 1000));
export const letterColors = ['', 'yellow', 'green'];
export const LETTERS = ['A',  'B',  'C',  'D',  'E',  'F',  'G',  'H',  'I',  'J',  'K',  'L',  'M',  'N',  'O',  'P',  'Q',  'R',  'S',  'T',  'U',  'V',  'W',  'X',  'Y',  'Z'];
export const WHY_DID_I_LOSE_MESSAGES = {
    'green': 'scored as in the correct position',
    'yellow': 'scored as in the word but not in the correct position',
    '': 'left blank',
};
export const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th'];
