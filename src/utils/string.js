/**
 * HTML Entity Decoding Utility (Server & Client Compatible)
 * Handles HTML entities from Open Trivia Database API
 */

// Common HTML entities map
const htmlEntities = {
  '&nbsp;': ' ',
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
  '&quot;': '"',
  '&apos;': "'",
  '&cent;': '¢',
  '&pound;': '£',
  '&yen;': '¥',
  '&euro;': '€',
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
  '&micro;': 'µ',
  '&para;': '¶',
  '&middot;': '·',
  '&bull;': '•',
  '&hellip;': '…',
  '&prime;': '′',
  '&Prime;': '″',
  '&OElig;': 'Œ',
  '&oelig;': 'œ',
  '&Scaron;': 'Š',
  '&scaron;': 'š',
  '&Yuml;': 'Ÿ',
  '&circ;': 'ˆ',
  '&tilde;': '˜',
  '&ndash;': '–',
  '&mdash;': '—',
  '&lsquo;': '‘',
  '&rsquo;': '’',
  '&sbquo;': '‚',
  '&ldquo;': '“',
  '&rdquo;': '”',
  '&bdquo;': '„',
  '&dagger;': '†',
  '&Dagger;': '‡',
  '&permil;': '‰',
  '&lsaquo;': '‹',
  '&rsaquo;': '›',
  '&euro;': '€',
  '#039;': "'",
  '#39;': "'",
  '#34;': '"',
  '#38;': '&',
  '#60;': '<',
  '#62;': '>',
  '#160;': ' ',
  '#8217;': "'",
  '#8220;': '"',
  '#8221;': '"',
  '#8230;': '…',
};

/**
 * Decode HTML entities to plain text
 * Works in both server-side (Node.js) and client-side (browser) environments
 * @param {string} html - HTML string with entities to decode
 * @returns {string} Decoded plain text string
 */
export const decodeHtml = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Create a regex pattern from the HTML entities
  const entityPattern = new RegExp(
    Object.keys(htmlEntities).join('|'),
    'g'
  );

  // Replace HTML entities with their actual characters
  let decoded = html.replace(entityPattern, (entity) => {
    return htmlEntities[entity] || entity;
  });

  // Handle numeric entities like &#1234;
  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(dec);
  });

  // Handle hexadecimal entities like &#x1F600;
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  return decoded;
};

/**
 * Format question text by decoding HTML entities
 * @param {string} question - Question text with possible HTML entities
 * @returns {string} Formatted and decoded question text
 */
export const formattedQuestion = (question) => {
  if (!question || typeof question !== 'string') {
    return '';
  }
  return decodeHtml(question);
};

/**
 * Decode all answers in an array
 * @param {string[]} answers - Array of answer strings
 * @returns {string[]} Array of decoded answers
 */
export const decodeAnswers = (answers) => {
  if (!Array.isArray(answers)) {
    return [];
  }
  return answers.map(answer => decodeHtml(answer));
};

/**
 * Decode all fields in a question object
 * @param {Object} questionData - Question object with HTML encoded strings
 * @returns {Object} Question object with decoded strings
 */
export const decodeQuestionData = (questionData) => {
  if (!questionData || typeof questionData !== 'object') {
    return questionData;
  }

  return {
    ...questionData,
    question: decodeHtml(questionData.question),
    correct_answer: decodeHtml(questionData.correct_answer),
    incorrect_answers: decodeAnswers(questionData.incorrect_answers),
  };
};